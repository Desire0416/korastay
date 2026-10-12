import { Building2, UserRound, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { card, cardTitle } from "@/components/dashboard/styles";
import { verificationStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { parseJsonArray } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.profile.metaTitle };
}

export default async function PartnerProfilePage() {
  const sessionUser = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const [user, profile, { dict }] = await Promise.all([
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    prisma.partnerProfile.findUnique({ where: { userId: sessionUser.id } }),
    getI18n(),
  ]);
  if (!user) return null;
  const t = dict.dashPartner.profile;
  const zones = profile ? parseJsonArray(profile.zonesCovered) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t.title} description={t.subtitle} className="mb-0 md:mb-2" />

      {profile && (
        <section className={`${card} relative overflow-hidden p-6 sm:p-8`}>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 overflow-hidden">
            <div className="motif motif-kente text-terracotta/70" />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow flex items-center gap-1.5 text-[9.5px] text-muted">
                <Building2 className="h-3.5 w-3.5" /> {t.business}
              </p>
              <h2 className="mt-1.5 font-display text-2xl text-foreground">{profile.businessName}</h2>
              <Badge tone="gold" className="mt-2">{statusText(dict, partnerTypeMeta[profile.type]?.label ?? profile.type)}</Badge>
            </div>
            <StatusBadge status={profile.verificationStatus} map={verificationStatusMeta} />
          </div>
          {profile.description && <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">{profile.description}</p>}
          {zones.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {zones.map((z) => (
                <span key={z} className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-sand-200">
                  <MapPin className="h-3 w-3 text-terracotta" /> {z}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <section className={`${card} p-6 sm:p-8`}>
        <h2 className={`${cardTitle} mb-5`}>
          <UserRound className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.personal}
        </h2>
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
      </section>
    </div>
  );
}
