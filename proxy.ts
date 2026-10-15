import { NextResponse, type NextRequest } from "next/server";
import { ACCUEIL_PAR_ROLE, COOKIE_SESSION, accesAutorise, routeAccesPourRole } from "@/lib/server/auth-core";
import { verifierSession } from "@/lib/server/auth-firebase";

// Protection des routes : vérifie le cookie de session auprès de Firebase, puis le rôle.
// Le proxy s'exécute côté Node.js, donc Firebase Admin est disponible.
// DEMO_MODE=true désactive la protection : secours pour la démonstration uniquement.
export async function proxy(request: NextRequest) {
  if (process.env.DEMO_MODE === "true") return NextResponse.next();

  const chemin = request.nextUrl.pathname;
  if (routeAccesPourRole(chemin) === null) return NextResponse.next();

  const session = await verifierSession(request.cookies.get(COOKIE_SESSION)?.value);
  if (!session) {
    const connexion = new URL("/login", request.url);
    connexion.searchParams.set("suite", chemin);
    return NextResponse.redirect(connexion);
  }

  if (!accesAutorise(session.role, chemin)) {
    return NextResponse.redirect(new URL(ACCUEIL_PAR_ROLE[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
