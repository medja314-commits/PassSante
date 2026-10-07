import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Nethania):
// Récupérer l'ID du patient depuis les params.
// Charger les données du patient depuis l'API.
// Afficher le dossier médical complet (antécédents, constantes, documents).
// Implémenter la modification des informations du patient.
// Gérer la suppression du patient avec confirmation.
// Afficher les onglets : Dossier médical, Rendez-vous, Documents, Constantes.
// Ajouter les états de chargement et les erreurs.
export default function PatientRecordPage() {
  return <PassSanteApp area="pro" view="patient-record"/>;
}
