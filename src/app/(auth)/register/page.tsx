import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Créer un compte" };

type AccountType = "TRAVELER" | "OWNER" | "PARTNER";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; ref?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  const { type, ref } = await searchParams;
  const defaultType: AccountType =
    type === "OWNER" || type === "PARTNER" ? type : "TRAVELER";

  return <RegisterForm defaultType={defaultType} defaultReferral={ref ?? ""} />;
}
