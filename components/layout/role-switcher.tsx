"use client";
import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { ROLES, type Role } from "@/lib/rbac";

// Sélecteur de rôle : uniquement en mode démonstration (DEMO_MODE=true), hors connexion.
// En session réelle, seul le libellé du rôle et la déconnexion sont affichés, jamais l'email.
export function RoleSwitcher() {
  const { role, setRole, connecte, demo, logout } = useRole();

  if (connecte) {
    return <div className="role-switcher">
      <span>{ROLES.find(r => r.id === role)?.label}</span>
      <button onClick={logout}>Déconnexion</button>
    </div>;
  }

  if (!demo) return null;

  return <label className="role-switcher">
    <span>Rôle de démo</span>
    <select value={role} onChange={e => setRole(e.target.value as Role)} aria-label="Rôle de démonstration">
      {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
    </select>
    <Link href="/login">Se connecter</Link>
  </label>;
}
