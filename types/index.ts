import type { DateSpec } from "@/data/dates";

export type AppointmentStatus = "Confirmé" | "En attente" | "Modifié" | "Terminé" | "Non honoré" | "Annulé par l'établissement";

export interface PatientAppointment {
  id: string;
  start: DateSpec;
  doctor: string;
  specialty: string;
  reason: string;
  facility: string;
  room: string;
  status: AppointmentStatus;
  reportAvailable?: boolean;
}

export type MedicalDocumentStatus = "Vérifié" | "En attente" | "Refusé";
export type MedicalDocumentCategory = "Ordonnance" | "Résultat d'analyse" | "Compte rendu" | "Imagerie" | "Certificat médical" | "Autre";

export interface MedicalDocument {
  id: string;
  name: string;
  category: MedicalDocumentCategory;
  date: DateSpec;
  author?: string;
  status: MedicalDocumentStatus;
  size: string;
  source: "official" | "patient";
  rejectionReason?: string;
}

export interface VitalMeasurement {
  id: string;
  measuredAt: DateSpec;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  source: "patient" | "professional";
}

export type UserRole = "hospital_staff" | "patient" | "admin";

export type PermissionLevel = "none" | "read" | "write" | "manage";

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  usersCount: number;
  color: "blue" | "green" | "purple";
  permissions: Record<string, PermissionLevel>;
}

export interface AuditLog {
  id: string;
  timestamp: DateSpec;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: "Succès" | "Refusé";
  risk: "Normal" | "À vérifier";
}

export type PatientStatus = "Suivi actif" | "À surveiller" | "Résultats reçus" | "Nouveau";

export interface StaffPatient {
  id: string;
  initials: string;
  name: string;
  age: string;
  gender: string;
  lastVisit: DateSpec;
  reason: string;
  status: PatientStatus;
  tone: "blue" | "green" | "red" | "purple";
  alert: string;
  next: DateSpec;
  birthDate?: string;
  phone?: string;
  bloodGroup?: string;
  allergy?: string;
  allergies?: string[];
  medicalHistory?: string[];
}

export type LabStatus = "Critique" | "À valider" | "En cours" | "Validé";

export interface LabExam {
  id: string;
  patient: string;
  initials: string;
  exam: string;
  category: string;
  requested: DateSpec;
  received: DateSpec | string | null;
  status: LabStatus;
  tone: "red" | "amber" | "blue" | "green";
  result: string;
}

// Consultation de démonstration, enregistrée dans le stockage local du navigateur.
export interface SessionConsultation {
  id: string;
  patientId: string;
  at: DateSpec;
  reason: string;
  observations: string;
  conclusion: string;
  vitals: Partial<Record<"systolic" | "diastolic" | "heartRate" | "temperature" | "weight", number>>;
}
