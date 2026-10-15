import { NextResponse } from "next/server";
import { gardeAdmin } from "@/lib/server/garde-admin";
import { validerAttribution } from "@/lib/server/comptes-core";
import { CompteIntrouvable, validerCompte } from "@/lib/server/comptes-admin";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Validation d'un compte en attente : rôle et, pour un patient, dossier rattaché. Réservé à l'administration.
export async function POST(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  const garde = await gardeAdmin();
  if (!garde.ok) return garde.reponse;

  const { uid } = await params;
  let corps: { role?: unknown; patientId?: unknown; fonction?: unknown };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const attribution = validerAttribution(corps.role, corps.patientId, corps.fonction);
  if (!attribution.ok) return NextResponse.json({ erreur: attribution.erreur }, { status: 400 });

  try {
    await validerCompte(uid, attribution);
    logAction("admin", "validation", "compte", uid, true);
    return NextResponse.json({ ok: true });
  } catch (erreur) {
    if (erreur instanceof CompteIntrouvable) {
      return NextResponse.json({ erreur: "Compte introuvable ou déjà traité." }, { status: 404 });
    }
    console.error("Validation impossible : erreur interne.");
    return NextResponse.json({ erreur: "Validation impossible pour le moment." }, { status: 500 });
  }
}
