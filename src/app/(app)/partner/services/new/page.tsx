import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createPartnerService } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadForm } from "@/components/public/lead-form";

export const metadata = { title: "Nouveau service" };

export default async function NewServicePage() {
  await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/partner/services" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Mes services
      </Link>
      <PageHeader title="Ajouter un service" description="Decrivez une prestation que vous proposez." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <LeadForm
          action={createPartnerService as never}
          submitLabel="Créer le service"
          fields={[
            { name: "title", label: "Titre du service", required: true, full: true, placeholder: "Visite guidee de Daloa" },
            { name: "city", label: "Ville", placeholder: "Daloa" },
            { name: "priceFrom", label: "Prix à partir de (F CFA)", type: "number", placeholder: "15000" },
            { name: "duration", label: "Durée", placeholder: "Demi-journée" },
            { name: "description", label: "Description", type: "textarea", placeholder: "Ce que comprend la prestation..." },
          ]}
        />
      </div>
    </div>
  );
}
