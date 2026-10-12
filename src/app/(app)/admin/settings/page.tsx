import { requireRole } from "@/lib/auth";
import { getSettingsMap } from "@/lib/settings";
import { isMockPayments } from "@/lib/payments";
import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Badge } from "@/components/ui/badge";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.settings.metaTitle };
}

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [settings, { dict }] = await Promise.all([getSettingsMap(), getI18n()]);
  const t = dict.dashAdmin.system.settings;
  const mock = isMockPayments();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-[1.25rem] bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
        <span className="font-semibold text-foreground">{t.techStatus}</span>
        <Badge tone={mock ? "warning" : "success"} size="sm">{t.payment.replace("{value}", mock ? t.paymentMock : String(process.env.PAYMENT_PROVIDER))}</Badge>
        <Badge tone={process.env.RESEND_API_KEY ? "success" : "warning"} size="sm">
          {t.email.replace("{value}", process.env.RESEND_API_KEY ? t.emailActive : t.emailConsole)}
        </Badge>
        <Badge tone="neutral" size="sm">{t.upload.replace("{value}", process.env.UPLOAD_PROVIDER ?? "local")}</Badge>
      </div>

      <SettingsForm
        contactEmail={settings.contact_email}
        contactPhone={settings.contact_phone}
        announcement={settings.announcement}
        statsVisible={settings.community_stats_visible === "true"}
      />
    </div>
  );
}
