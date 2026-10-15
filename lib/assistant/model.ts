// Ce que le reste de l'assistant attend d'un modèle : recevoir un prompt, renvoyer un texte.
// Changer de fournisseur ne touche qu'à ce fichier.
export interface ModeleIA {
  generer(prompt: { systeme: string; utilisateur: string }): Promise<string>;
}

const URL_OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

// Appelle OpenRouter depuis le serveur. La clé vient de l'environnement serveur et n'est jamais envoyée au navigateur.
export class ModeleOpenRouter implements ModeleIA {
  constructor(
    private readonly cle: string,
    private readonly modele: string,
  ) {}

  async generer(prompt: { systeme: string; utilisateur: string }): Promise<string> {
    const reponse = await fetch(URL_OPENROUTER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modele,
        messages: [
          { role: "system", content: prompt.systeme },
          { role: "user", content: prompt.utilisateur },
        ],
      }),
    });

    if (!reponse.ok) {
      throw new Error(`OpenRouter a répondu ${reponse.status}`);
    }

    const donnees = (await reponse.json()) as { choices?: { message?: { content?: string } }[] };
    const texte = donnees.choices?.[0]?.message?.content;
    if (!texte) {
      throw new Error("Réponse vide du modèle");
    }
    return texte;
  }
}

// Construit le modèle à partir des variables d'environnement. Lève une erreur si elles manquent.
export function modeleParDefaut(): ModeleIA {
  const cle = process.env.OPENROUTER_API_KEY;
  const modele = process.env.OPENROUTER_MODEL;
  if (!cle || !modele) {
    throw new Error("OPENROUTER_API_KEY et OPENROUTER_MODEL doivent être définies");
  }
  return new ModeleOpenRouter(cle, modele);
}
