import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Wallet, Calendar } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { AcceptQuoteButton } from "@/components/dashboard/accept-quote-button";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { FileText, CheckCircle2 } from "lucide-react";

export default async function BusinessRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } });
  const req = await prisma.businessRequest.findUnique({ where: { id } });
  if (!req) notFound();
  // Verifie l'appartenance (sauf admin)
  const isOwn = membership ? req.businessAccountId === membership.businessAccountId : req.email === user.email;
  if (!isOwn && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) notFound();

  const steps = ["NEW", "IN_REVIEW", "QUOTED", "CONFIRMED"];
  const currentStep = steps.indexOf(req.status);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/business/requests" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Mes demandes
      </Link>
      <PageHeader title={req.needType ?? "Demande"} actions={<StatusBadge status={req.status} map={businessRequestStatusMeta} />} />

      {/* Suivi */}
      <div className="mb-6 flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-soft">
        {["Reçue", "En traitement", "Devis", "Confirmée"].map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center text-center">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= currentStep ? "bg-brand-500 text-white" : "bg-surface-soft text-muted"}`}>{i + 1}</span>
            <span className={`mt-1.5 text-xs ${i <= currentStep ? "font-semibold text-foreground" : "text-muted"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Devis */}
      {req.quoteAmount != null && (
        <div className={`mb-6 rounded-3xl border p-6 shadow-soft ${req.status === "QUOTED" ? "border-brand-300 bg-brand-50/50" : "border-success/30 bg-emerald-50"}`}>
          <div className="flex items-center gap-2">
            {req.status === "CONFIRMED" ? <CheckCircle2 className="h-5 w-5 text-success" /> : <FileText className="h-5 w-5 text-brand-600" />}
            <h2 className="font-bold text-foreground">{req.status === "CONFIRMED" ? "Devis accepte" : "Votre devis"}</h2>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-foreground">{formatPrice(req.quoteAmount)}</p>
          {req.quoteMessage && <p className="mt-2 text-sm text-foreground/90">{req.quoteMessage}</p>}
          {req.status === "QUOTED" && (
            <div className="mt-4">
              <AcceptQuoteButton requestId={req.id} />
              <p className="mt-2 text-xs text-muted">En acceptant, notre équipe finalisera votre réservation.</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {req.city && <Info icon={MapPin} label="Ville" value={req.city} />}
          {req.teamSize && <Info icon={Users} label="Équipe" value={`${req.teamSize} personnes`} />}
          {req.budget && <Info icon={Wallet} label="Budget" value={formatPrice(req.budget)} />}
          <Info icon={Calendar} label="Créé le" value={formatDate(req.createdAt)} />
        </div>
        {req.notes && <p className="mt-4 border-t border-border pt-4 text-sm text-foreground/90">{req.notes}</p>}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted" />
      <div><p className="text-xs text-muted">{label}</p><p className="font-medium text-foreground">{value}</p></div>
    </div>
  );
}
