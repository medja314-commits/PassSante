import { NextResponse } from "next/server";
import { gardeAdmin } from "@/lib/server/garde-admin";
import { listerComptesEnAttente } from "@/lib/server/comptes-admin";

export const dynamic = "force-dynamic";

// Liste des comptes en attente. Ne renvoie pas l'e-mail : l'administrateur vérifie l'identité à partir du nom, du matricule et du dossier.
export async function GET() {
  const garde = await gardeAdmin();
  if (!garde.ok) return garde.reponse;
  const comptes = await listerComptesEnAttente();
  return NextResponse.json({ comptes });
}
