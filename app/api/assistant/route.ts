import { repondre } from "@/lib/assistant/repondre";
import { repondreGenerale } from "@/lib/assistant/generale";
import type { Utilisateur } from "@/lib/assistant/access";

// Les réponses dépendent des données et de la requête : pas de mise en cache.
export const dynamic = "force-dynamic";

// Utilisateur de démonstration : il n'existe pas encore d'authentification (option A du cahier).
// Le rôle ne vient jamais du corps de la requête : un client ne doit pas pouvoir choisir ses droits.
const UTILISATEUR_DEMO: Utilisateur = { id: "demo-staff", role: "hospital_staff" };

const LONGUEUR_MAX_QUESTION = 500;

export async function POST(request: Request) {
  let corps: { question?: unknown; mode?: unknown };
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const { question, mode = "dossier" } = corps;
  if (typeof question !== "string" || question.trim().length === 0 || question.length > LONGUEUR_MAX_QUESTION) {
    return Response.json({ erreur: "Question invalide." }, { status: 400 });
  }
  if (mode !== "dossier" && mode !== "generale") {
    return Response.json({ erreur: "Mode invalide." }, { status: 400 });
  }

  try {
    const reponse = mode === "generale"
      ? await repondreGenerale(question.trim())
      : await repondre(question.trim(), UTILISATEUR_DEMO);
    return Response.json(reponse);
  } catch (erreur) {
    // Le détail reste côté serveur : le client reçoit un message générique.
    console.error("Assistant indisponible :", erreur);
    return Response.json({ erreur: "L'assistant est indisponible." }, { status: 500 });
  }
}
