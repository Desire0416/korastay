import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "kora_visit";
const SESSION_S = 30 * 60; // une visite = fenetre glissante de 30 min

// Enregistre une visite de la plateforme. Compte au plus une visite par
// session de 30 min (marqueur cookie), puis incremente le total cumule
// stocke dans Setting("visits_total"). Aucune donnee personnelle.
export async function POST() {
  const jar = await cookies();
  const hasSession = Boolean(jar.get(COOKIE)?.value);

  if (!hasSession) {
    // Upsert + increment atomique (Postgres / Neon).
    await prisma.$executeRaw`
      INSERT INTO "Setting" ("key", "value", "updatedAt")
      VALUES ('visits_total', '1', now())
      ON CONFLICT ("key")
      DO UPDATE SET "value" = ((("Setting"."value")::bigint) + 1)::text, "updatedAt" = now()
    `;
  }

  const res = NextResponse.json(
    { ok: true, counted: !hasSession },
    { headers: { "Cache-Control": "no-store" } },
  );

  // (Re)pose le marqueur a chaque appel -> fenetre de 30 min glissante.
  res.cookies.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_S,
  });

  return res;
}
