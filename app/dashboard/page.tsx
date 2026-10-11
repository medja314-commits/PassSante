import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Merval):
// Connecter les statistiques à l'API (patients, rendez-vous, examens).
// Afficher les KPIs : nombre de patients, rendez-vous prévus, taux d'occupation, etc.
// Implémenter le graphique d'occupation des salles.
// Ajouter les tasks/actions rapides du personnel.
// Afficher les rendez-vous du jour.
// Gérer les filtres et les périodes.
export default function DashboardPage() {
  return <PassSanteApp area="pro" view="dashboard"/>;
}
