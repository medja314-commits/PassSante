"use client";
import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { ROLES, type Role } from "@/lib/rbac";

export function RoleSwitcher() {
  const { role, setRole, user, logout } = useRole();
  if (user) {
    return <div className="role-switcher">
      <span>{user.email} ({ROLES.find(r => r.id === role)?.label})</span>
      <button onClick={logout}>Déconnexion</button>
    </div>;
  }
  return <label className="role-switcher">
    <span>Rôle de démo</span>
    <select value={role} onChange={e => setRole(e.target.value as Role)} aria-label="Rôle de démonstration">
      {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
    </select>
    <Link href="/login">Se connecter</Link>
  </label>;
}