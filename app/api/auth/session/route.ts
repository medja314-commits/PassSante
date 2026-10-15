import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_SESSION } from "@/lib/server/auth-core";
import { verifierSession } from "@/lib/server/auth-firebase";

export const dynamic = "force-dynamic";

// Rôle de la session courante, lu côté serveur. Ne renvoie jamais l'email.
// demo indique si le mode démonstration est actif (sélecteur de rôle affiché).
export async function GET() {
  const jar = await cookies();
  const session = await verifierSession(jar.get(COOKIE_SESSION)?.value);
  return NextResponse.json({
    connecte: Boolean(session),
    statut: session?.statut ?? null,
    role: session?.role ?? null,
    demo: process.env.DEMO_MODE === "true",
  });
}
