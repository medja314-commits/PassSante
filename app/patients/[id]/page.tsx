import { notFound } from "next/navigation";
import PassSanteApp from "@/components/layout/pass-sante-app";
import { getPatientById } from "@/data/mock-data";

// TODO(Nethania):
// Charger les données du patient depuis l'API.
// Afficher le dossier médical complet (antécédents, constantes, documents).
// Implémenter la modification des informations du patient.
// Gérer la suppression du patient avec confirmation.
// Afficher les onglets : Dossier médical, Rendez-vous, Documents, Constantes.
// Ajouter les états de chargement et les erreurs.
export default async function PatientRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatientById(id);
  if (!patient) notFound();
  return <PassSanteApp area="pro" view="patient-record" patientId={patient.id}/>;
}
