"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui";
import type { ReponseIA, SourceCitee } from "@/types/assistant";

type Echange = {
  question: string;
  reponse?: ReponseIA;
  erreur?: string;
};

// Dossier ouvert dans cette page (démonstration) : les questions sur le dossier sont contrôlées pour ce patient.
const PATIENT_OUVERT = "PS-2024-0812";

const SUGGESTIONS = [
  "Quel est le résultat de la troponine ?",
  "Quelle est l'allergie connue du patient ?",
];

// "dossier" : questions sur le patient, réponses fondées sur le dossier.
// "generale" : santé générale, recherche web, aucune donnée du dossier n'est envoyée.
type Mode = "dossier" | "generale";

// Conversation avec l'assistant. Chaque réponse est envoyée à /api/assistant ; les sources reçues sont
// remontées au parent pour être affichées à droite.
export function ChatPanel({ onSources }: { onSources: (sources: SourceCitee[]) => void }) {
  const [brouillon, setBrouillon] = useState("");
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState<Mode>("dossier");

  const envoyer = async (event: FormEvent) => {
    event.preventDefault();
    const question = brouillon.trim();
    if (!question || chargement) return;

    setBrouillon("");
    setChargement(true);
    try {
      const reponse = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode, patientId: mode === "dossier" ? PATIENT_OUVERT : undefined }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur ?? "Erreur inconnue");

      const resultat = donnees as ReponseIA;
      setEchanges(current => [...current, { question, reponse: resultat }]);
      onSources(resultat.sources);
    } catch {
      setEchanges(current => [...current, { question, erreur: "L'assistant est indisponible pour le moment. Réessayez." }]);
    } finally {
      setChargement(false);
    }
  };

  return <section className="chat-panel">
    <div className="chat-scroll">
      {echanges.length === 0 && <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Assistant PassSanté</b><p>Posez une question sur le dossier. Je réponds uniquement à partir des informations auxquelles vous avez accès, avec leurs sources.</p></div></div>}
      {echanges.map((echange, index) => <div className="chat-exchange" key={index}>
        <div className="user-message"><p>{echange.question}</p></div>
        {echange.reponse && <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div>
          {echange.reponse.origine === "modele"
            ? <b>{echange.reponse.sources.some(source => source.url) ? "Réponse générée par IA à partir de sources web" : "Réponse générée par IA"}</b>
            : <b>Message de sécurité de l'assistant</b>}
          <div className="ai-answer">
            <p>{echange.reponse.texte}</p>
            {echange.reponse.origine === "modele"
              ? <div className="ai-note"><Icon name="alert" size={14}/>Texte généré par IA : à vérifier avant toute décision clinique.</div>
              : <div className="ai-note"><Icon name="lock" size={14}/>Message fixe de l'application, non généré par l'IA.</div>}
            {echange.reponse.requeteWeb && <small className="ai-note">Requête envoyée au moteur de recherche (anonymisée) : « {echange.reponse.requeteWeb} »</small>}
          </div>
        </div></div>}
        {echange.erreur && <div className="ai-message" role="alert"><span className="ai-avatar"><Icon name="alert"/></span><div><b>Erreur</b><p>{echange.erreur}</p></div></div>}
      </div>)}
      {chargement && <div className="ai-message" role="status"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Assistant PassSanté</b><p>Recherche dans les documents autorisés…</p></div></div>}
    </div>
    <div className="suggestions">
      {SUGGESTIONS.map(suggestion => <button key={suggestion} type="button" onClick={() => setBrouillon(suggestion)}>{suggestion}</button>)}
    </div>
    <div className="suggestions" role="group" aria-label="Portée de la question">
      <button type="button" aria-pressed={mode === "dossier"} onClick={() => setMode("dossier")}>Question sur le dossier</button>
      <button type="button" aria-pressed={mode === "generale"} onClick={() => setMode("generale")}>Santé générale (web)</button>
    </div>
    <form className="chat-input" onSubmit={envoyer}>
      <textarea value={brouillon} onChange={event => setBrouillon(event.target.value)} aria-label="Message" placeholder="Interroger le dossier médical..." maxLength={500}/>
      <button type="submit" aria-label="Envoyer" disabled={!brouillon.trim() || chargement}><Icon name="send"/></button>
      <small><Icon name="lock" size={12}/>Données fictives. Les réponses ne remplacent pas un avis médical.</small>
    </form>
  </section>;
}
