import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Merval):
// Afficher le bienvenue personnalisé du patient.
// Afficher le prochain rendez-vous avec les actions associées.
// Afficher les stats du patient (rendez-vous à venir, documents, constantes).
// Implémenter la navigation vers les différentes sections (RDV, Documents, Constantes).
// Ajouter les notifications importantes.
// Afficher les toasts/messages d'information pertinents.
export default function PatientHomePage() {
  return <PassSanteApp area="patient" view="home"/>;
}
