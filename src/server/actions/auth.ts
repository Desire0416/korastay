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
import { getI18n } from "@/lib/i18n.server";
import { localePath, type Locale } from "@/lib/i18n";
import type { AuthDict } from "@/lib/dictionaries/auth";
import crypto from "crypto";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  values?: Record<string, string>;
};

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Les actions sont postees sur l'URL de la page (/en/... compris) : le
// middleware y pose x-locale, donc getI18n() donne la langue de l'appelant.
// Messages, e-mails et redirections suivent cette langue.
const absUrl = (path: string, locale: Locale) => `${APP_URL}${localePath(path, locale)}`;

function confirmationEmail(
  a: AuthDict,
  locale: Locale,
  to: string,
  token: string,
  title: string,
  intro: string
) {
  const verifyUrl = absUrl(`/verify-email?token=${token}`, locale);
  return sendEmail({
    to,
    subject: a.emails.confirmSubject,
    html: emailLayout(
      title,
      `<p>${intro}</p>${emailButton(verifyUrl, a.emails.confirmButton)}<p style="font-size:13px;color:#6A6259;">${a.emails.copyLink} ${verifyUrl}</p>`,
      a.emails.footer
    ),
    text: `${a.emails.confirmText} ${verifyUrl}`,
  });
}

// ------------------------------------------------------------
// Inscription
// ------------------------------------------------------------
// Types de compte choisis directement a l'inscription.
const ACCOUNT_TYPES = ["TRAVELER", "OWNER", "PARTNER"] as const;
const PARTNER_TYPES = ["GUIDE", "TRANSPORT", "RESTAURANT", "ACTIVITY", "OTHER"] as const;

function registerSchema(m: AuthDict["messages"]) {
  return z
    .object({
      firstName: z.string().min(2, m.firstNameRequired),
      lastName: z.string().min(2, m.lastNameRequired),
      email: z.string().email(m.emailInvalid),
      phone: z.string().min(6, m.phoneRequired).optional().or(z.literal("")),
      password: z.string().min(8, m.passwordMin),
      accountType: z.enum(ACCOUNT_TYPES).default("TRAVELER"),
      partnerType: z.enum(PARTNER_TYPES).optional(),
    })
    // Si l'on s'inscrit comme partenaire, le metier (type) est obligatoire.
    .refine((d) => d.accountType !== "PARTNER" || !!d.partnerType, {
      message: m.partnerTypeRequired,
      path: ["partnerType"],
    });
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { locale, dict } = await getI18n();
  const a = dict.auth;
  // Valeurs ressaisies (sauf mot de passe) pour les conserver en cas d'erreur.
  const values = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    accountType: String(formData.get("accountType") ?? "TRAVELER"),
    partnerType: String(formData.get("partnerType") ?? ""),
  };

  const parsed = registerSchema(a.messages).safeParse({
    ...values,
    password: formData.get("password"),
    partnerType: values.partnerType || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      fieldErrors[i.path[0] as string] = i.message;
    });
    return { ok: false, fieldErrors, error: a.messages.fixFields, values };
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    return { ok: false, error: a.messages.emailTaken, values };
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
          data: admins.map((adm) => ({
            userId: adm.id,
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

  await confirmationEmail(
    a,
    locale,
    user.email,
    token,
    a.emails.confirmTitle.replace("{name}", user.firstName),
    a.emails.confirmBody
  );

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: a.messages.welcomeTitle,
      body: a.messages.welcomeBody,
      type: "WELCOME",
    },
  });

  // Pas de connexion immediate : le compte reste inactif tant que l'email
  // n'est pas confirme (cf. loginAction qui bloque PENDING_EMAIL_VERIFICATION).
  return { ok: true, message: a.messages.registered };
}

// ------------------------------------------------------------
// Devenir proprietaire / partenaire depuis un compte DEJA connecte.
// (Les visiteurs sans compte passent par registerAction : la demande de
// devenir proprietaire/partenaire EST la creation du compte correspondant.)
// ------------------------------------------------------------
export async function becomeOwnerAction(): Promise<void> {
  const { locale } = await getI18n();
  const user = await getCurrentUser();
  if (!user) redirect(localePath("/register?type=OWNER", locale));
  if (user.role === "OWNER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect(localePath("/owner", locale));
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "OWNER" } });
  revalidatePath("/", "layout");
  redirect(localePath("/owner", locale));
}

export async function becomePartnerAction(formData: FormData): Promise<void> {
  const { locale } = await getI18n();
  const user = await getCurrentUser();
  if (!user) redirect(localePath("/register?type=PARTNER", locale));
  if (user.role === "PARTNER") redirect(localePath("/partner", locale));

  const partnerType = String(formData.get("partnerType") ?? "");
  if (!PARTNER_TYPES.includes(partnerType as (typeof PARTNER_TYPES)[number])) {
    redirect(localePath("/partners?error=type", locale));
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
  redirect(localePath("/partner-onboarding", locale));
}

// ------------------------------------------------------------
// Connexion
// ------------------------------------------------------------
export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { locale, dict } = await getI18n();
  const m = dict.auth.messages;
  const loginSchema = z.object({
    email: z.string().email(m.emailInvalid),
    password: z.string().min(1, m.passwordRequired),
  });
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: m.loginInvalid };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: m.loginWrong };
  }
  if (user.status === "PENDING_EMAIL_VERIFICATION") {
    return { ok: false, error: m.pendingVerification, values: { email: parsed.data.email } };
  }
  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    return { ok: false, error: m.suspended };
  }

  await createSession(user.id);
  const redirectParam = formData.get("redirectTo");
  // Chemin interne uniquement ("/x", pas "//hote") ; localePath est idempotent
  // pour un redirectTo deja prefixe par /en.
  const target =
    typeof redirectParam === "string" && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : homeForRole(user.role);
  redirect(localePath(target, locale));
}

// ------------------------------------------------------------
// Deconnexion
// ------------------------------------------------------------
export async function logoutAction() {
  const { locale } = await getI18n();
  await destroySession();
  redirect(localePath("/", locale));
}

// Renvoi de l'email de confirmation (si le compte est encore inactif).
export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { locale, dict } = await getI18n();
  const a = dict.auth;
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email.includes("@")) return { ok: false, error: a.messages.emailInvalid };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "PENDING_EMAIL_VERIFICATION") {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    await confirmationEmail(a, locale, user.email, token, a.emails.resendTitle, a.emails.resendBody);
  }
  // Reponse identique que le compte existe/soit deja actif ou non (securite).
  return { ok: true, message: a.messages.resent };
}

// ------------------------------------------------------------
// Verification email
// ------------------------------------------------------------
export async function verifyEmailAction(token: string): Promise<ActionState> {
  const { dict } = await getI18n();
  const m = dict.auth.messages;
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: m.linkInvalid };
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
  return { ok: true, message: m.verified };
}

// ------------------------------------------------------------
// Mot de passe oublie
// ------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { locale, dict } = await getI18n();
  const a = dict.auth;
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email.includes("@")) return { ok: false, error: a.messages.emailInvalid };

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
    const url = absUrl(`/reset-password?token=${token}`, locale);
    await sendEmail({
      to: email,
      subject: a.emails.resetSubject,
      html: emailLayout(
        a.emails.resetTitle,
        `<p>${a.emails.resetBody}</p>${emailButton(url, a.emails.resetButton)}<p style="font-size:13px;color:#6A6259;">${a.emails.resetNote}</p>`,
        a.emails.footer
      ),
      text: `${a.emails.resetText} ${url}`,
    });
  }

  return { ok: true, message: a.messages.resetSent };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { dict } = await getI18n();
  const m = dict.auth.messages;
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false, error: m.passwordMin };
  }
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: m.linkInvalid };
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
  return { ok: true, message: m.resetDone };
}
