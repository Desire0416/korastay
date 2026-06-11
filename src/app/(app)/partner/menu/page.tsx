import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { MenuManager } from "@/components/dashboard/menu-manager";

export const metadata = { title: "Mon menu - Partenaire" };

export default async function PartnerMenuPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: { menuItems: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });

  // Espace reserve aux restaurants.
  if (!profile) redirect("/partner");
  if (profile.type !== "RESTAURANT") redirect("/partner/services");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Mon menu"
        description="Presentez vos plats et formules avec photo et prix. Les voyageurs les verront sur votre espace."
      />
      <MenuManager items={profile.menuItems} />
    </div>
  );
}
