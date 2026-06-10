import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Connexion" };

type SP = Record<string, string | string[] | undefined>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const redirectTo = Array.isArray(sp.redirectTo) ? sp.redirectTo[0] : sp.redirectTo;
  if (user) redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : homeForRole(user.role));

  return <LoginForm redirectTo={redirectTo} />;
}
