"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

// Inscription patient. Le compte est créé en attente : il sera rattaché à son dossier par l'hôpital.
export default function InscriptionPage() {
  const [champs, setChamps] = useState({ nom: "", prenom: "", email: "", motDePasse: "", confirmation: "" });
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [matricule, setMatricule] = useState("");
  const [occupe, setOccupe] = useState(false);

  const modifier = (champ: keyof typeof champs, valeur: string) => setChamps(courant => ({ ...courant, [champ]: valeur }));

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    setErreurs([]);
    setOccupe(true);
    try {
      const reponse = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(champs),
      });
      const donnees = await reponse.json();
      if (reponse.status === 201) {
        setMatricule(donnees.matricule);
        setChamps({ nom: "", prenom: "", email: "", motDePasse: "", confirmation: "" });
      } else {
        setErreurs(donnees.erreurs ?? [donnees.erreur ?? "Inscription impossible pour le moment."]);
      }
    } catch {
      setErreurs(["Inscription impossible pour le moment."]);
    } finally {
      setOccupe(false);
    }
  };

  if (matricule) {
    return <main style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <h1>Inscription enregistrée</h1>
      <p>Votre matricule est :</p>
      <p style={{ fontSize: 22, fontWeight: 700 }}>{matricule}</p>
      <p role="alert"><strong>Notez-le.</strong> Il vous sera demandé pour vous connecter. Votre compte est en attente de validation par l&apos;hôpital.</p>
      <Link href="/login">Aller à la connexion</Link>
    </main>;
  }

  return <main style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
    <h1>Créer un compte patient</h1>
    <p>Données fictives uniquement. Le compte sera validé par l&apos;hôpital avant tout accès.</p>
    <form onSubmit={soumettre} noValidate style={{ display: "grid", gap: 12 }}>
      <label>Nom<input value={champs.nom} onChange={e => modifier("nom", e.target.value)} autoComplete="family-name" style={{ width: "100%" }} /></label>
      <label>Prénom<input value={champs.prenom} onChange={e => modifier("prenom", e.target.value)} autoComplete="given-name" style={{ width: "100%" }} /></label>
      <label>E-mail (sert uniquement à réinitialiser le mot de passe)<input type="email" value={champs.email} onChange={e => modifier("email", e.target.value)} autoComplete="email" style={{ width: "100%" }} /></label>
      <label>Mot de passe (12 caractères minimum)<input type="password" value={champs.motDePasse} onChange={e => modifier("motDePasse", e.target.value)} autoComplete="new-password" style={{ width: "100%" }} /></label>
      <label>Confirmer le mot de passe<input type="password" value={champs.confirmation} onChange={e => modifier("confirmation", e.target.value)} autoComplete="new-password" style={{ width: "100%" }} /></label>
      {erreurs.map(erreur => <p key={erreur} role="alert" style={{ color: "#b42318" }}>{erreur}</p>)}
      <button type="submit" disabled={occupe}>{occupe ? "Création..." : "Créer mon compte"}</button>
    </form>
    <p><Link href="/login">J&apos;ai déjà un compte</Link></p>
  </main>;
}
