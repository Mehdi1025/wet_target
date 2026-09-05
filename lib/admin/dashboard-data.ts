import type { AgencyDashboard } from "@/lib/admin/dashboards";

export function seedFromId(id: string): number {
  return id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export type KpiMetric = {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  sparkData: number[];
};

export type ActivityMetrics = {
  kpis: [KpiMetric, KpiMetric, KpiMetric];
  totalRevenueLabel: string;
  totalRevenue: number;
  revenueGrowth: number;
  chartMainTitle: string;
  chartMainSubtitle: string;
  chartBarTitle: string;
  chartBarSubtitle: string;
  tableTitle: string;
  tableSubtitle: string;
  monthlyData: { month: string; desktop: number; mobile: number }[];
  revenueData: { month: string; revenue: number }[];
};

const SPARK_A = [40, 55, 48, 62, 58, 70, 65, 78];
const SPARK_B = [30, 42, 38, 50, 45, 55, 52, 60];
const SPARK_C = [55, 48, 52, 44, 40, 38, 35, 32];

function baseMonthly(seed: number) {
  return [
    { month: "Jan", desktop: 186 + (seed % 40), mobile: 80 + (seed % 30) },
    { month: "Fév", desktop: 305 + (seed % 50), mobile: 200 + (seed % 40) },
    { month: "Mar", desktop: 237 + (seed % 45), mobile: 120 + (seed % 35) },
    { month: "Avr", desktop: 173 + (seed % 20), mobile: 190 + (seed % 30) },
    { month: "Mai", desktop: 209 + (seed % 40), mobile: 130 + (seed % 25) },
    { month: "Juin", desktop: 214 + (seed % 35), mobile: 140 + (seed % 20) },
  ];
}

function baseRevenue(seed: number) {
  return [
    { month: "Jan", revenue: 4200 + seed },
    { month: "Fév", revenue: 5100 + seed },
    { month: "Mar", revenue: 4800 + seed },
    { month: "Avr", revenue: 6200 + seed },
    { month: "Mai", revenue: 5900 + seed },
    { month: "Juin", revenue: 7100 + seed },
  ];
}

const ACTIVITY_CONFIG: Record<AgencyDashboard["id"], Omit<ActivityMetrics, "monthlyData" | "revenueData">> = {
  branding: {
    kpis: [
      {
        title: "Projets branding actifs",
        value: "",
        change: "+18.20%",
        positive: true,
        sparkData: SPARK_A,
      },
      {
        title: "Identités livrées",
        value: "",
        change: "+12.40%",
        positive: true,
        sparkData: SPARK_B,
      },
      {
        title: "Satisfaction client",
        value: "",
        change: "+4.80%",
        positive: true,
        sparkData: SPARK_C,
      },
    ],
    totalRevenueLabel: "CA activité branding",
    totalRevenue: 0,
    revenueGrowth: 15.54,
    chartMainTitle: "Production créative — mensuelle",
    chartMainSubtitle: "Briefs reçus vs livrables finalisés",
    chartBarTitle: "Livrables",
    chartBarSubtitle: "Logos, chartes et supports",
    tableTitle: "Facturation branding",
    tableSubtitle: "Devis et paiements clients",
  },
  "sites-web": {
    kpis: [
      {
        title: "Sites en production",
        value: "",
        change: "+22.10%",
        positive: true,
        sparkData: SPARK_A,
      },
      {
        title: "Pages déployées",
        value: "",
        change: "+9.60%",
        positive: true,
        sparkData: SPARK_B,
      },
      {
        title: "Score perf. moyen",
        value: "",
        change: "+3.20%",
        positive: true,
        sparkData: SPARK_C,
      },
    ],
    totalRevenueLabel: "CA activité sites web",
    totalRevenue: 0,
    revenueGrowth: 11.2,
    chartMainTitle: "Développement web — mensuel",
    chartMainSubtitle: "Projets lancés vs sites mis en ligne",
    chartBarTitle: "Déploiements",
    chartBarSubtitle: "Mises en ligne ce semestre",
    tableTitle: "Facturation web",
    tableSubtitle: "Acomptes et soldes projets",
  },
  "reseaux-sociaux": {
    kpis: [
      {
        title: "Comptes gérés",
        value: "",
        change: "+8.50%",
        positive: true,
        sparkData: SPARK_A,
      },
      {
        title: "Publications / mois",
        value: "",
        change: "+24.30%",
        positive: true,
        sparkData: SPARK_B,
      },
      {
        title: "Taux d'engagement",
        value: "",
        change: "-1.40%",
        positive: false,
        sparkData: SPARK_C,
      },
    ],
    totalRevenueLabel: "CA activité social media",
    totalRevenue: 0,
    revenueGrowth: 9.8,
    chartMainTitle: "Engagement — mensuel",
    chartMainSubtitle: "Portée organique vs interactions",
    chartBarTitle: "Publications",
    chartBarSubtitle: "Posts planifiés et publiés",
    tableTitle: "Facturation social",
    tableSubtitle: "Forfaits et renouvellements",
  },
  publicite: {
    kpis: [
      {
        title: "Campagnes actives",
        value: "",
        change: "+14.70%",
        positive: true,
        sparkData: SPARK_A,
      },
      {
        title: "Leads générés",
        value: "",
        change: "+31.20%",
        positive: true,
        sparkData: SPARK_B,
      },
      {
        title: "ROAS moyen",
        value: "",
        change: "-2.80%",
        positive: false,
        sparkData: SPARK_C,
      },
    ],
    totalRevenueLabel: "Budget ads géré",
    totalRevenue: 0,
    revenueGrowth: 19.4,
    chartMainTitle: "Performance ads — mensuelle",
    chartMainSubtitle: "Impressions vs conversions",
    chartBarTitle: "Conversions",
    chartBarSubtitle: "Résultats campagnes paid",
    tableTitle: "Dépenses publicitaires",
    tableSubtitle: "Meta, Google Ads et TikTok",
  },
  automatisation: {
    kpis: [
      {
        title: "Workflows actifs",
        value: "",
        change: "+27.50%",
        positive: true,
        sparkData: SPARK_A,
      },
      {
        title: "Heures économisées",
        value: "",
        change: "+19.10%",
        positive: true,
        sparkData: SPARK_B,
      },
      {
        title: "Outils connectés",
        value: "",
        change: "+6.00%",
        positive: true,
        sparkData: SPARK_C,
      },
    ],
    totalRevenueLabel: "CA activité automatisation",
    totalRevenue: 0,
    revenueGrowth: 13.6,
    chartMainTitle: "Automatisation — mensuelle",
    chartMainSubtitle: "Tâches manuelles vs automatisées",
    chartBarTitle: "Exécutions",
    chartBarSubtitle: "Runs de workflows ce mois",
    tableTitle: "Facturation IA & automation",
    tableSubtitle: "Setup et maintenance mensuelle",
  },
};

const VALUE_SETS: Record<
  AgencyDashboard["id"],
  [string, string, string, number]
> = {
  branding: ["12", "34", "4.9/5", 18420],
  "sites-web": ["8", "142", "94", 24680],
  "reseaux-sociaux": ["18", "486", "6.8%", 12850],
  publicite: ["14", "892", "3.4x", 35200],
  automatisation: ["23", "340 h", "17", 22100],
};

export function getDashboardMetrics(dashboardId: string): ActivityMetrics {
  const seed = seedFromId(dashboardId);
  const config =
    ACTIVITY_CONFIG[dashboardId as AgencyDashboard["id"]] ??
    ACTIVITY_CONFIG.branding;
  const values =
    VALUE_SETS[dashboardId as AgencyDashboard["id"]] ?? VALUE_SETS.branding;

  const kpis = config.kpis.map((kpi, i) => ({
    ...kpi,
    value: values[i],
  })) as [KpiMetric, KpiMetric, KpiMetric];

  return {
    ...config,
    kpis,
    totalRevenue: values[3] + seed * 8,
    monthlyData: baseMonthly(seed),
    revenueData: baseRevenue(seed),
  };
}

export const TEAM_MEMBERS = [
  { name: "Adam Fisli", email: "adam@target-agency.fr", role: "Owner" },
  { name: "Mahdi Benali", email: "mahdi@target-agency.fr", role: "Member" },
  { name: "Sophie Leroy", email: "sophie@target-agency.fr", role: "Member" },
];

export const MOCK_PAYMENTS = [
  { status: "success" as const, email: "client@luxkey.fr", amount: 4200.0 },
  { status: "success" as const, email: "contact@latifab.fr", amount: 2800.0 },
  { status: "processing" as const, email: "devis@mb-reign.com", amount: 8500.0 },
  { status: "failed" as const, email: "billing@startup.io", amount: 1200.0 },
  { status: "success" as const, email: "hello@gourmandises.fr", amount: 1950.0 },
];
