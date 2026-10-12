import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.profile.metaTitle };
}

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const [user, { dict }] = await Promise.all([prisma.user.findUnique({ where: { id: sessionUser.id } }), getI18n()]);
  if (!user) return null;
  const t = dict.dashAccount.profile;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="rounded-[1.5rem] border border-border/80 bg-surface p-6 shadow-soft sm:p-8">
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
