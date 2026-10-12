import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { MenuManager } from "@/components/dashboard/menu-manager";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.menu.metaTitle };
}

export default async function PartnerMenuPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const [profile, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: user.id },
      include: { menuItems: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    }),
    getI18n(),
  ]);

  // Espace reserve aux restaurants.
  if (!profile) redirect(localePath("/partner", locale));
  if (profile.type !== "RESTAURANT") redirect(localePath("/partner/services", locale));
  const t = dict.dashPartner.menu;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <MenuManager items={profile.menuItems} />
    </div>
  );
}
