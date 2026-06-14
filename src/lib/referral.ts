import { prisma } from "./prisma";

// Recompense filleul : -5 % sur sa PREMIERE reservation de residence.
// Cout marketing assume par KoraStay (pas par l'hote) — cf. reservation-finalize.
export const REFERRAL_DISCOUNT_RATE = 0.05;

// Alphabet sans caracteres ambigus (0/O/1/I/L) pour des codes lisibles.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(len = 7): string {
  let c = "";
  for (let i = 0; i < len; i++) {
    c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return c;
}

// Genere un code de parrainage unique (verification anti-collision cote code,
// l'unicite n'etant pas une contrainte DB).
export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    const exists = await prisma.user.findFirst({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  // Repli tres improbable : suffixe aleatoire plus long.
  return randomCode(10);
}

// Garantit qu'un utilisateur a un code (le genere a la volee si absent).
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;
  const code = await generateUniqueReferralCode();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

// Resout un code de parrainage saisi -> id du parrain (ou null).
export async function resolveReferrerId(code: string): Promise<string | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  const u = await prisma.user.findFirst({
    where: { referralCode: c },
    select: { id: true },
  });
  return u?.id ?? null;
}

// Taux de remise parrainage applicable a un voyageur pour une nouvelle resa :
// -5 % s'il a ete parraine ET que c'est sa toute premiere reservation.
export async function referralDiscountRateFor(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });
  if (!user?.referredById) return 0;
  const prior = await prisma.reservation.count({ where: { travelerId: userId } });
  return prior === 0 ? REFERRAL_DISCOUNT_RATE : 0;
}
