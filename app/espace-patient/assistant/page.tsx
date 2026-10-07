import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Mira):
// Implémenter l'interface de chat pour l'assistant IA du patient.
// Connecter la logique RAG pour répondre aux questions du patient.
// Afficher les réponses avec les sources documentaires utilisées.
// Implémenter l'historique des conversations du patient.
// Gérer les limitations d'accès (patient ne voit que ses propres documents).
// Ajouter les suggestions de questions utiles.
export default function PatientAssistantPage() {
  return <PassSanteApp area="patient-assistant"/>;
}
