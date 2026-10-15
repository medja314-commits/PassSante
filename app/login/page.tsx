"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const HOME: Record<string, string> = {
  hospital_staff: "/dashboard",
  patient: "/espace-patient",
  admin: "/admin/users",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      console.log("uid:", cred.user.uid, "existe:", snap.exists(), "data:", snap.data());
      const role = snap.data()?.role as string | undefined;
      if (!role) { setError("Aucun rôle associé à ce compte."); setBusy(false); return; }
      router.push(HOME[role] ?? "/dashboard");
    } catch (err) {
      console.error(err);
      const code = (err as { code?: string }).code ?? "inconnue";
      setError(`Connexion impossible (${code}).`);
      setBusy(false);
    }
  };

  return <main style={{ maxWidth: 380, margin: "80px auto", padding: 16 }}>
    <h1>Connexion</h1>
    <p>Compte de démonstration uniquement. Aucune donnée réelle.</p>
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: 12 }}>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" style={{ width: "100%" }} /></label>
      <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" style={{ width: "100%" }} /></label>
      {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
      <button type="submit" disabled={busy || !email || !password}>{busy ? "Connexion..." : "Se connecter"}</button>
    </form>
  </main>;
}