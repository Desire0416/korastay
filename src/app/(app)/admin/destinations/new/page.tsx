import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { DestinationForm } from "@/components/dashboard/destination-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.destination.newMeta };
}

export default async function NewDestinationPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { locale, dict } = await getI18n();
  const t = dict.dashAdmin.catalog.destination;
  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/destinations", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.newTitle} description={t.newSubtitle} />
      <div className={`${card} p-6 sm:p-8`}>
        <DestinationForm />
      </div>
    </div>
  );
}
