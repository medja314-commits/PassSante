import { NextResponse } from "next/server";
import { COOKIE_SESSION, DUREE_SESSION_MS, MESSAGE_ECHEC, connecter, matriculeValide } from "@/lib/server/auth-core";
import { depsConnexion } from "@/lib/server/auth-firebase";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

const LONGUEUR_MAX_MOT_DE_PASSE = 200;

// Connexion par matricule. Le navigateur ne reçoit jamais l'email, et les échecs ont un message unique.
export async function POST(request: Request) {
  let corps: { matricule?: unknown; motDePasse?: unknown };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: MESSAGE_ECHEC }, { status: 400 });
  }

  const matricule = typeof corps.matricule === "string" ? corps.matricule.trim().toUpperCase() : "";
  const motDePasse = typeof corps.motDePasse === "string" ? corps.motDePasse : "";
  if (!matriculeValide(matricule) || motDePasse.length === 0 || motDePasse.length > LONGUEUR_MAX_MOT_DE_PASSE) {
    return NextResponse.json({ erreur: MESSAGE_ECHEC }, { status: 401 });
  }

  try {
    const resultat = await connecter(depsConnexion, matricule, motDePasse);

    if (!resultat.ok) {
      // Journal : seulement si le compte est connu (le rôle est requis par logAction).
      if (resultat.role) logAction(resultat.role, "connexion", "session", resultat.uid, false);
      return NextResponse.json({ erreur: resultat.message }, { status: 401 });
    }

    logAction(resultat.role, "connexion", "session", resultat.uid, true);
    const reponse = NextResponse.json({ redirect: resultat.redirect });
    reponse.cookies.set(COOKIE_SESSION, resultat.cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DUREE_SESSION_MS / 1000,
    });
    return reponse;
  } catch (erreur) {
    // Le détail reste côté serveur.
    console.error("Connexion impossible :", erreur);
    return NextResponse.json({ erreur: "Connexion impossible pour le moment." }, { status: 500 });
  }
}
