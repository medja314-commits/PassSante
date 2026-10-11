import PassSanteApp from "@/components/layout/pass-sante-app";

// Dates calculées à chaque requête (données de démonstration relatives à aujourd'hui).
export const dynamic = "force-dynamic";

// TODO(Sidickk):
// Connecter cette page à l'API de gestion des rôles.
// Implémenter la création et modification des rôles personnalisés.
// Gérer les permissions granulaires pour chaque rôle.
// Afficher le nombre d'utilisateurs par rôle.
// Implémenter la suppression des rôles (avec vérification des utilisateurs affectés).
// Gérer les claims personnalisés (facilityId, canPrescribe, etc).
export default function AdminRolesPage() {
  return <PassSanteApp area="admin" view="roles"/>;
}
