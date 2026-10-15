import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_SESSION } from "./auth-core";
import { verifierSession } from "./auth-firebase";
import { peutAdministrer } from "./comptes-core";

// Garde des routes d'administration : session valide, statut validé, rôle admin. Vérifié côté serveur.
export async function gardeAdmin() {
  const jar = await cookies();
  const session = await verifierSession(jar.get(COOKIE_SESSION)?.value);
  if (!session) {
    return { ok: false as const, reponse: NextResponse.json({ erreur: "Connexion requise." }, { status: 401 }) };
  }
  if (!peutAdministrer({ statut: session.statut, role: session.role })) {
    return { ok: false as const, reponse: NextResponse.json({ erreur: "Accès refusé." }, { status: 403 }) };
  }
  return { ok: true as const, session };
}
