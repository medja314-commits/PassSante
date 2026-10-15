"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ROLES, type Role } from "./rbac";

const KEY = "passsante-demo-role";

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  user: User | null;
  authReady: boolean;
  logout: () => Promise<void>;
};

const RoleContext = createContext<Ctx>({
  role: "hospital_staff",
  setRole: () => {},
  user: null,
  authReady: false,
  logout: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("hospital_staff");
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Mode démo : rôle mémorisé pour la session.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved && ROLES.some(r => r.id === saved)) setRoleState(saved as Role);
    } catch {}
  }, []);

  // Mode Firebase : si connecté, le rôle vient de Firestore.
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", (u.email ?? "").toLowerCase()));
          const r = snap.data()?.role;
          if (ROLES.some(x => x.id === r)) setRoleState(r as Role);
        } catch {}
      }
      setAuthReady(true);
    });
  }, []);

  const setRole = (r: Role) => {
    if (user) return; // connecté : le rôle vient du serveur
    setRoleState(r);
    try { sessionStorage.setItem(KEY, r); } catch {}
  };

  const logout = async () => { await signOut(auth); };

  return <RoleContext.Provider value={{ role, setRole, user, authReady, logout }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);