import { Download, CalendarCheck, CreditCard, Users, Home, Briefcase } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata = { title: "Exports - Admin" };

const EXPORTS = [
  { type: "reservations", label: "Reservations", desc: "Toutes les reservations (CSV)", icon: CalendarCheck },
  { type: "payments", label: "Paiements", desc: "Toutes les transactions (CSV)", icon: CreditCard },
  { type: "users", label: "Utilisateurs", desc: "Tous les comptes (CSV)", icon: Users },
  { type: "residences", label: "Residences", desc: "Catalogue complet (CSV)", icon: Home },
  { type: "business", label: "Demandes Business", desc: "Demandes & devis (CSV)", icon: Briefcase },
];

export default async function AdminExportsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Exports" description="Telechargez vos donnees au format CSV (compatible Excel)." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXPORTS.map((e) => (
          <a
            key={e.type}
            href={`/api/admin/export/${e.type}`}
            className="group flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <e.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-foreground">{e.label}</p>
              <p className="text-sm text-muted">{e.desc}</p>
            </div>
            <Download className="h-5 w-5 text-muted transition-colors group-hover:text-brand-600" />
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">Les fichiers sont generes a la demande avec les donnees actuelles.</p>
    </div>
  );
}
