import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Creer un compte" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));
  return <RegisterForm />;
}
