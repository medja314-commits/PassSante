import { NextResponse } from "next/server";
import { gardeAdmin } from "@/lib/server/garde-admin";
import { CompteIntrouvable, refuserCompte } from "@/lib/server/comptes-admin";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Refus d'un compte en attente : le compte est désactivé et ne peut plus se connecter.
export async function POST(_request: Request, { params }: { params: Promise<{ uid: string }> }) {
  const garde = await gardeAdmin();
  if (!garde.ok) return garde.reponse;

  const { uid } = await params;
  try {
    await refuserCompte(uid);
    logAction("admin", "refus", "compte", uid, true);
    return NextResponse.json({ ok: true });
  } catch (erreur) {
    if (erreur instanceof CompteIntrouvable) {
      return NextResponse.json({ erreur: "Compte introuvable ou déjà traité." }, { status: 404 });
    }
    console.error("Refus impossible : erreur interne.");
    return NextResponse.json({ erreur: "Refus impossible pour le moment." }, { status: 500 });
  }
}
