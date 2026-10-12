import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createPartnerService } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadForm } from "@/components/public/lead-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.newService.metaTitle };
}

export default async function NewServicePage() {
  await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const { locale, dict } = await getI18n();
  const t = dict.dashPartner.newService;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={localePath("/partner/services", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {dict.dashPartner.services.title}
      </Link>
      <PageHeader title={t.title} description={t.subtitle} />
      <div className={`${card} p-6 sm:p-8`}>
        <LeadForm
          action={createPartnerService as never}
          submitLabel={t.submit}
          fields={[
            { name: "title", label: t.fTitle, required: true, full: true, placeholder: t.fTitlePh },
            { name: "city", label: t.city, placeholder: t.cityPh },
            { name: "priceFrom", label: t.price, type: "number", placeholder: "15000" },
            { name: "duration", label: t.duration, placeholder: t.durationPh },
            { name: "description", label: t.description, type: "textarea", placeholder: t.descriptionPh },
          ]}
        />
      </div>
    </div>
  );
}
