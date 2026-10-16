"use client";
import { useEffect, useState } from "react";

type CompteEnAttente = { uid: string; nom: string; prenom: string; typeDemande: string; fonctionDemandee: string; matricule: string; creeLe: string };

const FONCTIONS = ["medecin", "infirmier", "secretaire", "laboratoire"];

// Validation des comptes en attente. Seule cette page (côté serveur) attribue le rôle.
// Pour un patient, l'administrateur vérifie l'identité puis saisit l'identifiant du dossier existant.
export default function ComptesEnAttentePage() {
  const [comptes, setComptes] = useState<CompteEnAttente[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");
  const [dossiers, setDossiers] = useState<Record<string, string>>({});
  const [fonctions, setFonctions] = useState<Record<string, string>>({});

  const charger = async () => {
    setChargement(true);
    try {
      const reponse = await fetch("/api/admin/comptes", { cache: "no-store" });
      const donnees = await reponse.json();
      if (!reponse.ok) { setMessage(donnees.erreur ?? "Liste indisponible."); return; }
      setComptes(donnees.comptes);
    } catch {
      setMessage("Liste indisponible pour le moment.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const action = async (uid: string, chemin: "valider" | "refuser", corps?: object) => {
    setMessage("");
    const reponse = await fetch(`/api/admin/comptes/${uid}/${chemin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps ?? {}),
    });
    const donnees = await reponse.json();
    if (!reponse.ok) { setMessage(donnees.erreur ?? "Action impossible."); return; }
    setMessage(chemin === "valider" ? "Compte validé." : "Compte refusé.");
    await charger();
  };

  return <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
    <h1>Comptes en attente de validation</h1>
    <p>Vérifiez l&apos;identité avant de valider. Un patient doit être rattaché à son dossier existant.</p>
    {message && <p role="status">{message}</p>}
    {chargement && <p>Chargement…</p>}
    {!chargement && comptes.length === 0 && <p>Aucun compte en attente.</p>}
    {comptes.map(compte => <section key={compte.uid} style={{ border: "1px solid #d0d5dd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <p><strong>{compte.prenom} {compte.nom}</strong> · matricule {compte.matricule} · demande : {compte.typeDemande}{compte.fonctionDemandee ? ` (${compte.fonctionDemandee})` : ""}</p>
      <p style={{ fontSize: 12, color: "#5c6d7f" }}>Créé le {compte.creeLe}</p>
      {compte.typeDemande === "patient" && <label>Dossier à rattacher (PS-AAAA-NNNN)
        <input value={dossiers[compte.uid] ?? ""} onChange={e => setDossiers({ ...dossiers, [compte.uid]: e.target.value })} style={{ marginLeft: 8 }} />
      </label>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {compte.typeDemande === "patient" && <button type="button" onClick={() => action(compte.uid, "valider", { role: "patient", patientId: dossiers[compte.uid] ?? "" })}>Valider comme patient</button>}
        {compte.typeDemande === "personnel" && <>
          <select value={fonctions[compte.uid] ?? compte.fonctionDemandee} onChange={e => setFonctions({ ...fonctions, [compte.uid]: e.target.value })} aria-label="Fonction effective">
            {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="button" onClick={() => action(compte.uid, "valider", { role: "hospital_staff", fonction: fonctions[compte.uid] ?? compte.fonctionDemandee })}>Valider comme personnel</button>
        </>}
        <button type="button" onClick={() => action(compte.uid, "refuser")}>Refuser</button>
      </div>
    </section>)}
    <p><a href="/admin/users">Retour à l&apos;administration</a></p>
  </main>;
}
