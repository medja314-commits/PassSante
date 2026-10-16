"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Icon, Logo } from "@/components/ui";

// Fonctions demandables par le personnel. Une demande : l'administration valide la fonction effective.
const FONCTIONS = [
  { valeur: "medecin", libelle: "Médecin" },
  { valeur: "infirmier", libelle: "Infirmier(ère)" },
  { valeur: "secretaire", libelle: "Secrétaire" },
  { valeur: "laboratoire", libelle: "Laboratoire" },
];

const VIDE = { nom: "", prenom: "", email: "", motDePasse: "", confirmation: "", matricule: "", fonction: "" };

// Inscription patient (matricule généré) ou personnel (matricule d'hôpital, fonction demandée).
// Dans les deux cas, le compte est en attente de validation par l'administration.
export default function InscriptionPage() {
  const [type, setType] = useState<"patient" | "personnel">("patient");
  const [champs, setChamps] = useState(VIDE);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [resultat, setResultat] = useState<{ matricule?: string } | null>(null);
  const [occupe, setOccupe] = useState(false);

  const modifier = (champ: keyof typeof VIDE, valeur: string) => setChamps(courant => ({ ...courant, [champ]: valeur }));

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    setErreurs([]);
    setOccupe(true);
    try {
      const reponse = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...champs, typeDemande: type }),
      });
      const donnees = await reponse.json();
      if (reponse.status === 201) {
        setResultat({ matricule: donnees.matricule });
        setChamps(VIDE);
      } else {
        setErreurs(donnees.erreurs ?? [donnees.erreur ?? "Inscription impossible pour le moment."]);
      }
    } catch {
      setErreurs(["Inscription impossible pour le moment."]);
    } finally {
      setOccupe(false);
    }
  };

  if (resultat) {
    return <main className="auth-page">
      <section className="auth-card auth-card-large" aria-labelledby="titre-inscription">
        <div className="auth-logo"><Logo/></div>
        <h1 id="titre-inscription">Demande enregistrée</h1>
        <div className="auth-message auth-message-succes" role="status">
          <Icon name="check" size={18}/>
          <div>
            <strong>En attente de validation</strong>
            <p>Votre demande a été transmise à l&apos;administration de l&apos;hôpital. Votre compte reste bloqué jusqu&apos;à sa validation.</p>
          </div>
        </div>
        {type === "patient" && resultat.matricule && <div className="auth-matricule">
          <span>Votre matricule</span>
          <strong>{resultat.matricule}</strong>
          <p>Notez-le. Il vous sera demandé pour vous connecter une fois votre compte validé.</p>
        </div>}
        {type === "personnel" && <p className="auth-intro">Vous pourrez vous connecter avec votre matricule d&apos;hôpital une fois votre compte validé.</p>}
        <Link href="/login" className="button button-primary auth-submit">Aller à la connexion</Link>
      </section>
    </main>;
  }

  return <main className="auth-page">
    <section className="auth-card auth-card-large" aria-labelledby="titre-inscription">
      <div className="auth-logo"><Logo/></div>
      <h1 id="titre-inscription">Créer un compte</h1>
      <p className="auth-intro">Données fictives uniquement. Le compte sera validé par l&apos;hôpital avant tout accès.</p>

      <fieldset className="auth-choix">
        <legend>Je suis</legend>
        <label><input type="radio" name="type" checked={type === "patient"} onChange={() => setType("patient")}/><span>Patient</span></label>
        <label><input type="radio" name="type" checked={type === "personnel"} onChange={() => setType("personnel")}/><span>Personnel de l&apos;hôpital</span></label>
      </fieldset>

      <form onSubmit={soumettre} noValidate className="auth-form">
        <div className="auth-deux">
          <label className="auth-field">
            <span>Nom</span>
            <input value={champs.nom} onChange={e => modifier("nom", e.target.value)} autoComplete="family-name"/>
          </label>
          <label className="auth-field">
            <span>Prénom</span>
            <input value={champs.prenom} onChange={e => modifier("prenom", e.target.value)} autoComplete="given-name"/>
          </label>
        </div>

        {type === "personnel" && <>
          <label className="auth-field">
            <span>Matricule de l&apos;hôpital</span>
            <input value={champs.matricule} onChange={e => modifier("matricule", e.target.value)} placeholder="Ex. 26PS00012"/>
          </label>
          <label className="auth-field">
            <span>Fonction</span>
            <select value={champs.fonction} onChange={e => modifier("fonction", e.target.value)}>
              <option value="">Choisir…</option>
              {FONCTIONS.map(f => <option key={f.valeur} value={f.valeur}>{f.libelle}</option>)}
            </select>
          </label>
        </>}

        <label className="auth-field">
          <span>E-mail <small>(sert uniquement à réinitialiser le mot de passe)</small></span>
          <input type="email" value={champs.email} onChange={e => modifier("email", e.target.value)} autoComplete="email"/>
        </label>

        <label className="auth-field">
          <span>Mot de passe <small>(12 caractères minimum)</small></span>
          <input type="password" value={champs.motDePasse} onChange={e => modifier("motDePasse", e.target.value)} autoComplete="new-password"/>
        </label>

        <label className="auth-field">
          <span>Confirmer le mot de passe</span>
          <input type="password" value={champs.confirmation} onChange={e => modifier("confirmation", e.target.value)} autoComplete="new-password"/>
        </label>

        {erreurs.map(erreur => <p key={erreur} role="alert" className="auth-erreur"><Icon name="alert" size={16}/>{erreur}</p>)}

        <button type="submit" className="button button-primary auth-submit" disabled={occupe}>
          {occupe ? "Création en cours…" : "Envoyer ma demande"}
        </button>
      </form>

      <nav className="auth-liens" aria-label="Autres actions">
        <Link href="/login">J&apos;ai déjà un compte</Link>
      </nav>
    </section>
  </main>;
}
