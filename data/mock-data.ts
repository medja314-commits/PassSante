import type { AuditLog, LabExam, MedicalDocument, PatientAppointment, RoleDefinition, SessionConsultation, StaffPatient, VitalMeasurement } from "@/types";

// Toutes les dates sont des décalages par rapport à aujourd'hui (voir data/dates.ts).
// Données de démonstration : aucune information réelle.

// Dossiers minimaux des patients suivis par le personnel.
// Les champs absents affichent « Non renseigné » : aucune donnée médicale n'est inventée.
export const staffPatients: StaffPatient[] = [
  { id: "PS-2024-0812", initials: "AM", name: "Aminata Mensah", age: "34 ans", gender: "Femme", lastVisit: { offset: 0, time: "09:40" }, reason: "Suivi hypertension", status: "Suivi actif", tone: "green", alert: "Pénicilline", next: { offset: 7, time: "09:30" }, birthDate: "18 août 1990", phone: "+225 07 48 22 19 05", bloodGroup: "O+", allergy: "Pénicilline", allergies: ["Pénicilline"], medicalHistory: ["Hypertension artérielle (donnée fictive)"] },
  { id: "PS-2025-0148", initials: "YK", name: "Yao Kouamé", age: "58 ans", gender: "Homme", lastVisit: { offset: 0, time: "08:15" }, reason: "Douleur thoracique", status: "À surveiller", tone: "red", alert: "Risque cardio", next: { offset: 0, time: "15:00" }, allergies: [], medicalHistory: [] },
  { id: "PS-2024-0934", initials: "FT", name: "Fatou Traoré", age: "27 ans", gender: "Femme", lastVisit: { offset: -1, time: "16:20" }, reason: "Suivi de grossesse", status: "Suivi actif", tone: "green", alert: "", next: { offset: 14, time: "10:15" }, allergies: [], medicalHistory: ["Suivi de grossesse (donnée fictive)"] },
  { id: "PS-2023-0621", initials: "JB", name: "Jean-Baptiste Koffi", age: "71 ans", gender: "Homme", lastVisit: { offset: -4 }, reason: "Diabète type 2", status: "Résultats reçus", tone: "blue", alert: "", next: { offset: 10, time: "11:00" }, allergies: [], medicalHistory: ["Diabète de type 2 (donnée fictive)"] },
  { id: "PS-2025-0207", initials: "SN", name: "Salimata N'Dri", age: "43 ans", gender: "Femme", lastVisit: { offset: -6 }, reason: "Bilan annuel", status: "Nouveau", tone: "purple", alert: "Latex", next: { offset: 12, time: "14:30" }, allergy: "Latex", allergies: ["Latex"], medicalHistory: [] },
  { id: "PS-2024-0309", initials: "OD", name: "Oumar Diabaté", age: "39 ans", gender: "Homme", lastVisit: { offset: -8 }, reason: "Lombalgie chronique", status: "Suivi actif", tone: "green", alert: "", next: { offset: 18, time: "09:00" }, allergies: [], medicalHistory: ["Lombalgie chronique (donnée fictive)"] },
];

// Historique initial pour la démonstration : données entièrement fictives, modifiables pendant la session.
export const demoConsultations: SessionConsultation[] = [
  { id: "seed-cons-1", patientId: "PS-2024-0812", at: { offset: -21, time: "09:40" }, reason: "Suivi hypertension artérielle", observations: "Consultation de suivi. Mesure et observations de démonstration.", conclusion: "Suivi à poursuivre (donnée fictive)", vitals: { systolic: 124, diastolic: 78, heartRate: 72 } },
  { id: "seed-cons-2", patientId: "PS-2024-0812", at: { offset: -60, time: "10:30" }, reason: "Consultation de contrôle", observations: "Compte rendu de démonstration.", conclusion: "Contrôle planifié (donnée fictive)", vitals: { systolic: 130, diastolic: 82 } },
  { id: "seed-cons-3", patientId: "PS-2025-0148", at: { offset: -4, time: "08:15" }, reason: "Évaluation douleur thoracique", observations: "Entrée de démonstration à surveiller.", conclusion: "Réévaluation planifiée (donnée fictive)", vitals: {} },
  { id: "seed-cons-4", patientId: "PS-2024-0934", at: { offset: -8, time: "16:20" }, reason: "Suivi de grossesse", observations: "Consultation fictive de suivi.", conclusion: "Suivi poursuivi (donnée fictive)", vitals: {} },
  { id: "seed-cons-5", patientId: "PS-2023-0621", at: { offset: -30, time: "11:00" }, reason: "Suivi diabète de type 2", observations: "Données d'exemple pour le dossier.", conclusion: "Contrôle périodique (donnée fictive)", vitals: {} },
  { id: "seed-cons-6", patientId: "PS-2025-0207", at: { offset: -45, time: "14:30" }, reason: "Bilan annuel", observations: "Données d'exemple pour le dossier.", conclusion: "Bilan à compléter (donnée fictive)", vitals: {} },
  { id: "seed-cons-7", patientId: "PS-2024-0309", at: { offset: -35, time: "09:00" }, reason: "Suivi lombalgie chronique", observations: "Données d'exemple pour le dossier.", conclusion: "Suivi poursuivi (donnée fictive)", vitals: {} },
];

export function getPatientById(id: string) {
  return staffPatients.find(patient => patient.id === id);
}

export const upcomingAppointments: PatientAppointment[] = [
  { id: "rdv-1", start: { offset: 7, time: "09:30" }, doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Suivi médical", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Confirmé" },
  { id: "rdv-2", start: { offset: 28, time: "14:15" }, doctor: "Dr Nadège Aka", specialty: "Cardiologie", reason: "Bilan cardiovasculaire", facility: "Clinique Centrale", room: "Service cardiologie", status: "En attente" },
  { id: "rdv-3", start: { offset: 42, time: "11:00" }, doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Contrôle des constantes", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Modifié" },
];

export const appointmentHistory: PatientAppointment[] = [
  { id: "rdv-h1", start: { offset: -21, time: "14:15" }, doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Suivi hypertension", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Terminé", reportAvailable: true },
  { id: "rdv-h2", start: { offset: -60, time: "10:30" }, doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Renouvellement de traitement", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Terminé", reportAvailable: true },
  { id: "rdv-h3", start: { offset: -90, time: "08:45" }, doctor: "Dr Nadège Aka", specialty: "Cardiologie", reason: "Consultation cardiologique", facility: "Clinique Centrale", room: "Service cardiologie", status: "Non honoré" },
  { id: "rdv-h4", start: { offset: -120, time: "15:00" }, doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Consultation de contrôle", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Annulé par l'établissement" },
];

export const officialDocuments: MedicalDocument[] = [
  { id: "doc-1", name: "Ordonnance — Traitement hypertension", category: "Ordonnance", date: { offset: -21 }, author: "Dr Koffi Konan", status: "Vérifié", size: "284 Ko", source: "official" },
  { id: "doc-2", name: "Bilan sanguin complet", category: "Résultat d'analyse", date: { offset: -21 }, author: "Laboratoire Central", status: "Vérifié", size: "1,2 Mo", source: "official" },
  { id: "doc-3", name: "Compte rendu de consultation", category: "Compte rendu", date: { offset: -60 }, author: "Dr Koffi Konan", status: "Vérifié", size: "390 Ko", source: "official" },
  { id: "doc-4", name: "Électrocardiogramme", category: "Imagerie", date: { offset: -60 }, author: "Clinique Centrale", status: "Vérifié", size: "860 Ko", source: "official" },
  { id: "doc-5", name: "Certificat médical d'aptitude", category: "Certificat médical", date: { offset: -150 }, author: "Dr Koffi Konan", status: "Vérifié", size: "218 Ko", source: "official" },
];

export const patientDocuments: MedicalDocument[] = [
  { id: "upload-1", name: "Mesures tension — carnet personnel.pdf", category: "Autre", date: { offset: -3 }, status: "En attente", size: "640 Ko", source: "patient" },
  { id: "upload-2", name: "Résultat laboratoire externe.pdf", category: "Résultat d'analyse", date: { offset: -15 }, status: "Vérifié", size: "1,1 Mo", source: "patient" },
  { id: "upload-3", name: "Photo ancienne ordonnance.jpg", category: "Ordonnance", date: { offset: -30 }, status: "Refusé", size: "780 Ko", source: "patient", rejectionReason: "Le document est illisible. Merci d'envoyer une image plus nette." },
];

export const vitalMeasurements: VitalMeasurement[] = [
  { id: "vital-1", measuredAt: { offset: 0, time: "09:32" }, systolic: 124, diastolic: 78, heartRate: 72, temperature: 36.8, weight: 68.4, source: "professional" },
  { id: "vital-2", measuredAt: { offset: -7, time: "08:15" }, systolic: 128, diastolic: 80, heartRate: 74, temperature: 36.7, weight: 68.7, source: "patient" },
  { id: "vital-3", measuredAt: { offset: -14, time: "18:40" }, systolic: 130, diastolic: 82, heartRate: 76, temperature: 36.9, weight: 68.9, source: "patient" },
  { id: "vital-4", measuredAt: { offset: -21, time: "09:20" }, systolic: 134, diastolic: 84, heartRate: 78, temperature: 36.8, weight: 69.2, source: "professional" },
  { id: "vital-5", measuredAt: { offset: -28, time: "07:55" }, systolic: 138, diastolic: 87, heartRate: 80, temperature: 36.6, weight: 69.4, source: "patient" },
];

export const adminRoles: RoleDefinition[] = [
  {
    id: "hospital_staff",
    name: "Personnel hospitalier",
    description: "Médecins, infirmiers et personnel clinique autorisé.",
    usersCount: 86,
    color: "blue",
    permissions: { patients: "write", appointments: "write", prescriptions: "write", exams: "write", users: "none", audit: "read" },
  },
  {
    id: "patient",
    name: "Patient",
    description: "Accès personnel aux rendez-vous et données médicales partagées.",
    usersCount: 1154,
    color: "green",
    permissions: { patients: "read", appointments: "write", prescriptions: "read", exams: "read", users: "none", audit: "none" },
  },
  {
    id: "admin",
    name: "Administrateur",
    description: "Administration de la plateforme, des accès et de la sécurité.",
    usersCount: 8,
    color: "purple",
    permissions: { patients: "read", appointments: "manage", prescriptions: "read", exams: "read", users: "manage", audit: "manage" },
  },
];

export const adminUsers = [
  { name: "Dr Koffi Konan", email: "k.konan@passsante.ci", role: "Personnel hospitalier", status: "Actif", initials: "KK", lastLogin: { offset: -1, time: "17:36" } as const },
  { name: "Aminata Mensah", email: "a.mensah@email.ci", role: "Patient", status: "Actif", initials: "AM", lastLogin: { offset: 0, time: "09:42" } as const },
  { name: "Sophie Kouassi", email: "s.kouassi@passsante.ci", role: "Administrateur", status: "Actif", initials: "SK", lastLogin: { offset: 0, time: "08:15" } as const },
  { name: "Dr Yao N'Guessan", email: "y.nguessan@passsante.ci", role: "Personnel hospitalier", status: "Suspendu", initials: "YN", lastLogin: { offset: -5 } as const },
  { name: "Mariam Traoré", email: "m.traore@email.ci", role: "Patient", status: "Actif", initials: "MT", lastLogin: { offset: -5 } as const },
];

// Journal d'audit (échantillon) : les compteurs de la page sont calculés depuis cette liste.
export const auditLogs: AuditLog[] = [
  { id: "audit-1", timestamp: { offset: 0, time: "09:42:18" }, userEmail: "k.konan@passsante.ci", userName: "Dr Koffi Konan", action: "PATIENT_RECORD_VIEW", resource: "Patient #PS-2024-0812", ipAddress: "10.24.8.14", status: "Succès", risk: "Normal" },
  { id: "audit-2", timestamp: { offset: 0, time: "09:41:03" }, userEmail: "s.kouassi@passsante.ci", userName: "Sophie Kouassi", action: "USER_ROLE_UPDATE", resource: "User #usr_8821", ipAddress: "10.24.2.8", status: "Succès", risk: "Normal" },
  { id: "audit-3", timestamp: { offset: 0, time: "09:38:42" }, userEmail: "external@unknown.com", userName: "Utilisateur inconnu", action: "PATIENT_RECORD_VIEW", resource: "Patient #PS-2024-0042", ipAddress: "197.159.4.28", status: "Refusé", risk: "À vérifier" },
  { id: "audit-4", timestamp: { offset: 0, time: "09:34:11" }, userEmail: "k.konan@passsante.ci", userName: "Dr Koffi Konan", action: "PRESCRIPTION_CREATE", resource: "Patient #PS-2024-0812", ipAddress: "10.24.8.14", status: "Succès", risk: "Normal" },
  { id: "audit-5", timestamp: { offset: 0, time: "09:28:06" }, userEmail: "y.nguessan@passsante.ci", userName: "Dr Yao N'Guessan", action: "AUTH_LOGIN_FAILED", resource: "Session #ses_1928", ipAddress: "10.24.8.31", status: "Refusé", risk: "À vérifier" },
  { id: "audit-6", timestamp: { offset: 0, time: "09:16:54" }, userEmail: "a.mensah@email.ci", userName: "Aminata Mensah", action: "DOCUMENT_UPLOAD", resource: "Document #doc_4481", ipAddress: "102.182.21.6", status: "Succès", risk: "Normal" },
  { id: "audit-7", timestamp: { offset: 0, time: "08:58:37" }, userEmail: "s.kouassi@passsante.ci", userName: "Sophie Kouassi", action: "AUDIT_EXPORT", resource: "Audit logs", ipAddress: "10.24.2.8", status: "Succès", risk: "Normal" },
];

// Examens du laboratoire (état partagé dans le contexte « Examens »).
export const labExams: LabExam[] = [
  { id: "LAB-25148", patient: "Yao Kouamé", initials: "YK", exam: "Troponine ultrasensible", category: "Biochimie", requested: { offset: 0, time: "08:42" }, received: "Il y a 18 min", status: "Critique", tone: "red", result: "68 ng/L ↑" },
  { id: "LAB-25147", patient: "Aminata Mensah", initials: "AM", exam: "Bilan lipidique complet", category: "Biochimie", requested: { offset: -1, time: "14:20" }, received: { offset: 0, time: "09:05" }, status: "À valider", tone: "amber", result: "Disponible" },
  { id: "IMG-08421", patient: "Fatou Traoré", initials: "FT", exam: "Échographie obstétricale", category: "Imagerie", requested: { offset: -1, time: "11:00" }, received: null, status: "En cours", tone: "blue", result: "—" },
  { id: "LAB-25139", patient: "Jean-Baptiste Koffi", initials: "JB", exam: "HbA1c + glycémie", category: "Hématologie", requested: { offset: -2, time: "09:30" }, received: { offset: -1, time: "16:10" }, status: "Validé", tone: "green", result: "HbA1c 6,8%" },
  { id: "LAB-25132", patient: "Salimata N'Dri", initials: "SN", exam: "NFS complète", category: "Hématologie", requested: { offset: -3, time: "15:15" }, received: { offset: -2, time: "10:30" }, status: "Validé", tone: "green", result: "Dans la norme" },
  { id: "IMG-08412", patient: "Oumar Diabaté", initials: "OD", exam: "Radiographie lombaire", category: "Imagerie", requested: { offset: -5, time: "10:00" }, received: { offset: -4, time: "12:45" }, status: "À valider", tone: "amber", result: "Compte-rendu reçu" },
];
