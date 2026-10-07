import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

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
  return <html lang="fr"><body>{children}</body></html>;
}
