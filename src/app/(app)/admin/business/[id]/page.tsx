import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Users, Calendar, Wallet } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setBusinessRequestStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { BusinessQuoteForm } from "@/components/dashboard/business-quote-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { Compass } from "lucide-react";

export default async function AdminBusinessDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const req = await prisma.businessRequest.findUnique({ where: { id } });
  if (!req) notFound();

  const isCustomPack = req.organizationType === "Particulier" || (req.needType ?? "").toLowerCase().includes("pack personnalisé");

  const actions = ["IN_REVIEW", "QUOTED", "CONFIRMED", "CLOSED"].map((s) => ({
    label: businessRequestStatusMeta[s].label,
    fn: setBusinessRequestStatus.bind(null, id, s),
    variant: (s === "CONFIRMED" ? "primary" : "soft") as "primary" | "soft",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/business" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Demandes Business
      </Link>
      <PageHeader title={req.organizationName} actions={<StatusBadge status={req.status} map={businessRequestStatusMeta} />} />

      <div className="space-y-5">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Line icon={Users} label="Contact" value={req.contactName} />
            <Line icon={Mail} label="Email" value={req.email} />
            {req.phone && <Line icon={Phone} label="Téléphone" value={req.phone} />}
            {req.city && <Line icon={MapPin} label="Ville" value={req.city} />}
            {req.teamSize && <Line icon={Users} label="Équipe" value={`${req.teamSize} personnes`} />}
            {req.budget && <Line icon={Wallet} label="Budget" value={formatPrice(req.budget)} />}
            {req.startDate && <Line icon={Calendar} label="Du" value={formatDate(req.startDate)} />}
            {req.endDate && <Line icon={Calendar} label="Au" value={formatDate(req.endDate)} />}
          </div>
          {req.needType && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-2 text-sm text-brand-700">{req.needType}</p>}
          {req.notes && <p className="mt-3 text-sm text-foreground/90">{req.notes}</p>}
        </div>

        {isCustomPack && (
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-brand-200 bg-brand-50/50 p-5">
            <div>
              <p className="font-bold text-foreground">Demande de pack personnalisé</p>
              <p className="text-sm text-muted">Transformez cette demande en pack réservable.</p>
            </div>
            <Button asChild>
              <Link href={`/admin/packs/new?from=${req.id}`}><Compass className="h-4 w-4" /> Créer un pack</Link>
            </Button>
          </div>
        )}

        <BusinessQuoteForm requestId={req.id} currentAmount={req.quoteAmount} currentMessage={req.quoteMessage} />

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="mb-3 font-bold text-foreground">Faire evoluer la demande</h3>
          <AdminActions actions={actions} />
        </div>
      </div>
    </div>
  );
}

function Line({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted" />
      <div><p className="text-xs text-muted">{label}</p><p className="font-medium text-foreground">{value}</p></div>
    </div>
  );
}
