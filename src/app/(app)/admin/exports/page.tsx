import { Download, CalendarCheck, CreditCard, Users, Home, Briefcase } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.exports.metaTitle };
}

const EXPORTS = [
  { type: "reservations", icon: CalendarCheck },
  { type: "payments", icon: CreditCard },
  { type: "users", icon: Users },
  { type: "residences", icon: Home },
  { type: "business", icon: Briefcase },
];

export default async function AdminExportsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { dict } = await getI18n();
  const t = dict.dashAdmin.system.exports;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXPORTS.map((e) => (
          <a
            key={e.type}
            href={`/api/admin/export/${e.type}`}
            className={`${card} group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card`}
          >
            <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
              <e.icon className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight text-foreground">{t.items[e.type]?.label}</p>
              <p className="text-sm text-muted">{t.items[e.type]?.desc}</p>
            </div>
            <Download className="h-5 w-5 text-muted transition-colors group-hover:text-terracotta" />
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t.note}</p>
    </div>
  );
}
