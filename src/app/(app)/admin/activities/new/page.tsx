import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityForm } from "@/components/dashboard/activity-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.activity.newMeta };
}

export default async function NewActivityPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [destinations, { locale, dict }] = await Promise.all([
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.activity;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/activities", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.newTitle} description={t.newSubtitle} />
      <div className={`${card} p-6 sm:p-8`}>
        <ActivityForm destinations={destinations} />
      </div>
    </div>
  );
}
