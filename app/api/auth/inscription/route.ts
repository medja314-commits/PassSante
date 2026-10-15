import { NextResponse } from "next/server";
import { inscrirePatient, InscriptionRefusee } from "@/lib/server/inscription";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Inscription libre pour un patient uniquement. Le rôle n'est jamais demandé ni accepté dans le corps.
export async function POST(request: Request) {
  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const champs = ["nom", "prenom", "email", "motDePasse", "confirmation"] as const;
  if (!champs.every(champ => typeof corps[champ] === "string")) {
    return NextResponse.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  try {
    const { matricule, uid } = await inscrirePatient({
      nom: corps.nom as string,
      prenom: corps.prenom as string,
      email: corps.email as string,
      motDePasse: corps.motDePasse as string,
      confirmation: corps.confirmation as string,
    });
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
