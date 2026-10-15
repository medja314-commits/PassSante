// Client de recherche web Tavily, utilisé uniquement pour les questions de santé générale (BF-045).
// La clé est lue côté serveur ; elle n'est jamais envoyée au navigateur.

export type ExtraitWeb = {
  titre: string;
  url: string;
  extrait: string;
};

// Interface minimale : les tests fournissent une fausse recherche, la production utilise Tavily.
export type RechercheWeb = (requete: string) => Promise<ExtraitWeb[]>;

const URL_TAVILY = "https://api.tavily.com/search";
const NOMBRE_DE_RESULTATS = 4;
const DELAI_MAX_MS = 10_000;

export async function rechercherSurTavily(requete: string): Promise<ExtraitWeb[]> {
  const cle = process.env.TAVILY_API_KEY;
  if (!cle) {
    throw new Error("TAVILY_API_KEY doit être définie");
  }

  const reponse = await fetch(URL_TAVILY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: requete,
      max_results: NOMBRE_DE_RESULTATS,
      search_depth: "basic",
    }),
    signal: AbortSignal.timeout(DELAI_MAX_MS),
  });

  if (!reponse.ok) {
    throw new Error(`Tavily a répondu ${reponse.status}`);
  }

  const donnees = (await reponse.json()) as {
    results?: { title?: string; url?: string; content?: string }[];
  };

  return (donnees.results ?? [])
    .filter(resultat => resultat.url && resultat.content)
    .map(resultat => ({
      titre: resultat.title ?? resultat.url ?? "Source web",
      url: resultat.url ?? "",
      extrait: resultat.content ?? "",
    }));
}
