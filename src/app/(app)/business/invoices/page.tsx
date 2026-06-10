import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Download } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Factures business" };

export default async function BusinessInvoicesPage() {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } });
  const invoices = await prisma.businessRequest.findMany({
    where: {
      status: "CONFIRMED",
      ...(membership ? { businessAccountId: membership.businessAccountId } : { email: user.email }),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Factures" description="Vos factures pour les sejours confirmes." />
      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="Aucune facture" description="Vos factures seront disponibles ici une fois vos demandes confirmees." />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Receipt className="h-5 w-5" /></span>
                <div>
                  <p className="font-bold text-foreground">Facture {inv.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted">{inv.needType} - {formatDate(inv.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {inv.budget && <span className="font-semibold text-foreground">{formatPrice(inv.budget)}</span>}
                <Badge tone="success">Payee</Badge>
                <Button variant="outline" size="sm" disabled><Download className="h-3.5 w-3.5" /> PDF</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">La generation PDF des factures sera disponible prochainement.</p>
    </div>
  );
}
