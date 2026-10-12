import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createMyBusinessRequest } from "@/server/actions/business";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadForm } from "@/components/public/lead-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.newRequest.metaTitle };
}

export default async function NewBusinessRequestPage() {
  await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const { locale, dict } = await getI18n();
  const t = dict.dashBusiness.newRequest;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={localePath("/business/requests", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.title} description={t.subtitle} />
      <div className={`${card} p-6 sm:p-8`}>
        <LeadForm
          action={createMyBusinessRequest as never}
          submitLabel={t.submit}
          fields={[
            { name: "needType", label: t.needType, required: true, full: true, placeholder: t.needTypePh },
            { name: "city", label: t.city, placeholder: t.cityPh },
            { name: "teamSize", label: t.teamSize, type: "number", placeholder: "5" },
            { name: "budget", label: t.budget, type: "number", placeholder: "1500000" },
            { name: "notes", label: t.notes, type: "textarea", placeholder: t.notesPh },
          ]}
        />
      </div>
    </div>
  );
}
