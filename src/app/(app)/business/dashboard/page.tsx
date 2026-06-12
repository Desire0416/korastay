import Link from "next/link";
import { FileText, CheckCircle2, Clock, Plus, ArrowRight, Building2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Tableau de bord business" };

export default async function BusinessDashboard() {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const membership = await prisma.businessMember.findFirst({
    where: { userId: user.id },
    include: { businessAccount: true },
  });
  const account = membership?.businessAccount;

  const requests = await prisma.businessRequest.findMany({
    where: account ? { businessAccountId: account.id } : { email: user.email },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => ["NEW", "IN_REVIEW", "QUOTED"].includes(r.status)).length;
  const confirmed = requests.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={account?.name ?? `Bonjour ${user.firstName}`}
        description="Pilotez vos demandes et séjours professionnels."
        actions={<Button asChild><Link href="/business/requests/new"><Plus className="h-4 w-4" /> Nouvelle demande</Link></Button>}
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <KpiCard label="Demandes" value={requests.length} icon={FileText} tone="brand" href="/business/requests" />
        <KpiCard label="En cours" value={pending} icon={Clock} tone="gold" href="/business/requests?status=open" />
        <KpiCard label="Confirmées" value={confirmed} icon={CheckCircle2} tone="success" href="/business/requests?status=CONFIRMED" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Demandes récentes</h2>
        <Link href="/business/requests" className="flex items-center gap-1 text-sm font-semibold text-brand-600">Tout voir <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="mt-4 space-y-2">
        {requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface-soft/40 p-8 text-center">
            <Building2 className="mx-auto h-8 w-8 text-brand-500" />
            <p className="mt-2 font-bold text-foreground">Aucune demande</p>
            <p className="text-sm text-muted">Soumettez une demande pour vos séjours professionnels.</p>
            <Button asChild className="mt-4"><Link href="/business/requests/new">Nouvelle demande</Link></Button>
          </div>
        ) : requests.slice(0, 5).map((r) => (
          <Link key={r.id} href={`/business/requests/${r.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:shadow-card">
            <div><p className="font-semibold text-foreground">{r.needType ?? "Demande"}</p><p className="text-xs text-muted">{r.city} - {formatDate(r.createdAt)}</p></div>
            <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
          </Link>
        ))}
      </div>
    </div>
  );
}
