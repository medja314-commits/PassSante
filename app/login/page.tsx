"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MESSAGE_ECHEC = "Matricule ou mot de passe incorrect.";

// Connexion par matricule : l'email n'est jamais saisi ni utilisé ici.
export default function LoginPage() {
  const router = useRouter();
  const [matricule, setMatricule] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    setErreur("");
    setOccupe(true);
    try {
      const reponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule, motDePasse }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) {
        setErreur(donnees.erreur ?? MESSAGE_ECHEC);
        setOccupe(false);
        return;
      }
      // Retour à la page demandée, seulement si c'est un chemin local (pas une adresse externe).
      const suite = new URLSearchParams(window.location.search).get("suite");
      const destination = suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : donnees.redirect;
      router.push(destination);
    } catch {
      setErreur("Connexion impossible pour le moment.");
      setOccupe(false);
    }
  };

  return <main style={{ maxWidth: 380, margin: "80px auto", padding: 16 }}>
    <h1>Connexion</h1>
    <p>Données fictives uniquement.</p>
    <form onSubmit={soumettre} noValidate style={{ display: "grid", gap: 12 }}>
      <label>Matricule<input type="text" value={matricule} onChange={e => setMatricule(e.target.value)} autoComplete="username" style={{ width: "100%" }} /></label>
      <label>Mot de passe<input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} autoComplete="current-password" style={{ width: "100%" }} /></label>
      {erreur && <p role="alert" style={{ color: "#b42318" }}>{erreur}</p>}
      <button type="submit" disabled={occupe || !matricule || !motDePasse}>{occupe ? "Connexion..." : "Se connecter"}</button>
    </form>
    <p><Link href="/inscription">Créer un compte patient</Link></p>
    <p><Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p>
  </main>;
}
