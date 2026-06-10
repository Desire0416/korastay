import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(","));
  return "﻿" + lines.join("\r\n"); // BOM pour Excel + accents
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }
  const { type } = await params;
  let rows: Record<string, unknown>[] = [];

  switch (type) {
    case "reservations": {
      const data = await prisma.reservation.findMany({
        include: { traveler: { select: { email: true } }, residence: { select: { name: true } }, pack: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      rows = data.map((r) => ({
        reference: r.reference, type: r.type, statut: r.status,
        objet: r.residence?.name ?? r.pack?.name ?? "", voyageur: r.traveler.email,
        debut: r.startDate, fin: r.endDate, nuits: r.nights,
        adultes: r.adults, enfants: r.children, total_XOF: r.totalAmount, cree_le: r.createdAt,
      }));
      break;
    }
    case "payments": {
      const data = await prisma.payment.findMany({ include: { reservation: { select: { reference: true } } }, orderBy: { createdAt: "desc" } });
      rows = data.map((p) => ({ reservation: p.reservation.reference, methode: p.method, statut: p.status, montant_XOF: p.amount, provider: p.provider, paye_le: p.paidAt, cree_le: p.createdAt }));
      break;
    }
    case "users": {
      const data = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
      rows = data.map((u) => ({ prenom: u.firstName, nom: u.lastName, email: u.email, telephone: u.phone ?? "", role: u.role, statut: u.status, ville: u.city ?? "", inscrit_le: u.createdAt }));
      break;
    }
    case "residences": {
      const data = await prisma.residence.findMany({ include: { owner: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
      rows = data.map((r) => ({ nom: r.name, ville: r.city, type: r.type, statut: r.status, verifiee: r.isVerified, prix_nuit_XOF: r.pricePerNight, note: r.ratingAverage, avis: r.ratingCount, proprietaire: r.owner.email }));
      break;
    }
    case "business": {
      const data = await prisma.businessRequest.findMany({ orderBy: { createdAt: "desc" } });
      rows = data.map((b) => ({ organisation: b.organizationName, contact: b.contactName, email: b.email, ville: b.city ?? "", besoin: b.needType ?? "", statut: b.status, devis_XOF: b.quoteAmount ?? "", cree_le: b.createdAt }));
      break;
    }
    default:
      return NextResponse.json({ error: "Type d'export inconnu." }, { status: 400 });
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="korastay-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
