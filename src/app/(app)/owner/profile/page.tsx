import { UserRound, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordForm } from "@/components/dashboard/password-form";
import { card, cardTitle } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.profile.metaTitle };
}

export default async function OwnerProfilePage() {
  const sessionUser = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [user, { dict }] = await Promise.all([prisma.user.findUnique({ where: { id: sessionUser.id } }), getI18n()]);
  if (!user) return null;
  const t = dict.dashOwner.profile;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t.title} description={t.subtitle} className="mb-0 md:mb-2" />
      <section className={`${card} p-6 sm:p-8`}>
        <h2 className={`${cardTitle} mb-5`}>
          <UserRound className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.info}
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
      <section className={`${card} p-6 sm:p-8`}>
        <h2 className={`${cardTitle} mb-5`}>
          <ShieldCheck className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.password}
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
