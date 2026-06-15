import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "KoraStay - Réservez votre séjour, vivez l'Afrique de l'Ouest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image Open Graph de marque, generee dynamiquement (partages reseaux sociaux).
export default function OgImage() {
  const pills = ["Hébergements vérifiés", "Packs touristiques", "Activités & guides"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0F6B4F 0%, #0B3B2E 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Badge localisation */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, opacity: 0.92 }}>
          <div style={{ display: "flex", width: 16, height: 16, borderRadius: 9999, background: "#F5B301" }} />
          Côte d&apos;Ivoire · Afrique de l&apos;Ouest
        </div>

        {/* Marque */}
        <div style={{ display: "flex", fontSize: 132, fontWeight: 800, marginTop: 22, letterSpacing: -3 }}>
          <span>Kora</span>
          <span style={{ color: "#F5B301" }}>Stay</span>
        </div>

        {/* Accroche */}
        <div style={{ display: "flex", fontSize: 42, marginTop: 6, maxWidth: 940, lineHeight: 1.25 }}>
          Réservez votre séjour, vivez l&apos;Afrique de l&apos;Ouest.
        </div>

        {/* Atouts */}
        <div style={{ display: "flex", gap: 16, marginTop: 44, fontSize: 27 }}>
          {pills.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.14)",
                padding: "12px 24px",
                borderRadius: 9999,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ display: "flex", marginTop: 52, fontSize: 30, opacity: 0.85 }}>www.korastay.net</div>
      </div>
    ),
    { ...size },
  );
}
