import { cookies } from "next/headers";
import { COOKIE_SESSION } from "@/lib/server/auth-core";
import { verifierSession } from "@/lib/server/auth-firebase";
import { logAction } from "@/lib/audit";
import { traiterQuestion, type ModeQuestion } from "@/lib/assistant/traiter";
import type { Session } from "@/lib/assistant/autorisation";

// Les réponses dépendent des données et de la requête : pas de mise en cache.
export const dynamic = "force-dynamic";

const LONGUEUR_MAX_QUESTION = 500;
const FORMAT_PATIENT = /^PS-\d{4}-\d{4}$/;

// Mode démonstration uniquement (DEMO_MODE=true) : sans session, l'assistant répond comme le personnel.
// Hors démo, une session valide est obligatoire : le rôle vient toujours du cookie, jamais du corps de la requête.
const SESSION_DEMO: Session = { uid: "demo", statut: "valide", role: "hospital_staff" };

export async function POST(request: Request) {
  let corps: { question?: unknown; mode?: unknown; patientId?: unknown };
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const { question, mode = "dossier", patientId } = corps;
  if (typeof question !== "string" || question.trim().length === 0 || question.length > LONGUEUR_MAX_QUESTION) {
    return Response.json({ erreur: "Question invalide." }, { status: 400 });
  }
  if (mode !== "dossier" && mode !== "generale") {
    return Response.json({ erreur: "Mode invalide." }, { status: 400 });
  }
  if (patientId !== undefined && (typeof patientId !== "string" || !FORMAT_PATIENT.test(patientId))) {
    return Response.json({ erreur: "Identifiant patient invalide." }, { status: 400 });
  }

  const jar = await cookies();
  const session = (await verifierSession(jar.get(COOKIE_SESSION)?.value))
    ?? (process.env.DEMO_MODE === "true" ? SESSION_DEMO : undefined);

  try {
    const resultat = await traiterQuestion(question.trim(), mode as ModeQuestion, patientId as string | undefined, {
      session,
      journal: logAction,
    });
    return Response.json(resultat.corps, { status: resultat.status });
  } catch {
    // Le détail reste côté serveur ; le texte de la question n'est jamais journalisé.
    console.error("Assistant indisponible : erreur interne.");
    return Response.json({ erreur: "L'assistant est indisponible." }, { status: 500 });
  }
}
