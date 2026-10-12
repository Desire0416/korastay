import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/payment-rules";
import { isMockPayments } from "@/lib/payments";
import { PageHeader } from "@/components/dashboard/page-header";
import { PaymentSettingsForm } from "@/components/dashboard/payment-settings-form";
import { Badge } from "@/components/ui/badge";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.paymentSettings.metaTitle };
}

export default async function AdminPaymentSettingsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [settings, { locale, dict }] = await Promise.all([getPaymentSettings(), getI18n()]);
  const t = dict.dashAdmin.system.paymentSettings;
  const mock = isMockPayments();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/settings", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.title} description={t.subtitle} actions={<Badge tone={mock ? "warning" : "success"}>{mock ? t.mock : t.active}</Badge>} />

      <div className="mb-6 flex items-start gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-sm leading-relaxed text-brand-800 ring-1 ring-inset ring-brand-200/70">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <span>{t.intro}</span>
      </div>

      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
