import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Building2 } from "lucide-react";

export const metadata = { title: "Profil business" };

export default async function BusinessProfilePage() {
  const sessionUser = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  const membership = await prisma.businessMember.findFirst({ where: { userId: sessionUser.id }, include: { businessAccount: true } });
  if (!user) return null;
  const account = membership?.businessAccount;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Profil business" description="Vos informations d'organisation et personnelles." />

      {account && (
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Building2 className="h-6 w-6" /></span>
            <div>
              <h2 className="text-lg font-bold text-foreground">{account.name}</h2>
              <p className="text-sm text-muted">{account.organizationType} {account.sector ? `- ${account.sector}` : ""}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Informations personnelles</h2>
        <ProfileForm defaults={{ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone ?? "", city: user.city ?? "", country: user.country ?? "", bio: user.bio ?? "", avatarUrl: user.avatarUrl }} />
      </div>
    </div>
  );
}
