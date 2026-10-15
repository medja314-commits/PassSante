"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

// La réponse est toujours la même : elle ne révèle pas si le matricule existe.
export default function MotDePasseOubliePage() {
  const [matricule, setMatricule] = useState("");
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    setOccupe(true);
    try {
      const reponse = await fetch("/api/auth/reinitialisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule }),
      });
      const donnees = await reponse.json();
      setMessage(donnees.message ?? "Demande impossible pour le moment.");
    } catch {
      setMessage("Demande impossible pour le moment.");
    } finally {
      setOccupe(false);
    }
  };

  return <main style={{ maxWidth: 380, margin: "80px auto", padding: 16 }}>
    <h1>Mot de passe oublié</h1>
    <p>Saisissez votre matricule. Si un compte existe, un e-mail de réinitialisation vous sera envoyé.</p>
    {message
      ? <p role="status">{message}</p>
      : <form onSubmit={soumettre} noValidate style={{ display: "grid", gap: 12 }}>
          <label>Matricule<input value={matricule} onChange={e => setMatricule(e.target.value)} autoComplete="username" style={{ width: "100%" }} /></label>
          <button type="submit" disabled={occupe || !matricule}>{occupe ? "Envoi..." : "Envoyer"}</button>
        </form>}
    <p><Link href="/login">Retour à la connexion</Link></p>
  </main>;
}
