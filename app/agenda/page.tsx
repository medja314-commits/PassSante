import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Merval):
// Connecter le calendrier à l'API des rendez-vous du personnel.
// Implémenter la synchronisation avec le calendrier externe si applicable.
// Ajouter la création de rendez-vous directement depuis le calendrier.
// Afficher les détails du rendez-vous au clic.
// Gérer les filtres par médecin, spécialité, statut.
// Ajouter les notifications/alertes pour les rendez-vous imminents.
export default function AgendaPage() {
  return <PassSanteApp area="pro" view="agenda"/>;
}
