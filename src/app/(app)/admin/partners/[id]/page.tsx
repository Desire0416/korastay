import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Globe } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setPartnerStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { verificationStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { formatPrice, parseJsonArray } from "@/lib/utils";

export default async function AdminPartnerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const partner = await prisma.partnerProfile.findUnique({
    where: { id },
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } }, services: true },
  });
  if (!partner) notFound();

  const languages = parseJsonArray(partner.languages);
  const zones = parseJsonArray(partner.zonesCovered);

  const actions = [];
  if (partner.verificationStatus !== "VERIFIED") actions.push({ label: "Valider", fn: setPartnerStatus.bind(null, id, "VERIFIED"), variant: "primary" as const });
  if (partner.verificationStatus !== "REJECTED") actions.push({ label: "Refuser", fn: setPartnerStatus.bind(null, id, "REJECTED"), variant: "danger" as const, confirm: "Refuser ce partenaire ?" });
  if (partner.verificationStatus === "VERIFIED") actions.push({ label: "Suspendre", fn: setPartnerStatus.bind(null, id, "SUSPENDED"), variant: "outline" as const });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/partners" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Partenaires
      </Link>
      <PageHeader
        title={partner.businessName}
        actions={<div className="flex gap-2"><Badge tone="gold">{partnerTypeMeta[partner.type]?.label}</Badge><StatusBadge status={partner.verificationStatus} map={verificationStatusMeta} /></div>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            {partner.description && <p className="text-sm text-foreground/90">{partner.description}</p>}
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-foreground"><Mail className="h-4 w-4 text-muted" /> {partner.user.email}</p>
              {partner.user.phone && <p className="flex items-center gap-2 text-foreground"><Phone className="h-4 w-4 text-muted" /> {partner.user.phone}</p>}
              {partner.city && <p className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted" /> {partner.city}</p>}
              {languages.length > 0 && <p className="flex items-center gap-2 text-foreground"><Globe className="h-4 w-4 text-muted" /> {languages.join(", ")}</p>}
            </div>
            {zones.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {zones.map((z) => <span key={z} className="rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-foreground">{z}</span>)}
              </div>
            )}
          </div>

          {partner.services.length > 0 && (
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <h3 className="mb-3 font-bold text-foreground">Services proposes</h3>
              <div className="space-y-2">
                {partner.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3">
                    <div><p className="font-semibold text-foreground">{s.title}</p>{s.description && <p className="text-xs text-muted">{s.description}</p>}</div>
                    {s.priceFrom && <p className="text-sm font-bold text-foreground">des {formatPrice(s.priceFrom)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-3 font-bold text-foreground">Validation</h3>
            <AdminActions actions={actions} />
          </div>
        </aside>
      </div>
    </div>
  );
}
