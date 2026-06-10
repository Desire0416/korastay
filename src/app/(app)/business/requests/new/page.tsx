import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createMyBusinessRequest } from "@/server/actions/business";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadForm } from "@/components/public/lead-form";

export const metadata = { title: "Nouvelle demande business" };

export default async function NewBusinessRequestPage() {
  await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/business/requests" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Mes demandes
      </Link>
      <PageHeader title="Nouvelle demande" description="Decrivez votre besoin d'hebergement professionnel." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <LeadForm
          action={createMyBusinessRequest as never}
          submitLabel="Envoyer la demande"
          fields={[
            { name: "needType", label: "Type de besoin", required: true, full: true, placeholder: "Hebergement equipe en mission" },
            { name: "city", label: "Ville de mission", placeholder: "Daloa" },
            { name: "teamSize", label: "Nombre de personnes", type: "number", placeholder: "5" },
            { name: "budget", label: "Budget indicatif (F CFA)", type: "number", placeholder: "1500000" },
            { name: "notes", label: "Details", type: "textarea", placeholder: "Dates, exigences (WiFi, calme...), facturation..." },
          ]}
        />
      </div>
    </div>
  );
}
