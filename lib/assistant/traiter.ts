import type { RoleJournal } from "@/lib/audit";
import { autoriserQuestion, type Session } from "./autorisation";
import { repondre } from "./repondre";
import { repondreGenerale } from "./generale";
import type { ModeleIA } from "./model";
import type { RechercheWeb } from "./web/tavily";

// Traitement d'une question, sans Next.js ni Firebase : tout est injecté, donc testable.
// Ordre : autorisation, puis recherche et modèle, puis journal. Le texte de la question n'est jamais journalisé.

export type ModeQuestion = "dossier" | "generale";

export type DepsTraitement = {
  session: Session | undefined;
  journal: (role: RoleJournal, action: string, resource: string, targetId?: string, allowed?: boolean) => void;
  modele?: ModeleIA;
  recherche?: RechercheWeb;
};

export type ResultatTraitement = { status: number; corps: unknown };

export async function traiterQuestion(
  question: string,
  mode: ModeQuestion,
  patientVise: string | undefined,
  deps: DepsTraitement,
): Promise<ResultatTraitement> {
  const decision = autoriserQuestion(deps.session, patientVise);

  if (!decision.ok) {
    deps.journal(decision.journal, "question", "assistant", patientVise, false);
    const message = decision.statut === 401 ? "Connexion requise." : "Accès refusé.";
    return { status: decision.statut, corps: { erreur: message } };
  }

  const { acces } = decision;
  const reponse = mode === "generale"
    ? await repondreGenerale(question, deps.modele, deps.recherche)
    : await repondre(question, acces, deps.modele);

  deps.journal(acces.role, "question", "assistant", patientVise, true);
  return { status: 200, corps: reponse };
}
