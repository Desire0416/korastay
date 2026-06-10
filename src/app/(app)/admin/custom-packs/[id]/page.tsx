import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Calendar, Mail, Phone } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCustomPackRequest } from "@/lib/custom-pack-queries";
import { setCustomPackStatus } from "@/server/actions/custom-pack";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { CustomPackQuoteForm, ConvertCustomPackButton } from "@/components/dashboard/custom-pack-admin";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { businessRequestStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminCustomPackDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const req = await getCustomPackRequest(id);
  if (!req) notFound();

  const actions = ["IN_REVIEW", "CONFIRMED", "CANCELLED"].map((s) => ({
    label: businessRequestStatusMeta[s].label,
    fn: setCustomPackStatus.bind(null, id, s),
    variant: (s === "CONFIRMED" ? "primary" : s === "CANCELLED" ? "outline" : "soft") as "primary" | "soft" | "outline",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/custom-packs" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Packs personnalises
      </Link>
      <PageHeader title={`Pack ${req.reference}`} actions={<StatusBadge status={req.status} map={businessRequestStatusMeta} />} />

      <div className="space-y-5">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Line icon={MapPin} label="Destination" value={req.cityName} />
            <Line icon={Users} label="Voyageurs" value={String(req.persons)} />
            {req.startDate && <Line icon={Calendar} label="Date souhaitee" value={formatDate(req.startDate)} />}
            <Line icon={Calendar} label="Cree le" value={formatDate(req.createdAt)} />
            <Line icon={Users} label="Contact" value={req.contactName} />
            <Line icon={Mail} label="Email" value={req.email} />
            {req.phone && <Line icon={Phone} label="Telephone" value={req.phone} />}
          </div>
          {req.notes && <p className="mt-4 border-t border-border pt-4 text-sm text-foreground/90">{req.notes}</p>}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="mb-3 font-bold text-foreground">Prestations selectionnees</h3>
          <ul className="space-y-2">
            {req.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-2 rounded-2xl bg-surface-soft px-4 py-2.5 text-sm">
                <span>
                  <span className="font-semibold text-foreground">{it.label}</span>
                  <span className="ml-2 text-muted">{it.partnerName}</span>
                  {it.partnerType && <Badge tone="gold" size="sm" className="ml-2">{partnerTypeMeta[it.partnerType]?.label ?? it.partnerType}</Badge>}
                </span>
                <span className="shrink-0 font-semibold text-foreground">{formatPrice(it.priceFrom)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-extrabold text-foreground">
            <span>Total estime</span><span>{formatPrice(req.estimatedTotal)}</span>
          </div>
        </div>

        {/* Devis */}
        <CustomPackQuoteForm id={req.id} currentAmount={req.quoteAmount} currentMessage={req.quoteMessage} />

        {/* Conversion / reservation liee */}
        {req.reservationId ? (
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-success/30 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-success">Converti en reservation.</p>
            <Button asChild variant="outline" size="sm"><Link href={`/admin/reservations/${req.reservationId}`}><ExternalLink className="h-4 w-4" /> Voir la reservation</Link></Button>
          </div>
        ) : (
          <ConvertCustomPackButton
            id={req.id}
            disabled={req.status !== "CONFIRMED" || !req.userId}
            hint={!req.userId ? "Le voyageur n'a pas de compte : conversion impossible." : req.status !== "CONFIRMED" ? "Disponible une fois le devis accepte (statut Confirmee)." : undefined}
          />
        )}

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="mb-3 font-bold text-foreground">Faire evoluer</h3>
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
