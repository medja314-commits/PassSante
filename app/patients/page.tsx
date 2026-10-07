import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Nethania):
// Connecter cette page à l'API des patients.
// Implémenter la recherche par nom, numéro de dossier, etc.
// Ajouter les filtres (par spécialité, statut, etc).
// Gérer la pagination si le nombre de patients est élevé.
// Afficher les états de chargement et les erreurs.
// Implémenter la création d'un nouveau patient.
export default function PatientsPage() {
  return <PassSanteApp area="pro" view="patient"/>;
}
