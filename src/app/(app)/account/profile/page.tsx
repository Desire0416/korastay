import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Mon profil" description="Gerez vos informations personnelles et votre photo." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <ProfileForm
          defaults={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone ?? "",
            city: user.city ?? "",
            country: user.country ?? "",
            bio: user.bio ?? "",
            avatarUrl: user.avatarUrl,
          }}
        />
      </div>
    </div>
  );
}
