"use client";
import { useRole } from "@/lib/role-context";

// Affichée tant que le compte n'est pas validé par l'administration.
// Le compte peut se connecter, mais n'accède à aucun dossier, rendez-vous ni à l'assistant.
export default function AttentePage() {
  const { logout } = useRole();
  return <main style={{ maxWidth: 480, margin: "80px auto", padding: 16 }}>
    <h1>Compte en attente de validation</h1>
    <p>Votre compte a bien été créé. Il doit être validé par l'administration de l'hôpital avant que vous puissiez accéder aux dossiers et aux rendez-vous.</p>
    <p>Revenez plus tard, ou contactez l'accueil de l'établissement.</p>
    <button type="button" onClick={logout}>Se déconnecter</button>
  </main>;
}
