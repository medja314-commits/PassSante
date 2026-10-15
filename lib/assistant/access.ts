import { adminRoles } from "@/data/mock-data";
import type { PermissionLevel } from "@/types";

// Un utilisateur connecté. patientId n'est renseigné que pour un patient : c'est son identifiant de dossier.
export type Utilisateur = {
  id: string;
  role: "hospital_staff" | "patient" | "admin";
  patientId?: string;
};

// Ce qu'on veut lire ou modifier. type correspond aux clés de la matrice des rôles (patients, exams, ...).
export type Ressource = {
  type: string;
  patientId?: string;
};

// Du moins au plus permissif : "write" inclut "read", "manage" inclut tout.
const ORDRE: PermissionLevel[] = ["none", "read", "write", "manage"];

function niveauSuffisant(niveau: PermissionLevel, requis: PermissionLevel): boolean {
  return ORDRE.indexOf(niveau) >= ORDRE.indexOf(requis);
}

// Renvoie true si l'utilisateur peut effectuer l'action "requis" sur la ressource.
export function can(user: Utilisateur, requis: PermissionLevel, ressource: Ressource): boolean {
  const role = adminRoles.find(item => item.id === user.role);
  const niveau = role?.permissions[ressource.type] ?? "none";
  if (!niveauSuffisant(niveau, requis)) return false;

  // Un patient ne voit que son propre dossier, même si la matrice lui donne "read".
  // Le test exige un patientId renseigné : sans lui, undefined === undefined donnerait true.
  if (user.role === "patient") {
    return Boolean(user.patientId) && ressource.patientId === user.patientId;
  }
  return true;
}

// Garde uniquement les passages que l'utilisateur peut lire. À appeler AVANT tout classement.
export function filtrerPassages<T extends { ressource: Ressource }>(user: Utilisateur, passages: T[]): T[] {
  return passages.filter(passage => can(user, "read", passage.ressource));
}
