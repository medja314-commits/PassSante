import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Nethania):
// Charger la liste des examens/laboratoires depuis l'API.
// Afficher les résultats d'examens (analyses, imagerie, etc).
// Implémenter la recherche et les filtres par type d'examen.
// Afficher l'historique complet des examens du patient.
// Ajouter l'export des résultats.
// Afficher les valeurs de référence et les alertes si hors limites.
export default function ExamsPage() {
  return <PassSanteApp area="pro" view="examens"/>;
}
