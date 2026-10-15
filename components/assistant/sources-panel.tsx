import { Icon } from "@/components/ui";
import type { SourceCitee } from "@/types/assistant";

// Panneau des sources : affiche uniquement les passages du dossier cités par la dernière réponse.
// Il reste visuellement séparé de la réponse générée par l'IA (NF-14).
export function SourcesPanel({ sources }: { sources: SourceCitee[] }) {
  return <aside className="sources-panel">
    <div className="sources-head">
      <div><h2>Extraits du dossier</h2><p>{sources.length > 0 ? `${sources.length} passage(s) cité(s), tels qu'enregistrés` : "Aucun extrait pour le moment"}</p></div>
      <Icon name="file"/>
    </div>
    {sources.map(source => <div className="source-card" key={source.id}>
      <span className="source-number">{source.numero}</span>
      <div className="source-type"><Icon name={source.url ? "shield" : "file"} size={14}/>{source.url ? "SOURCE WEB EXTERNE" : "DOSSIER PATIENT"}</div>
      <strong>{source.source}</strong>
      <p>« {source.texte} »</p>
      {source.url && <small><a href={source.url} target="_blank" rel="noopener noreferrer">Ouvrir la source</a></small>}
    </div>)}
    <div className="privacy-note"><Icon name="shield"/><p><strong>Données fictives</strong><br/>Seuls les passages auxquels l'utilisateur a accès peuvent être cités.</p></div>
  </aside>;
}
