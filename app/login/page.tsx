"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/ui";

const MESSAGE_ECHEC = "Matricule ou mot de passe incorrect.";

// Connexion par matricule : l'email n'est jamais saisi ni utilisé ici.
export default function LoginPage() {
  const router = useRouter();
  const [matricule, setMatricule] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
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

  return <main className="auth-page">
    <section className="auth-card" aria-labelledby="titre-connexion">
      <div className="auth-logo"><Logo/></div>
      <h1 id="titre-connexion">Connexion</h1>
      <p className="auth-intro">Espace sécurisé. Données fictives uniquement.</p>

      <form onSubmit={soumettre} noValidate className="auth-form">
        <label className="auth-field">
          <span>Matricule</span>
          <input type="text" value={matricule} onChange={e => setMatricule(e.target.value)} autoComplete="username" placeholder="Ex. PAT-2026-000123" />
        </label>

        <label className="auth-field">
          <span>Mot de passe</span>
          <span className="auth-password">
            <input type={voirMotDePasse ? "text" : "password"} value={motDePasse} onChange={e => setMotDePasse(e.target.value)} autoComplete="current-password" />
            <button type="button" className="auth-toggle" onClick={() => setVoirMotDePasse(v => !v)} aria-label={voirMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
              <Icon name="lock" size={16}/>
            </button>
          </span>
        </label>

        {erreur && <p role="alert" className="auth-erreur"><Icon name="alert" size={16}/>{erreur}</p>}

        <button type="submit" className="button button-primary auth-submit" disabled={occupe || !matricule || !motDePasse}>
          {occupe ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>

      <nav className="auth-liens" aria-label="Autres actions">
        <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        <Link href="/inscription">Créer un compte</Link>
      </nav>
    </section>
  </main>;
}
