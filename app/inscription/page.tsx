"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

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
  const [resultat, setResultat] = useState<{ matricule: string } | null>(null);
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
    return <main style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <h1>Inscription enregistrée</h1>
      {type === "patient"
        ? <>
            <p>Votre matricule est :</p>
            <p style={{ fontSize: 22, fontWeight: 700 }}>{resultat.matricule}</p>
            <p role="alert"><strong>Notez-le.</strong> Il vous sera demandé pour vous connecter.</p>
          </>
        : <p>Votre demande a été enregistrée. Votre compte sera activé par l&apos;administration de l&apos;hôpital.</p>}
      <p>Votre compte est en attente de validation par l&apos;administration.</p>
      <Link href="/login">Aller à la connexion</Link>
    </main>;
  }

  return <main style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
    <h1>Créer un compte</h1>
    <fieldset style={{ border: "none", padding: 0, marginBottom: 12 }}>
      <legend>Je suis</legend>
      <label style={{ marginRight: 16 }}><input type="radio" name="type" checked={type === "patient"} onChange={() => setType("patient")} /> Patient</label>
      <label><input type="radio" name="type" checked={type === "personnel"} onChange={() => setType("personnel")} /> Personnel de l&apos;hôpital</label>
    </fieldset>
    <p>Données fictives uniquement. Le compte sera validé par l&apos;hôpital avant tout accès.</p>
    <form onSubmit={soumettre} noValidate style={{ display: "grid", gap: 12 }}>
      <label>Nom<input value={champs.nom} onChange={e => modifier("nom", e.target.value)} autoComplete="family-name" style={{ width: "100%" }} /></label>
      <label>Prénom<input value={champs.prenom} onChange={e => modifier("prenom", e.target.value)} autoComplete="given-name" style={{ width: "100%" }} /></label>
      {type === "personnel" && <>
        <label>Matricule de l&apos;hôpital (26PS suivi de 5 chiffres)<input value={champs.matricule} onChange={e => modifier("matricule", e.target.value)} style={{ width: "100%" }} /></label>
        <label>Fonction<select value={champs.fonction} onChange={e => modifier("fonction", e.target.value)} style={{ width: "100%" }}>
          <option value="">Choisir…</option>
          {FONCTIONS.map(f => <option key={f.valeur} value={f.valeur}>{f.libelle}</option>)}
        </select></label>
      </>}
      <label>E-mail (sert uniquement à réinitialiser le mot de passe)<input type="email" value={champs.email} onChange={e => modifier("email", e.target.value)} autoComplete="email" style={{ width: "100%" }} /></label>
      <label>Mot de passe (12 caractères minimum)<input type="password" value={champs.motDePasse} onChange={e => modifier("motDePasse", e.target.value)} autoComplete="new-password" style={{ width: "100%" }} /></label>
      <label>Confirmer le mot de passe<input type="password" value={champs.confirmation} onChange={e => modifier("confirmation", e.target.value)} autoComplete="new-password" style={{ width: "100%" }} /></label>
      {erreurs.map(erreur => <p key={erreur} role="alert" style={{ color: "#b42318" }}>{erreur}</p>)}
      <button type="submit" disabled={occupe}>{occupe ? "Création..." : "Créer mon compte"}</button>
    </form>
    <p><Link href="/login">J&apos;ai déjà un compte</Link></p>
  </main>;
}
