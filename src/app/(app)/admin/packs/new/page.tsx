import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { PackEditor } from "@/components/dashboard/pack-editor";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.pack.newMeta };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function NewPackPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const fromId = str(sp.from);

  const [destinations, { locale, dict }] = await Promise.all([
    prisma.destination.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.pack;

  // Prefill depuis une demande de pack personnalise. Le contenu du catalogue
  // (noms, descriptions, inclus) est saisi en francais.
  let prefill: { name: string; destinationId: string | null; description: string; basePersons: number; price: number; subtitle: string } | null = null;
  if (fromId) {
    const req = await prisma.businessRequest.findUnique({ where: { id: fromId } });
    if (req) {
      const dest = destinations.find((d) => d.name.toLowerCase() === (req.city ?? "").toLowerCase());
      prefill = {
        name: `Pack ${req.city ?? "personnalisé"} – ${req.contactName}`,
        destinationId: dest?.id ?? null,
        description: `Pack personnalisé demandé par ${req.contactName}. ${req.notes ?? ""}`.trim(),
        basePersons: req.teamSize && req.teamSize > 0 ? req.teamSize : 2,
        price: req.quoteAmount ?? req.budget ?? 100000,
        subtitle: req.needType ?? "Sur mesure",
      };
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath(fromId ? `/admin/business/${fromId}` : "/admin/packs", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.newTitle} description={prefill ? t.newFromRequest : t.newSubtitle} />
      <PackEditor
        destinations={destinations}
        defaults={{
          name: prefill?.name ?? "", destinationId: prefill?.destinationId ?? null,
          subtitle: prefill?.subtitle ?? "", description: prefill?.description ?? "",
          durationDays: 2, durationNights: 1, basePersons: prefill?.basePersons ?? 2, maxPersons: Math.max(4, prefill?.basePersons ?? 4),
          price: prefill?.price ?? 100000, extraPersonPrice: 35000, status: "PUBLISHED",
          meetingPoint: "", startTime: "08:00", physicalLevel: "", clothingRecommendations: "",
          documentsToBring: "", cancellationPolicy: "",
          includedItems: [
            { label: "Hébergement", details: "", included: true },
            { label: "Petit déjeuner", details: "", included: true },
            { label: "Transport aller-retour", details: "", included: false },
          ],
          programDays: [
            { title: "Arrivée & découverte", description: "", activities: [{ timeLabel: "Matin", title: "Arrivée et installation", description: "" }] },
          ],
        }}
      />
    </div>
  );
}
