import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { SessionProvider } from "@/components/layout/session-context";
import { RoleProvider } from "@/lib/role-context";
import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/rbac";

// Polices chargées par next/font (pas de feuille externe) : exposées en variables CSS, avec repli system-ui.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });

const { role, setRole } = useRole();
<select value={role} onChange={(e) => setRole(e.target.value as Role)}>
  {["medecin","infirmier","secretaire","labo","patient","admin"].map(r => <option key={r}>{r}</option>)}
</select>

export const metadata: Metadata = {
  title: "PassSanté par DocPoche AI",
  description: "Plateforme hospitalière unifiée pour les professionnels de santé et leurs patients.",
};

// TODO(Sidickk):
// Ajouter la logique d'authentification au layout root.
// Implémenter la protection des routes sensibles.
// Configurer les providers (AuthProvider, etc) si nécessaire.
// Gérer les rôles d'utilisateur (hospital_staff, patient, admin).
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="fr" className={`${inter.variable} ${jakarta.variable}`}><body>
    <SessionProvider>{children}</SessionProvider>
    <RoleProvider>{children}</RoleProvider>
    <div className="demo-banner" role="note">Données de démonstration — aucune information réelle</div>
  </body></html>;
}
