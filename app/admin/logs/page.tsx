import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Sidickk):
// Connecter cette page au journal d'audit réel.
// Ajouter la pagination et l'export serveur.
export default function AdminLogsPage() {
  return <PassSanteApp area="admin" view="logs"/>;
}
