import { Receipt, Download } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { card } from "@/components/dashboard/styles";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.invoices.metaTitle };
}

export default async function BusinessInvoicesPage() {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const [membership, { locale, dict }] = await Promise.all([prisma.businessMember.findFirst({ where: { userId: user.id } }), getI18n()]);
  const t = dict.dashBusiness.invoices;
  const invoices = await prisma.businessRequest.findMany({
    where: {
      status: "CONFIRMED",
      ...(membership ? { businessAccountId: membership.businessAccountId } : { email: user.email }),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
                  <Receipt className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-display text-lg leading-tight text-foreground">{t.invoice.replace("{ref}", inv.id.slice(-6).toUpperCase())}</p>
                  <p className="text-xs text-muted">
                    {inv.needType ? `${inv.needType} · ` : ""}
                    {formatDate(inv.updatedAt, locale)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {inv.budget && <span className="font-semibold text-foreground">{formatPrice(inv.budget)}</span>}
                <Badge tone="success">{t.paid}</Badge>
                <Button variant="outline" size="sm" disabled>
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">{t.pdfSoon}</p>
    </div>
  );
}
