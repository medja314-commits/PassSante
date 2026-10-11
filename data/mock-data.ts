import type { AuditLog, MedicalDocument, PatientAppointment, RoleDefinition, StaffPatient, VitalMeasurement } from "@/types";

// Dossiers minimaux des patients suivis par le personnel (démonstration).
// Les champs absents affichent « Non renseigné » : aucune donnée médicale n'est inventée.
export const staffPatients: StaffPatient[] = [
  { id: "PS-2024-0812", initials: "AM", name: "Aminata Mensah", age: "34 ans", gender: "Femme", lastVisit: "Aujourd'hui, 09:40", reason: "Suivi hypertension", status: "Suivi actif", tone: "green", alert: "Pénicilline", next: "24 juin, 09:30", birthDate: "18 août 1990", phone: "+225 07 48 22 19 05", bloodGroup: "O+", allergy: "Pénicilline" },
  { id: "PS-2025-0148", initials: "YK", name: "Yao Kouamé", age: "58 ans", gender: "Homme", lastVisit: "Aujourd'hui, 08:15", reason: "Douleur thoracique", status: "À surveiller", tone: "red", alert: "Risque cardio", next: "Aujourd'hui, 15:00" },
  { id: "PS-2024-0934", initials: "FT", name: "Fatou Traoré", age: "27 ans", gender: "Femme", lastVisit: "Hier, 16:20", reason: "Suivi de grossesse", status: "Suivi actif", tone: "green", alert: "", next: "2 juillet, 10:15" },
  { id: "PS-2023-0621", initials: "JB", name: "Jean-Baptiste Koffi", age: "71 ans", gender: "Homme", lastVisit: "14 juin 2025", reason: "Diabète type 2", status: "Résultats reçus", tone: "blue", alert: "", next: "28 juin, 11:00" },
  { id: "PS-2025-0207", initials: "SN", name: "Salimata N'Dri", age: "43 ans", gender: "Femme", lastVisit: "12 juin 2025", reason: "Bilan annuel", status: "Nouveau", tone: "purple", alert: "Latex", next: "30 juin, 14:30", allergy: "Latex" },
  { id: "PS-2024-0309", initials: "OD", name: "Oumar Diabaté", age: "39 ans", gender: "Homme", lastVisit: "9 juin 2025", reason: "Lombalgie chronique", status: "Suivi actif", tone: "green", alert: "", next: "5 juillet, 09:00" },
];

export function getPatientById(id: string) {
  return staffPatients.find(patient => patient.id === id);
}

export const upcomingAppointments: PatientAppointment[] = [
  { id: "rdv-1", date: "24 juin 2025", day: "24", month: "JUIN", year: "2025", time: "09:30", doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Suivi médical", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Confirmé" },
  { id: "rdv-2", date: "8 juillet 2025", day: "08", month: "JUIL.", year: "2025", time: "14:15", doctor: "Dr Nadège Aka", specialty: "Cardiologie", reason: "Bilan cardiovasculaire", facility: "Clinique Centrale", room: "Service cardiologie", status: "En attente" },
  { id: "rdv-3", date: "22 juillet 2025", day: "22", month: "JUIL.", year: "2025", time: "11:00", doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Contrôle des constantes", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Modifié" },
];

export const appointmentHistory: PatientAppointment[] = [
  { id: "rdv-h1", date: "28 mai 2025", day: "28", month: "MAI", year: "2025", time: "14:15", doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Suivi hypertension", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Terminé", reportAvailable: true },
  { id: "rdv-h2", date: "12 avril 2025", day: "12", month: "AVR.", year: "2025", time: "10:30", doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Renouvellement de traitement", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Terminé", reportAvailable: true },
  { id: "rdv-h3", date: "4 mars 2025", day: "04", month: "MARS", year: "2025", time: "08:45", doctor: "Dr Nadège Aka", specialty: "Cardiologie", reason: "Consultation cardiologique", facility: "Clinique Centrale", room: "Service cardiologie", status: "Non honoré" },
  { id: "rdv-h4", date: "16 février 2025", day: "16", month: "FÉVR.", year: "2025", time: "15:00", doctor: "Dr Koffi Konan", specialty: "Médecine générale", reason: "Consultation de contrôle", facility: "Clinique Centrale", room: "Cabinet 2B", status: "Annulé par l'établissement" },
];

export const officialDocuments: MedicalDocument[] = [
  { id: "doc-1", name: "Ordonnance — Traitement hypertension", category: "Ordonnance", date: "28 mai 2025", author: "Dr Koffi Konan", status: "Vérifié", size: "284 Ko", source: "official" },
  { id: "doc-2", name: "Bilan sanguin complet", category: "Résultat d'analyse", date: "28 mai 2025", author: "Laboratoire Central", status: "Vérifié", size: "1,2 Mo", source: "official" },
  { id: "doc-3", name: "Compte rendu de consultation", category: "Compte rendu", date: "12 avril 2025", author: "Dr Koffi Konan", status: "Vérifié", size: "390 Ko", source: "official" },
  { id: "doc-4", name: "Électrocardiogramme", category: "Imagerie", date: "12 avril 2025", author: "Clinique Centrale", status: "Vérifié", size: "860 Ko", source: "official" },
  { id: "doc-5", name: "Certificat médical d'aptitude", category: "Certificat médical", date: "6 janvier 2025", author: "Dr Koffi Konan", status: "Vérifié", size: "218 Ko", source: "official" },
];

export const patientDocuments: MedicalDocument[] = [
  { id: "upload-1", name: "Mesures tension — carnet personnel.pdf", category: "Autre", date: "14 juin 2025", status: "En attente", size: "640 Ko", source: "patient" },
  { id: "upload-2", name: "Résultat laboratoire externe.pdf", category: "Résultat d'analyse", date: "2 juin 2025", status: "Vérifié", size: "1,1 Mo", source: "patient" },
  { id: "upload-3", name: "Photo ancienne ordonnance.jpg", category: "Ordonnance", date: "18 mai 2025", status: "Refusé", size: "780 Ko", source: "patient", rejectionReason: "Le document est illisible. Merci d'envoyer une image plus nette." },
];

export const vitalMeasurements: VitalMeasurement[] = [
  { id: "vital-1", measuredAt: "17 juin 2025, 09:32", systolic: 124, diastolic: 78, heartRate: 72, temperature: 36.8, weight: 68.4, source: "professional" },
  { id: "vital-2", measuredAt: "10 juin 2025, 08:15", systolic: 128, diastolic: 80, heartRate: 74, temperature: 36.7, weight: 68.7, source: "patient" },
  { id: "vital-3", measuredAt: "3 juin 2025, 18:40", systolic: 130, diastolic: 82, heartRate: 76, temperature: 36.9, weight: 68.9, source: "patient" },
  { id: "vital-4", measuredAt: "26 mai 2025, 09:20", systolic: 134, diastolic: 84, heartRate: 78, temperature: 36.8, weight: 69.2, source: "professional" },
  { id: "vital-5", measuredAt: "19 mai 2025, 07:55", systolic: 138, diastolic: 87, heartRate: 80, temperature: 36.6, weight: 69.4, source: "patient" },
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

export const auditLogs: AuditLog[] = [
  { id: "audit-1", timestamp: "2025-06-17T09:42:18.234Z", userEmail: "k.konan@passsante.ci", userName: "Dr. Koffi Konan", action: "PATIENT_RECORD_VIEW", resource: "Patient #PS-2024-0812", ipAddress: "10.24.8.14", status: "Succès", risk: "Normal" },
  { id: "audit-2", timestamp: "2025-06-17T09:41:03.102Z", userEmail: "s.kouassi@passsante.ci", userName: "Sophie Kouassi", action: "USER_ROLE_UPDATE", resource: "User #usr_8821", ipAddress: "10.24.2.8", status: "Succès", risk: "Normal" },
  { id: "audit-3", timestamp: "2025-06-17T09:38:42.891Z", userEmail: "external@unknown.com", userName: "Utilisateur inconnu", action: "PATIENT_RECORD_VIEW", resource: "Patient #PS-2024-0042", ipAddress: "197.159.4.28", status: "Refusé", risk: "À vérifier" },
  { id: "audit-4", timestamp: "2025-06-17T09:34:11.442Z", userEmail: "k.konan@passsante.ci", userName: "Dr. Koffi Konan", action: "PRESCRIPTION_CREATE", resource: "Patient #PS-2024-0812", ipAddress: "10.24.8.14", status: "Succès", risk: "Normal" },
  { id: "audit-5", timestamp: "2025-06-17T09:28:06.018Z", userEmail: "y.nguessan@passsante.ci", userName: "Dr. Yao N'Guessan", action: "AUTH_LOGIN_FAILED", resource: "Session #ses_1928", ipAddress: "10.24.8.31", status: "Refusé", risk: "À vérifier" },
  { id: "audit-6", timestamp: "2025-06-17T09:16:54.804Z", userEmail: "a.mensah@email.ci", userName: "Aminata Mensah", action: "DOCUMENT_UPLOAD", resource: "Document #doc_4481", ipAddress: "102.182.21.6", status: "Succès", risk: "Normal" },
  { id: "audit-7", timestamp: "2025-06-17T08:58:37.310Z", userEmail: "s.kouassi@passsante.ci", userName: "Sophie Kouassi", action: "AUDIT_EXPORT", resource: "Audit logs", ipAddress: "10.24.2.8", status: "Succès", risk: "Normal" },
];
