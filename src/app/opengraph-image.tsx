import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "KoraStay - Réservez votre séjour, vivez l'Afrique de l'Ouest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Palette v2 (charte officielle + tons afro-contemporains).
const INK = "#12343B";
const INK_DEEP = "#0C2429";
const SAND = "#F8F5EF";
const GOLD = "#F2A23A";
const BRAND = "#0F6B4F";
const TERRACOTTA = "#B9562F";

// Bande kente en bas de l'image : blocs de couleur alternes.
const KENTE = [GOLD, TERRACOTTA, BRAND, GOLD, INK_DEEP, TERRACOTTA, BRAND, GOLD];

// Image Open Graph de marque v2, generee dynamiquement (partages reseaux sociaux).
export default function OgImage() {
  const pills = ["Hébergements vérifiés", "Packs Découverte", "Guides & activités"];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: INK, color: SAND, fontFamily: "serif" }}>
        {/* Halo chaud */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -160,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(242,162,58,0.28) 0%, rgba(242,162,58,0) 65%)",
            display: "flex",
          }}
        />

        {/* Arche sudano-sahelienne a droite */}
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 80,
            width: 330,
            height: 440,
            display: "flex",
            borderTopLeftRadius: 9999,
            borderTopRightRadius: 9999,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            background: `linear-gradient(170deg, ${GOLD} 0%, ${TERRACOTTA} 55%, ${BRAND} 100%)`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              right: 18,
              bottom: 18,
              display: "flex",
              borderTopLeftRadius: 9999,
              borderTopRightRadius: 9999,
              borderBottomLeftRadius: 18,
              borderBottomRightRadius: 18,
              border: "2px solid rgba(248,245,239,0.45)",
            }}
          />
          {/* Losanges bogolan */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", gap: 18 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: 22, height: 22, transform: "rotate(45deg)", background: i % 2 ? SAND : INK, opacity: 0.85, display: "flex" }} />
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 4, color: GOLD, fontFamily: "sans-serif", fontWeight: 700 }}>
            <div style={{ width: 12, height: 12, transform: "rotate(45deg)", background: GOLD, display: "flex" }} />
            CÔTE D&apos;IVOIRE · AFRIQUE DE L&apos;OUEST
          </div>

          <div style={{ display: "flex", fontSize: 128, marginTop: 22, letterSpacing: -4, lineHeight: 1 }}>
            <span>Kora</span>
            <span style={{ color: GOLD }}>Stay</span>
          </div>

          <div style={{ display: "flex", fontSize: 44, marginTop: 20, lineHeight: 1.2, maxWidth: 640 }}>
            Réservez votre séjour, vivez l&apos;Afrique de l&apos;Ouest.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40, fontSize: 24, fontFamily: "sans-serif" }}>
            {pills.map((t) => (
              <div key={t} style={{ display: "flex", border: "1.5px solid rgba(248,245,239,0.35)", padding: "10px 22px", borderRadius: 9999 }}>
                {t}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: 40, fontSize: 26, color: "rgba(248,245,239,0.7)", fontFamily: "sans-serif" }}>www.korastay.net</div>
        </div>

        {/* Bande kente */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 16, display: "flex" }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} style={{ flex: 1, display: "flex", background: KENTE[i % KENTE.length] }} />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
