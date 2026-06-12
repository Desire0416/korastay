import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/payment-rules";
import { isMockPayments } from "@/lib/payments";
import { PageHeader } from "@/components/dashboard/page-header";
import { PaymentSettingsForm } from "@/components/dashboard/payment-settings-form";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Regles de paiement - Admin" };

export default async function AdminPaymentSettingsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const settings = await getPaymentSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Paramètres
      </Link>
      <PageHeader
        title="Regles de paiement"
        description="KoraStay reste l'intermédiaire de tous les paiements de la plateforme."
        actions={<Badge tone={isMockPayments() ? "warning" : "success"}>{isMockPayments() ? "Mode démo (mock)" : "Provider actif"}</Badge>}
      />

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-800">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <span>
          Le voyageur ne paie jamais directement un propriétaire, guide, transporteur ou restaurant.
          Tout encaissement transite par KoraStay, sauf exception validée par un administrateur.
        </span>
      </div>

      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
