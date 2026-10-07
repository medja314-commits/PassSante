export type AppointmentStatus = "Confirmé" | "En attente" | "Modifié" | "Terminé" | "Non honoré" | "Annulé par l'établissement";

export interface PatientAppointment {
  id: string;
  date: string;
  day: string;
  month: string;
  year: string;
  time: string;
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
  date: string;
  author?: string;
  status: MedicalDocumentStatus;
  size: string;
  source: "official" | "patient";
  rejectionReason?: string;
}

export interface VitalMeasurement {
  id: string;
  measuredAt: string;
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
  customClaims: Record<string, string | boolean>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: "Succès" | "Refusé";
  risk: "Normal" | "À vérifier";
}
