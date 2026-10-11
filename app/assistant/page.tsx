import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Mira):
// Intégrer l'interface RAG (Retrieval-Augmented Generation).
// Implémenter la récupération des documents pertinents.
// Ajouter la génération des réponses basées sur le contexte.
// Afficher les sources utilisées dans la réponse.
// Gérer l'historique des conversations si prévu.
// Implémenter les contrôles d'accès aux données médicales par l'IA.
export default function AssistantPage() {
  return <PassSanteApp area="pro" view="assistant"/>;
}
