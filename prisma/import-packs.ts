/* eslint-disable no-console */
// Import idempotent du catalogue de packs touristiques (20 villes de CI).
// Source : prisma/data/packs-catalogue.txt (extrait du .docx fourni).
// Images : placeholders (l'utilisateur mettra de vraies images plus tard).
//   npx tsx prisma/import-packs.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const img = (s: string, n: number) => `https://picsum.photos/seed/${s}-${n}/1200/800`;

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const cell = (l = "") => l.replace(/^\|\|\s*/, "").replace(/\s*\|\|\s*$/, "").trim();
const isBullet = (l: string) => l.startsWith("•") || l.startsWith("-");
const bulletText = (l: string) => l.replace(/^[•\-]\s*/, "").trim();

interface ParsedPack {
  index: number;
  name: string;
  accroche: string;
  city: string;
  durationDays: number;
  durationNights: number;
  basePersons: number;
  maxPersons: number;
  price: number;
  publicText: string;
  sites: string[];
  included: string[];
  notIncluded: string[];
  program: { day: number; morning: string; evening: string }[];
  conseil: string;
}

function parseBlock(index: number, lines: string[]): ParsedPack {
  const name = lines[0].replace(/^\d{1,2}\.\s+/, "").trim();
  const find = (label: string) => {
    const i = lines.findIndex((l) => l === label || l === label + " ");
    return i >= 0 && i + 1 < lines.length ? cell(lines[i + 1]) : "";
  };
  const accrocheLine = lines.find((l) => /^Accroche\s*:/.test(l)) ?? "";
  const accroche = accrocheLine.replace(/^Accroche\s*:\s*/, "").trim();
  const city = find("Destination");
  const format = find("Format");
  const priceRaw = find("Prix indicatif");
  const publicText = find("Public prioritaire");

  const days = Number(/(\d+)\s*jours?/i.exec(format)?.[1] ?? 2);
  const nights = Number(/(\d+)\s*nuits?/i.exec(format)?.[1] ?? Math.max(1, days - 1));
  const persons = /(\d+)\s*[aà]\s*(\d+)\s*voyageurs/i.exec(format);
  const basePersons = Number(persons?.[1] ?? 2);
  const maxPersons = Number(persons?.[2] ?? 4);
  const price = Number((/([\d\s]+)\s*F\s*CFA/i.exec(priceRaw)?.[1] ?? "0").replace(/\s/g, "")) || 0;

  const bulletsAfter = (predicate: (l: string) => boolean, stop: (l: string) => boolean) => {
    const start = lines.findIndex(predicate);
    const out: string[] = [];
    if (start < 0) return out;
    for (let i = start + 1; i < lines.length; i++) {
      if (stop(lines[i])) break;
      if (isBullet(lines[i])) out.push(bulletText(lines[i]));
    }
    return out;
  };

  const sites = bulletsAfter((l) => /^Sites les plus attractifs/i.test(l), (l) => /Inclus/i.test(l));
  const included = bulletsAfter((l) => l === "Inclus", (l) => /^Non inclus/i.test(l));
  const notIncluded = bulletsAfter((l) => /^Non inclus/i.test(l), (l) => /^Programme/i.test(l));

  // Programme : lignes J1/J2/J3 suivies de deux cellules (matin, soiree).
  const program: ParsedPack["program"] = [];
  const progStart = lines.findIndex((l) => /^Programme/i.test(l));
  if (progStart >= 0) {
    for (let i = progStart; i < lines.length; i++) {
      const m = /^J(\d+)$/.exec(lines[i]);
      if (m) {
        program.push({
          day: Number(m[1]),
          morning: cell(lines[i + 1] ?? ""),
          evening: cell(lines[i + 2] ?? ""),
        });
      }
      if (/^Conseil terrain/i.test(lines[i])) break;
    }
  }
  const conseilIdx = lines.findIndex((l) => /^Conseil terrain/i.test(l));
  const conseil = conseilIdx >= 0 ? (lines[conseilIdx + 1] ?? "").replace(/^\|\|\s*/, "").trim() : "";

  return { index, name, accroche, city, durationDays: days, durationNights: nights, basePersons, maxPersons, price, publicText, sites, included, notIncluded, program, conseil };
}

async function main() {
  const file = path.join(__dirname, "data", "packs-catalogue.txt");
  const raw = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  const lines = raw.split(/\r?\n/).map((l) => l.trim());

  // Reperer les debuts de pack : "NN. Pack ..."
  const starts: number[] = [];
  lines.forEach((l, i) => { if (/^\d{1,2}\.\s+Pack\s+/i.test(l)) starts.push(i); });

  const packs = starts.map((s, idx) => {
    const end = idx + 1 < starts.length ? starts[idx + 1] : lines.length;
    return parseBlock(idx + 1, lines.slice(s, end));
  });

  console.log(`Catalogue : ${packs.length} packs detectes.`);

  if (process.argv.includes("--dry")) {
    for (const p of packs) {
      console.log(`\n[${p.index}] ${p.name}  ->  slug=${slugify(p.name)}`);
      console.log(`    ville=${p.city} | ${p.durationDays}j/${p.durationNights}n | ${p.basePersons}-${p.maxPersons} pers | ${p.price} F`);
      console.log(`    inclus=${p.included.length} | non-inclus=${p.notIncluded.length} | jours=${p.program.length} | sites=${p.sites.length}`);
    }
    console.log("\n(DRY RUN : aucune ecriture en base.)");
    return;
  }

  let created = 0, skipped = 0;

  for (const p of packs) {
    const slug = slugify(p.name);
    const existing = await prisma.pack.findUnique({ where: { slug }, select: { id: true } });
    if (existing) { console.log(`= ${slug} (existe deja)`); skipped++; continue; }

    // Destination (upsert par slug de ville).
    let destinationId: string | null = null;
    if (p.city) {
      const citySlug = slugify(p.city);
      const dest = await prisma.destination.upsert({
        where: { slug: citySlug },
        create: { slug: citySlug, name: p.city, country: "Cote d'Ivoire", isActive: true },
        update: {},
        select: { id: true },
      });
      destinationId = dest.id;
    }

    const description =
      `Ideal pour ${p.publicText.toLowerCase().replace(/\.$/, "")}.` +
      (p.sites.length ? ` A decouvrir : ${p.sites.join(", ")}.` : "") +
      (p.conseil ? ` Bon a savoir : ${p.conseil}` : "");

    await prisma.pack.create({
      data: {
        slug,
        name: p.name,
        subtitle: p.accroche || null,
        description: description || p.accroche || p.name,
        durationDays: p.durationDays,
        durationNights: p.durationNights,
        basePersons: p.basePersons,
        maxPersons: p.maxPersons,
        price: p.price,
        extraPersonPrice: 0,
        currency: "XOF",
        status: "PUBLISHED",
        destinationId,
        meetingPoint: "Communique apres reservation",
        physicalLevel: "Accessible",
        cancellationPolicy: "Annulation gratuite jusqu'a 7 jours avant le depart. Voir conditions generales.",
        includedText: p.included.join("\n") || null,
        notIncludedText: p.notIncluded.join("\n") || null,
        heroImageUrl: img(slug, 0),
        images: {
          create: [0, 1, 2].map((n) => ({ url: img(slug, n), altText: `${p.name} ${n + 1}`, sortOrder: n, isCover: n === 0 })),
        },
        includedItems: {
          create: [
            ...p.included.map((label, i) => ({ label, included: true, sortOrder: i })),
            ...p.notIncluded.map((label, i) => ({ label, included: false, sortOrder: 100 + i })),
          ],
        },
        programDays: {
          create: p.program.map((d) => ({
            dayNumber: d.day,
            title: `Jour ${d.day}`,
            description: [d.morning, d.evening].filter(Boolean).join(" "),
            sortOrder: d.day,
            activities: {
              create: [
                ...(d.morning ? [{ timeLabel: "Matin", title: d.morning, sortOrder: 0 }] : []),
                ...(d.evening ? [{ timeLabel: "Apres-midi / Soiree", title: d.evening, sortOrder: 1 }] : []),
              ],
            },
          })),
        },
      },
    });
    created++;
    console.log(`+ ${slug} (${p.city}, ${p.durationDays}j/${p.durationNights}n, ${p.price} F)`);
  }

  console.log(`\n${created} pack(s) cree(s), ${skipped} ignore(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
