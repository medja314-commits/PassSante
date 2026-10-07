import { redirect } from "next/navigation";

// TODO(Sidickk):
// Remplacer ce redirect par une logique d'authentification.
// Rediriger vers /login si l'utilisateur n'est pas authentifié.
// Rediriger selon le rôle (patient → espace-patient, staff → dashboard, admin → admin/users).
export default function HomePage() {
  // Redirection temporaire vers la page patients en attente de l'authentification
  redirect("/patients/PS-2024-0812");
}
