import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Cloud,
  Code2,
  Cog,
  CreditCard,
  Database,
  ExternalLink,
  Folder,
  Globe,
  Landmark,
  Link2,
  Megaphone,
  PenTool,
  Triangle,
  Wallet,
  Workflow,
  Zap,
} from "lucide-react";

export const ARSENAL_ICON_OPTIONS: {
  key: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "link", label: "Lien", icon: Link2 },
  { key: "globe", label: "Web", icon: Globe },
  { key: "cloud", label: "Cloud", icon: Cloud },
  { key: "database", label: "Base de données", icon: Database },
  { key: "code", label: "Code", icon: Code2 },
  { key: "pen", label: "Design", icon: PenTool },
  { key: "triangle", label: "Deploy", icon: Triangle },
  { key: "workflow", label: "Workflow", icon: Workflow },
  { key: "cog", label: "Automatisation", icon: Cog },
  { key: "credit-card", label: "Paiement", icon: CreditCard },
  { key: "landmark", label: "Banque", icon: Landmark },
  { key: "wallet", label: "Finance", icon: Wallet },
  { key: "megaphone", label: "Marketing", icon: Megaphone },
  { key: "chart", label: "Analytics", icon: BarChart3 },
  { key: "folder", label: "Dossier", icon: Folder },
  { key: "book", label: "Docs", icon: BookOpen },
  { key: "zap", label: "Action", icon: Zap },
  { key: "external", label: "Externe", icon: ExternalLink },
];

export const ARSENAL_ACCENT_OPTIONS = [
  { value: "text-zinc-100", label: "Blanc" },
  { value: "text-violet-400", label: "Violet" },
  { value: "text-fuchsia-400", label: "Fuchsia" },
  { value: "text-emerald-400", label: "Vert" },
  { value: "text-cyan-400", label: "Cyan" },
  { value: "text-blue-400", label: "Bleu" },
  { value: "text-indigo-400", label: "Indigo" },
  { value: "text-amber-400", label: "Ambre" },
  { value: "text-orange-400", label: "Orange" },
  { value: "text-sky-400", label: "Ciel" },
  { value: "text-zinc-400", label: "Gris" },
] as const;

const ICON_MAP = Object.fromEntries(
  ARSENAL_ICON_OPTIONS.map((option) => [option.key, option.icon])
) as Record<string, LucideIcon>;

export function getArsenalIcon(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey] ?? Link2;
}

export function getArsenalGlowClass(accentClass: string): string {
  const glowMap: Record<string, string> = {
    "text-zinc-100":
      "hover:shadow-[0_12px_40px_-16px_rgba(255,255,255,0.35)]",
    "text-violet-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(167,139,250,0.45)]",
    "text-fuchsia-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(232,121,249,0.45)]",
    "text-emerald-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(52,211,153,0.45)]",
    "text-cyan-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(34,211,238,0.45)]",
    "text-blue-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(96,165,250,0.45)]",
    "text-indigo-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(129,140,248,0.45)]",
    "text-amber-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(251,191,36,0.45)]",
    "text-orange-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(251,146,60,0.45)]",
    "text-sky-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(56,189,248,0.45)]",
    "text-zinc-400":
      "hover:shadow-[0_12px_40px_-16px_rgba(148,163,184,0.35)]",
  };

  return (
    glowMap[accentClass] ??
    "hover:shadow-[0_12px_40px_-16px_rgba(148,163,184,0.35)]"
  );
}
