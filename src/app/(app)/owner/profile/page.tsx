import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordForm } from "@/components/dashboard/password-form";

export const metadata = { title: "Mon profil proprietaire" };

export default async function OwnerProfilePage() {
  const sessionUser = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Mon profil" description="Gerez vos informations et votre securite." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Informations</h2>
        <ProfileForm defaults={{ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone ?? "", city: user.city ?? "", country: user.country ?? "", bio: user.bio ?? "", avatarUrl: user.avatarUrl }} />
      </div>
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Mot de passe</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
