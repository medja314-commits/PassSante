import { NextResponse } from "next/server";
import { inscrirePatient, InscriptionRefusee } from "@/lib/server/inscription";
import { extraireChampsInscription } from "@/lib/server/inscription-core";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Inscription libre pour un patient uniquement. Seuls les cinq champs de la saisie sont lus :
// un rôle, un statut ou un identifiant envoyé dans le corps est ignoré.
export async function POST(request: Request) {
  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const donnees = extraireChampsInscription(corps);
  if (!donnees) {
    return NextResponse.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  try {
    const { matricule, uid } = await inscrirePatient(donnees);
    logAction("en_attente", "inscription", "compte", uid, true);
    return NextResponse.json({ matricule }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof InscriptionRefusee) {
      if (erreur.code === "email_pris") {
        logAction("anonyme", "inscription", "compte", undefined, false);
        return NextResponse.json({ erreur: "Cette adresse e-mail est déjà utilisée." }, { status: 409 });
      }
      return NextResponse.json({ erreurs: erreur.erreurs }, { status: 400 });
    }
    // Code d'erreur seulement : pas d'e-mail, pas de mot de passe, pas de données de saisie.
    console.error("Inscription impossible, code :", (erreur as { code?: string }).code ?? "inconnu");
    return NextResponse.json({ erreur: "Inscription impossible pour le moment." }, { status: 500 });
  }
}
