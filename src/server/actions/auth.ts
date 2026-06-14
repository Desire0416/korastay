"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getCurrentUser,
  homeForRole,
} from "@/lib/auth";
import { sendEmail, emailLayout, emailButton } from "@/lib/email";
import { partnerTypeMeta } from "@/lib/enums";
import { generateUniqueReferralCode, resolveReferrerId } from "@/lib/referral";
import crypto from "crypto";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  values?: Record<string, string>;
};

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// ------------------------------------------------------------
// Inscription
// ------------------------------------------------------------
// Types de compte choisis directement a l'inscription.
const ACCOUNT_TYPES = ["TRAVELER", "OWNER", "PARTNER"] as const;
const PARTNER_TYPES = ["GUIDE", "TRANSPORT", "RESTAURANT", "ACTIVITY", "OTHER"] as const;

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Prenom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(6, "Téléphone requis").optional().or(z.literal("")),
    password: z.string().min(8, "8 caractères minimum"),
    accountType: z.enum(ACCOUNT_TYPES).default("TRAVELER"),
    partnerType: z.enum(PARTNER_TYPES).optional(),
  })
  // Si l'on s'inscrit comme partenaire, le metier (type) est obligatoire.
  .refine((d) => d.accountType !== "PARTNER" || !!d.partnerType, {
    message: "Choisissez votre type de partenaire",
    path: ["partnerType"],
  });

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Valeurs ressaisies (sauf mot de passe) pour les conserver en cas d'erreur.
  const values = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    accountType: String(formData.get("accountType") ?? "TRAVELER"),
    partnerType: String(formData.get("partnerType") ?? ""),
  };

  const parsed = registerSchema.safeParse({
    ...values,
    password: formData.get("password"),
    partnerType: values.partnerType || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      fieldErrors[i.path[0] as string] = i.message;
    });
    return { ok: false, fieldErrors, error: "Veuillez corriger les champs.", values };
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    return { ok: false, error: "Un compte existe déjà avec cet email.", values };
  }

  // Parrainage : code propre au nouveau compte + lien vers le parrain si un
  // code valide a ete saisi (ou transmis via ?ref=).
  const referralCode = await generateUniqueReferralCode();
  const referredById = await resolveReferrerId(String(formData.get("referralCode") ?? ""));

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      passwordHash,
      // Le type choisi a l'inscription devient le role du compte.
      role: data.accountType,
      status: "PENDING_EMAIL_VERIFICATION",
      referralCode,
      referredById,
    },
  });

  // Inscription partenaire : on cree d'emblee le profil avec le metier choisi.
  // Il reste a verifier par un admin (verificationStatus PENDING_REVIEW par
  // defaut) avant que le partenaire puisse finaliser son onboarding.
  if (data.accountType === "PARTNER" && data.partnerType) {
    await prisma.partnerProfile.create({
      data: {
        userId: user.id,
        type: data.partnerType,
        businessName: `${data.firstName} ${data.lastName}`,
      },
    });

    // On previent les administrateurs qu'un partenaire attend une verification.
    try {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true },
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            title: "Nouveau partenaire à vérifier",
            body: `${data.firstName} ${data.lastName} (${partnerTypeMeta[data.partnerType!]?.label ?? "partenaire"}) a créé un compte. Vérifiez son profil.`,
            type: "PARTNER_SIGNUP",
            url: "/admin/partners",
          })),
        });
      }
    } catch {
      // notification best-effort : ne bloque jamais l'inscription
    }
  }

  // Token de verification
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Confirmez votre compte KoraStay",
    html: emailLayout(
      `Bienvenue ${user.firstName} !`,
      `<p>Merci d'avoir cree votre compte KoraStay. Confirmez votre adresse email pour activer votre compte.</p>${emailButton(verifyUrl, "Confirmer mon email")}<p style="font-size:13px;color:#5F6B66;">Ou copiez ce lien : ${verifyUrl}</p>`
    ),
    text: `Confirmez votre compte : ${verifyUrl}`,
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Bienvenue sur KoraStay",
      body: "Votre compte a ete créé. Confirmez votre email pour activer votre compte.",
      type: "WELCOME",
    },
  });

  // Pas de connexion immediate : le compte reste inactif tant que l'email
  // n'est pas confirme (cf. loginAction qui bloque PENDING_EMAIL_VERIFICATION).
  return {
    ok: true,
    message:
      "Votre compte a ete créé. Un email de confirmation vient de vous être envoyé : cliquez sur le lien pour activer votre compte avant de vous connecter.",
  };
}

// ------------------------------------------------------------
// Devenir proprietaire / partenaire depuis un compte DEJA connecte.
// (Les visiteurs sans compte passent par registerAction : la demande de
// devenir proprietaire/partenaire EST la creation du compte correspondant.)
// ------------------------------------------------------------
export async function becomeOwnerAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/register?type=OWNER");
  if (user.role === "OWNER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/owner");
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "OWNER" } });
  revalidatePath("/", "layout");
  redirect("/owner");
}

export async function becomePartnerAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/register?type=PARTNER");
  if (user.role === "PARTNER") redirect("/partner");

  const partnerType = String(formData.get("partnerType") ?? "");
  if (!PARTNER_TYPES.includes(partnerType as (typeof PARTNER_TYPES)[number])) {
    redirect("/partners?error=type");
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: "PARTNER" } });
  await prisma.partnerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      type: partnerType,
      businessName: `${user.firstName} ${user.lastName}`,
    },
    update: { type: partnerType },
  });
  revalidatePath("/", "layout");
  redirect("/partner-onboarding");
}

// ------------------------------------------------------------
// Connexion
// ------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Email ou mot de passe invalide." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Email ou mot de passe incorrect." };
  }
  if (user.status === "PENDING_EMAIL_VERIFICATION") {
    return {
      ok: false,
      error: "Votre compte n'est pas encore active. Confirmez votre email (vérifiez vos spams) pour vous connecter.",
      values: { email: parsed.data.email },
    };
  }
  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    return { ok: false, error: "Ce compte est suspendu. Contactez l'assistance." };
  }

  await createSession(user.id);
  const redirectParam = formData.get("redirectTo");
  const target =
    typeof redirectParam === "string" && redirectParam.startsWith("/")
      ? redirectParam
      : homeForRole(user.role);
  redirect(target);
}

// ------------------------------------------------------------
// Deconnexion
// ------------------------------------------------------------
export async function logoutAction() {
  await destroySession();
  redirect("/");
}

// Renvoi de l'email de confirmation (si le compte est encore inactif).
export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Email invalide." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "PENDING_EMAIL_VERIFICATION") {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Confirmez votre compte KoraStay",
      html: emailLayout(
        "Confirmez votre adresse email",
        `<p>Voici un nouveau lien pour activer votre compte KoraStay.</p>${emailButton(verifyUrl, "Confirmer mon email")}<p style="font-size:13px;color:#5F6B66;">Ou copiez ce lien : ${verifyUrl}</p>`
      ),
      text: `Confirmez votre compte : ${verifyUrl}`,
    });
  }
  // Reponse identique que le compte existe/soit deja actif ou non (securite).
  return { ok: true, message: "Si votre compte est en attente, un nouvel email de confirmation vient d'être envoyé." };
}

// ------------------------------------------------------------
// Verification email
// ------------------------------------------------------------
export async function verifyEmailAction(token: string): Promise<ActionState> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "Lien invalide ou expire." };
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return { ok: true, message: "Email confirmé avec succès." };
}

// ------------------------------------------------------------
// Mot de passe oublie
// ------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Email invalide." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Reponse identique que le compte existe ou non (securite)
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const url = `${APP_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reinitialisation de votre mot de passe KoraStay",
      html: emailLayout(
        "Reinitialiser votre mot de passe",
        `<p>Vous avez demande la reinitialisation de votre mot de passe.</p>${emailButton(url, "Choisir un nouveau mot de passe")}<p style="font-size:13px;color:#5F6B66;">Ce lien expire dans 1 heure. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>`
      ),
      text: `Reinitialisez votre mot de passe : ${url}`,
    });
  }

  return {
    ok: true,
    message:
      "Si un compte existe avec cet email, un lien de reinitialisation a ete envoyé.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false, error: "8 caractères minimum." };
  }
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "Lien invalide ou expire." };
  }
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  return { ok: true, message: "Mot de passe reinitialise. Vous pouvez vous connecter." };
}
