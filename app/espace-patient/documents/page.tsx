import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Nethania):
// Charger les documents du patient depuis l'API.
// Afficher les documents officiels et les uploads du patient séparément.
// Implémenter le téléchargement de nouveaux documents.
// Ajouter le filtrage par catégorie (ordonnance, résultat, compte rendu, etc).
// Afficher le statut de chaque document (vérifié, en attente, refusé).
// Implémenter le téléchargement de documents pour le patient.
// Gérer les messages de rejet avec raison.
export default function PatientDocumentsPage() {
  return <PassSanteApp area="patient" view="documents"/>;
}
