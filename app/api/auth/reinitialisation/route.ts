import { NextResponse } from "next/server";
import { matriculeValide } from "@/lib/server/auth-core";
import { demanderReinitialisationFirebase } from "@/lib/server/reinitialisation";
import { MESSAGE_REINITIALISATION } from "@/lib/server/reinitialisation-core";
import { logAction, type RoleJournal } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Demande de réinitialisation. La réponse est toujours la même, que le matricule existe ou non.
export async function POST(request: Request) {
  let corps: { matricule?: unknown };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ message: MESSAGE_REINITIALISATION });
  }

  const matricule = typeof corps.matricule === "string" ? corps.matricule.trim().toUpperCase() : "";
  if (!matriculeValide(matricule)) {
    logAction("anonyme", "reinitialisation", "compte", undefined, false);
    return NextResponse.json({ message: MESSAGE_REINITIALISATION });
  }

  try {
    const resultat = await demanderReinitialisationFirebase(matricule);
    if (resultat.uid) {
      const acteur = (resultat.role as RoleJournal | undefined) ?? (resultat.statut === "en_attente" ? "en_attente" : "anonyme");
      logAction(acteur, "reinitialisation", "compte", resultat.uid, true);
    } else {
      logAction("anonyme", "reinitialisation", "compte", undefined, false);
    }
  } catch {
    console.error("Réinitialisation : erreur interne du serveur d'authentification.");
  }
  return NextResponse.json({ message: MESSAGE_REINITIALISATION });
}
