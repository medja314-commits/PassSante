import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Nethania):
// Connecter cette page à l'API des patients.
// Implémenter la recherche par nom, numéro de dossier, etc.
// Ajouter les filtres (par spécialité, statut, etc).
// Gérer la pagination si le nombre de patients est élevé.
// Afficher les états de chargement et les erreurs.
export default function PatientsPage() {
  return <PassSanteApp area="pro" view="patient"/>;
}
