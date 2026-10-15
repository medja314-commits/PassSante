import { NextResponse, type NextRequest } from "next/server";
import { ACCUEIL_PAR_ROLE, COOKIE_SESSION, PAGE_ATTENTE, accesPourSession, routeAccesPourRole } from "@/lib/server/auth-core";
import { verifierSession } from "@/lib/server/auth-firebase";

// Protection des routes : vérifie le cookie de session auprès de Firebase, puis le statut et le rôle.
// Le proxy s'exécute côté Node.js, donc Firebase Admin est disponible.
// DEMO_MODE=true désactive la protection : secours pour la démonstration uniquement.
export async function proxy(request: NextRequest) {
  if (process.env.DEMO_MODE === "true") return NextResponse.next();

  const chemin = request.nextUrl.pathname;
  const protegee = chemin === PAGE_ATTENTE || routeAccesPourRole(chemin) !== null;
  if (!protegee) return NextResponse.next();

  const session = await verifierSession(request.cookies.get(COOKIE_SESSION)?.value);
  if (!session) {
    const connexion = new URL("/login", request.url);
    connexion.searchParams.set("suite", chemin);
    return NextResponse.redirect(connexion);
  }

  if (!accesPourSession(session, chemin)) {
    const destination = session.statut === "valide" && session.role ? ACCUEIL_PAR_ROLE[session.role] : PAGE_ATTENTE;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/attente",
    "/dashboard/:path*",
    "/patients/:path*",
    "/agenda/:path*",
    "/examens/:path*",
    "/assistant/:path*",
    "/espace-patient/:path*",
    "/admin/:path*",
    "/api/assistant",
    "/api/assistant/:path*",
  ],
};
