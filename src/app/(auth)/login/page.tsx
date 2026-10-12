import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.auth.login.metaTitle, robots: { index: false } };
}

type SP = Record<string, string | string[] | undefined>;

export default async function LoginPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [user, sp, { locale }] = await Promise.all([getCurrentUser(), searchParams, getI18n()]);
  const redirectTo = Array.isArray(sp.redirectTo) ? sp.redirectTo[0] : sp.redirectTo;
  const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : undefined;
  if (user) redirect(localePath(safeRedirect ?? homeForRole(user.role), locale));

  return <LoginForm redirectTo={safeRedirect} />;
}
