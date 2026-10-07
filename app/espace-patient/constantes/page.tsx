import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Nethania):
// Charger les mesures vitales du patient depuis l'API.
// Afficher l'historique des constantes (tension, fréquence cardiaque, température, poids).
// Implémenter l'ajout de nouvelles mesures par le patient.
// Afficher les graphiques d'évolution des constantes.
// Ajouter les seuils d'alerte si les valeurs sont anormales.
// Gérer la source des mesures (professionnelle ou patient).
export default function PatientVitalsPage() {
  return <PassSanteApp area="patient" view="constantes"/>;
}
