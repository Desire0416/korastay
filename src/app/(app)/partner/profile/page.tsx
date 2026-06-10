import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { verificationStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { parseJsonArray } from "@/lib/utils";

export const metadata = { title: "Profil partenaire" };

export default async function PartnerProfilePage() {
  const sessionUser = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  const profile = await prisma.partnerProfile.findUnique({ where: { userId: sessionUser.id } });
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Profil partenaire" description="Vos informations professionnelles et personnelles." />

      {profile && (
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">{profile.businessName}</h2>
              <Badge tone="gold" className="mt-1">{partnerTypeMeta[profile.type]?.label}</Badge>
            </div>
            <StatusBadge status={profile.verificationStatus} map={verificationStatusMeta} />
          </div>
          {profile.description && <p className="mt-3 text-sm text-foreground/90">{profile.description}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {parseJsonArray(profile.zonesCovered).map((z) => <span key={z} className="rounded-full bg-surface-soft px-3 py-1 text-xs font-medium">{z}</span>)}
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
