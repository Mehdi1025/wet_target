export type RevenueByActivity = {
  id: string;
  label: string;
  share: number;
  amount: number;
  color: string;
};

/** CA mensuel total et répartition par activité (à connecter à un CRM plus tard). */
export const MONTHLY_REVENUE_TOTAL = 108_250;

export const REVENUE_BY_ACTIVITY: RevenueByActivity[] = [
  {
    id: "branding",
    label: "Branding",
    share: 30,
    amount: Math.round(MONTHLY_REVENUE_TOTAL * 0.3),
    color: "hsl(318 58% 66%)",
  },
  {
    id: "sites-web",
    label: "Sites web",
    share: 25,
    amount: Math.round(MONTHLY_REVENUE_TOTAL * 0.25),
    color: "hsl(173 58% 39%)",
  },
  {
    id: "reseaux-sociaux",
    label: "Réseaux sociaux",
    share: 20,
    amount: Math.round(MONTHLY_REVENUE_TOTAL * 0.2),
    color: "hsl(220 70% 50%)",
  },
  {
    id: "publicite",
    label: "Publicité",
    share: 15,
    amount: Math.round(MONTHLY_REVENUE_TOTAL * 0.15),
    color: "hsl(12 76% 61%)",
  },
  {
    id: "automatisation",
    label: "Automatisation & IA",
    share: 10,
    amount: Math.round(MONTHLY_REVENUE_TOTAL * 0.1),
    color: "hsl(197 37% 24%)",
  },
];

export const AGENCY_GLOBAL_KPIS = {
  projectsInProgress: 24,
  projectsGrowth: "+12.40%",
  revenueGrowth: "+18.60%",
  conversionGrowth: "+5.20%",
  sparkRevenue: [42, 58, 51, 65, 72, 68, 80, 88],
  sparkProjects: [18, 20, 19, 22, 21, 24, 23, 24],
  sparkLeads: [4, 6, 5, 8, 7, 9, 8, 10],
  sparkConversion: [12, 14, 13, 16, 15, 18, 17, 19],
};
