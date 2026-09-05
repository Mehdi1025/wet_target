export type AgencyDashboard = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
};

/** Un dashboard par activité Target Agency (aligné sur la landing page). */
export const AGENCY_DASHBOARDS: AgencyDashboard[] = [
  {
    id: "branding",
    label: "Branding & Identité visuelle",
    shortLabel: "Branding",
    description:
      "Logos, chartes graphiques et identités de marque cohérentes.",
    accent: "hsl(318 58% 66%)",
  },
  {
    id: "sites-web",
    label: "Création de sites web",
    shortLabel: "Sites web",
    description:
      "Sites modernes, UX/UI sur mesure et mise en ligne.",
    accent: "hsl(173 58% 39%)",
  },
  {
    id: "reseaux-sociaux",
    label: "Stratégie digitale & Réseaux sociaux",
    shortLabel: "Réseaux sociaux",
    description:
      "Community management, contenus et analyse des performances.",
    accent: "hsl(220 70% 50%)",
  },
  {
    id: "publicite",
    label: "Acquisition & Publicité",
    shortLabel: "Publicité",
    description:
      "Campagnes paid, ciblage audiences et optimisation ROAS.",
    accent: "hsl(12 76% 61%)",
  },
  {
    id: "automatisation",
    label: "Automatisation & Intelligence artificielle",
    shortLabel: "Automatisation & IA",
    description:
      "Workflows intelligents, connexion d'outils et gain de temps.",
    accent: "hsl(197 37% 24%)",
  },
];

export const DEFAULT_DASHBOARD_ID = AGENCY_DASHBOARDS[0].id;

export function getDashboardById(id: string): AgencyDashboard | undefined {
  return AGENCY_DASHBOARDS.find((d) => d.id === id);
}

export function getDashboardPath(id: string): string {
  return `/admin/dashboard/${id}`;
}
