import Link from "next/link";
import { Icon, Logo } from "@/components/ui";

// Affiché quand l'identifiant du dossier ne correspond à aucun patient.
export default function PatientNotFound() {
  return <main className="patient-not-found">
    <Logo/>
    <span className="round-icon blue"><Icon name="search" size={26}/></span>
    <span className="eyebrow">ERREUR 404</span>
    <h1>Dossier introuvable</h1>
    <p>Aucun dossier patient ne correspond à cet identifiant. Vérifiez le numéro de dossier ou revenez à la liste des patients.</p>
    <Link className="button button-primary" href="/patients"><span>Retour à la liste des patients</span></Link>
  </main>;
}
