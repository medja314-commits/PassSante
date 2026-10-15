"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ROLES, type Role } from "./rbac";

// Le rôle vient de la session serveur (cookie httpOnly, vérifié par Firebase Admin).
// Le sélecteur de rôle n'existe qu'en mode démonstration (DEMO_MODE=true), et seulement hors connexion.
const KEY = "passsante-demo-role";

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  connecte: boolean;
  demo: boolean;
  authReady: boolean;
  logout: () => Promise<void>;
};

const RoleContext = createContext<Ctx>({
  role: "hospital_staff",
  setRole: () => {},
  connecte: false,
  demo: false,
  authReady: false,
  logout: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("hospital_staff");
  const [connecte, setConnecte] = useState(false);
  const [demo, setDemo] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Session serveur : rôle et mode démo, sans email.
  useEffect(() => {
    let annule = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(reponse => reponse.json())
      .then((donnees: { connecte: boolean; role: string | null; demo: boolean }) => {
        if (annule) return;
        setConnecte(donnees.connecte);
        setDemo(donnees.demo);
        if (donnees.connecte && ROLES.some(r => r.id === donnees.role)) setRoleState(donnees.role as Role);
        // Mode démo hors connexion : rôle mémorisé pour la session.
        if (!donnees.connecte && donnees.demo) {
          try {
            const saved = sessionStorage.getItem(KEY);
            if (saved && ROLES.some(r => r.id === saved)) setRoleState(saved as Role);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => { if (!annule) setAuthReady(true); });
    return () => { annule = true; };
  }, []);

  // Changement de rôle : uniquement en démo, et jamais pendant une session réelle.
  const setRole = (r: Role) => {
    if (connecte || !demo) return;
    setRoleState(r);
    try { sessionStorage.setItem(KEY, r); } catch {}
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return <RoleContext.Provider value={{ role, setRole, connecte, demo, authReady, logout }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
