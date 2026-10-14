export type Role = "medecin" | "infirmier" | "secretaire" | "labo" | "patient" | "admin";
export type Action = "read" | "create" | "update";
export type Resource = "patients" | "dossier" | "rdv" | "assistant" | "logs";

const PERMS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  medecin:    { patients: ["read","create","update"], dossier: ["read","create","update"], rdv: ["read","create"], assistant: ["read"] },
  infirmier:  { patients: ["read"], dossier: ["read","update"], rdv: ["read"], assistant: ["read"] },
  secretaire: { patients: ["read","create","update"], rdv: ["read","create"] },
  labo:       { patients: ["read"], dossier: ["read","update"] },
  patient:    { dossier: ["read"], rdv: ["read"], assistant: ["read"] },
  admin:      { logs: ["read"], patients: ["read"] },
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