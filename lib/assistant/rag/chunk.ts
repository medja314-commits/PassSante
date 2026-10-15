import { labExams, officialDocuments, staffPatients } from "@/data/mock-data";
import type { Passage } from "@/types/assistant";

// Les documents officiels de démonstration appartiennent au dossier d'Aminata Mensah.
// Ils n'ont pas de patientId dans les données : on le fixe ici, à corriger quand les données seront liées.
const PATIENT_DOCUMENTS = "PS-2024-0812";

// Un passage = une information courte du dossier. Chaque passage garde sa ressource (pour can())
// et un libellé de source (pour la citation). Les textes sont courts : on ne découpe pas davantage.
export function decouperDossier(): Passage[] {
  const passages: Passage[] = [];

  for (const patient of staffPatients) {
    passages.push({
      id: `motif-${patient.id}`,
      ressource: { type: "patients", patientId: patient.id },
      source: `Dossier ${patient.name}`,
      texte: `Motif de suivi : ${patient.reason}. Statut : ${patient.status}.`,
    });
    if (patient.allergy) {
      passages.push({
        id: `allergie-${patient.id}`,
        ressource: { type: "patients", patientId: patient.id },
        source: `Allergies de ${patient.name}`,
        texte: `Allergie connue : ${patient.allergy}.`,
      });
    }
  }

  for (const exam of labExams) {
    passages.push({
      id: exam.id,
      ressource: { type: "exams", patientId: exam.patientId },
      source: `Examen ${exam.id}`,
      texte: `${exam.exam} (${exam.category}) : ${exam.result}. Statut : ${exam.status}.`,
    });
  }

  for (const document of officialDocuments) {
    passages.push({
      id: document.id,
      ressource: { type: "patients", patientId: PATIENT_DOCUMENTS },
      source: document.name,
      texte: `${document.name}, catégorie ${document.category}${document.author ? `, auteur ${document.author}` : ""}. Statut : ${document.status}.`,
    });
  }

  return passages;
}
