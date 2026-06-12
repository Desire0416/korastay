import { requireRole } from "@/lib/auth";
import { getSettingsMap } from "@/lib/settings";
import { isMockPayments } from "@/lib/payments";
import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Paramètres - Admin" };

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const settings = await getSettingsMap();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Paramètres" description="Configuration de la plateforme." />

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-soft/50 p-4 text-sm">
        <span className="font-semibold text-foreground">État technique :</span>
        <Badge tone={isMockPayments() ? "warning" : "success"}>Paiement : {isMockPayments() ? "mode démo (mock)" : process.env.PAYMENT_PROVIDER}</Badge>
        <Badge tone={process.env.RESEND_API_KEY ? "success" : "warning"}>Email : {process.env.RESEND_API_KEY ? "actif" : "console (dev)"}</Badge>
        <Badge tone="neutral">Upload : {process.env.UPLOAD_PROVIDER ?? "local"}</Badge>
      </div>

      <SettingsForm
        contactEmail={settings.contact_email}
        contactPhone={settings.contact_phone}
        announcement={settings.announcement}
      />
    </div>
  );
}
