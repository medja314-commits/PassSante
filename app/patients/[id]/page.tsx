import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Nethania):
// Charger les données du patient depuis l'API.
// Implémenter la modification des informations du patient.
// Gérer la suppression du patient avec confirmation.
// Connecter les antécédents et l'historique à une API ou une base de données.
// Ajouter les états de chargement et les erreurs.
export default async function PatientRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PassSanteApp area="pro" view="patient-record" patientId={id}/>;
}
