import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import {
  SESSION_COOKIE,
  SESSION_DURATION_DAYS,
  ROLE_HOME,
} from "./constants";
import type { UserRole } from "./enums";

// ------------------------------------------------------------
// Mots de passe
// ------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ------------------------------------------------------------
// Sessions (stockees en base, cookie httpOnly)
// ------------------------------------------------------------
function newToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string; ipAddress?: string }
): Promise<string> {
  const token = newToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { token } })
      .catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: string;
  avatarUrl: string | null;
  city: string | null;
  emailVerifiedAt: Date | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const u = session.user;
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role as UserRole,
    status: u.status,
    avatarUrl: u.avatarUrl,
    city: u.city,
    emailVerifiedAt: u.emailVerifiedAt,
  };
}

// ------------------------------------------------------------
// Gardes
// ------------------------------------------------------------
export async function requireUser(
  redirectTo = "/login"
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

export async function requireRole(
  roles: UserRole | UserRole[],
  redirectTo = "/login"
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  const allowed = Array.isArray(roles) ? roles : [roles];
  // SUPER_ADMIN a acces a tout ce qui est ADMIN
  const effective = new Set<string>(allowed);
  if (effective.has("ADMIN")) effective.add("SUPER_ADMIN");
  if (!effective.has(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

export function homeForRole(role: string): string {
  return ROLE_HOME[role] ?? "/account";
}
