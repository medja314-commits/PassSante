import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_SESSION } from "@/lib/server/auth-core";
import { verifierSession } from "@/lib/server/auth-firebase";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Déconnexion : supprime le cookie de session. Les autres appareils restent connectés jusqu'à expiration.
export async function POST() {
  const jar = await cookies();
  const session = await verifierSession(jar.get(COOKIE_SESSION)?.value);
  if (session) logAction(session.role, "deconnexion", "session", session.uid, true);

  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE_SESSION, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return reponse;
}
