import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const DOC_TYPES = ["application/pdf"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "application/pdf": "pdf",
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  // "kind=doc" autorise aussi les PDF (pieces jointes de messagerie) ;
  // par defaut on reste sur les images (avatars, photos de residence...).
  const kind = formData.get("kind");
  const allowed = kind === "doc" ? [...IMAGE_TYPES, ...DOC_TYPES] : IMAGE_TYPES;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }
  if (!allowed.includes(file.type)) {
    const msg = kind === "doc" ? "Format non supporte (jpg, png, webp, pdf)." : "Format non supporte (jpg, png, webp).";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 8 Mo)." }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, name), buffer);
  } catch {
    // Systeme de fichiers en lecture seule (ex: Vercel serverless).
    // L'upload local n'est pas disponible : echec propre cote client.
    return NextResponse.json(
      { error: "Envoi de fichier indisponible sur cet hebergement. Configurez un stockage (Vercel Blob / S3)." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    url: `/uploads/${name}`,
    name: file.name,
    type: file.type,
    size: file.size,
  });
}
