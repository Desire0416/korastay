import { Building2, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { card, cardTitle } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.profile.metaTitle };
}

export default async function BusinessProfilePage() {
  const sessionUser = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const [user, membership, { dict }] = await Promise.all([
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    prisma.businessMember.findFirst({ where: { userId: sessionUser.id }, include: { businessAccount: true } }),
    getI18n(),
  ]);
  if (!user) return null;
  const account = membership?.businessAccount;
  const t = dict.dashBusiness.profile;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t.title} description={t.subtitle} className="mb-0 md:mb-2" />

      {account && (
        <section className={`${card} relative overflow-hidden p-6 sm:p-8`}>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 overflow-hidden">
            <div className="motif motif-kente text-terracotta/70" />
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-12 shrink-0 items-center justify-center rounded-arch-sm bg-ink text-gold-300">
              <Building2 className="h-6 w-6" strokeWidth={1.7} />
            </span>
            <div>
              <p className="eyebrow text-[9.5px] text-muted">{t.organisation}</p>
              <h2 className="mt-1 font-display text-2xl leading-tight text-foreground">{account.name}</h2>
              <p className="text-sm text-muted">
                {account.organizationType}
                {account.sector ? ` · ${account.sector}` : ""}
              </p>
            </div>
          </div>
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
