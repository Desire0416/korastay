import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.auth.register.metaTitle, robots: { index: false } };
}

type AccountType = "TRAVELER" | "OWNER" | "PARTNER";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; ref?: string }>;
}) {
  const [user, { locale }] = await Promise.all([getCurrentUser(), getI18n()]);
  if (user) redirect(localePath(homeForRole(user.role), locale));

  const { type, ref } = await searchParams;
  const defaultType: AccountType = type === "OWNER" || type === "PARTNER" ? type : "TRAVELER";

  return <RegisterForm defaultType={defaultType} defaultReferral={ref ?? ""} />;
}
