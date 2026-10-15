export type Role = "hospital_staff" | "patient" | "admin";
export type Action = "read" | "create" | "update";
export type Resource = "patients" | "dossier" | "rdv" | "assistant" | "logs";

const PERMS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  hospital_staff: { patients: ["read","create","update"], dossier: ["read","create","update"], rdv: ["read","create"], assistant: ["read"] },
  patient:        { dossier: ["read"], rdv: ["read"], assistant: ["read"] },
  admin:          { logs: ["read"], patients: ["read"] },
};


export function can(role: Role, action: Action, resource: Resource): boolean {
  return PERMS[role]?.[resource]?.includes(action) ?? false;
}
// Patient de démonstration : Aminata Mensah (l'espace patient est câblé sur elle).
export const DEMO_PATIENT_ID = "PS-2024-0812";

export function canAccessPatient(role: Role, patientId: string): boolean {
  if (role === "patient") return patientId === DEMO_PATIENT_ID;
  return can(role, "read", "patients");
}
export const ROLES: { id: Role; label: string; description: string }[] = [
  { id: "hospital_staff", label: "Personnel hospitalier", description: "Patients, dossiers, rendez-vous, assistant IA" },
  { id: "patient", label: "Patient", description: "Son propre dossier uniquement" },
  { id: "admin", label: "Administrateur", description: "Journaux d'audit et comptes" },
];

