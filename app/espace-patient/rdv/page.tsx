import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Merval):
// Charger les rendez-vous du patient depuis l'API.
// Afficher les rendez-vous à venir et l'historique séparément.
// Implémenter l'annulation/modification des rendez-vous.
// Ajouter la fonctionnalité de téléchargement des rapports de consultation.
// Afficher les détails du médecin et du lieu.
// Gérer les filtres et la recherche.
// Ajouter les notifications pour les rendez-vous imminents.
export default function PatientAppointmentsPage() {
  return <PassSanteApp area="patient" view="rdv"/>;
}
