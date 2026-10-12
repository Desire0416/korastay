"use client";

import * as React from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

export interface MapResidence {
  id: string;
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
}

// Centre approximatif de la Cote d'Ivoire (repli si aucun marqueur).
const CI_CENTER: [number, number] = [7.54, -5.55];

// Marqueur "pastille de prix" facon Airbnb (auto-centre via transform).
function priceIcon(price: number): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<span style="display:inline-block;transform:translate(-50%,-100%);white-space:nowrap;background:#fff;color:#12343B;font-weight:700;font-size:12px;line-height:1;padding:7px 11px;border-radius:9999px;box-shadow:0 4px 12px -2px rgba(18,52,59,.35);border:1.5px solid #B9562F;">${formatPrice(price)}</span>`,
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(points, { padding: [48, 48], maxZoom: 15 });
  }, [map, points]);
  return null;
}

export default function ResidencesMapInner({ residences }: { residences: MapResidence[] }) {
  const dict = useI18n();
  const points = residences.map((r) => [r.latitude, r.longitude] as [number, number]);

  return (
    <MapContainer
      center={points[0] ?? CI_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {residences.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={priceIcon(r.pricePerNight)}>
          <Popup>
            <div style={{ minWidth: 150 }}>
              <strong style={{ fontSize: 14 }}>{r.name}</strong>
              <div style={{ color: "#6A6259", fontSize: 12 }}>{r.city}</div>
              <div style={{ marginTop: 2, fontWeight: 700 }}>{formatPrice(r.pricePerNight)} {dict.card.perNight}</div>
              <Link href={localePath(`/residences/${r.slug}`, dict.locale)} style={{ color: "#B9562F", fontWeight: 700 }}>
                {dict.map.viewListing}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      <FitBounds points={points} />
    </MapContainer>
  );
}
