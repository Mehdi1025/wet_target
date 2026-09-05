"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bot,
  Calendar,
  Download,
  Globe,
  Megaphone,
  MoreHorizontal,
  Palette,
  Share2,
  type LucideIcon,
} from "lucide-react";

import type { AgencyDashboard } from "@/lib/admin/dashboards";
import {
  getDashboardMetrics,
  MOCK_PAYMENTS,
  TEAM_MEMBERS,
} from "@/lib/admin/dashboard-data";
import type { ContactRow } from "@/lib/supabase/contacts";
import { KpiCard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const CHART_1 = "hsl(12 76% 61%)";
const CHART_2 = "hsl(173 58% 39%)";
const CHART_3 = "hsl(197 37% 24%)";
const CHART_5 = "hsl(27 87% 67%)";

const ACTIVITY_ICONS: Record<AgencyDashboard["id"], [LucideIcon, LucideIcon, LucideIcon]> = {
  branding: [Palette, Palette, Palette],
  "sites-web": [Globe, Globe, Globe],
  "reseaux-sociaux": [Share2, Share2, Share2],
  publicite: [Megaphone, Megaphone, Megaphone],
  automatisation: [Bot, Bot, Bot],
};

function paymentStatusVariant(
  status: "success" | "processing" | "failed"
): "success" | "processing" | "failed" {
  return status;
}

function contactStatusVariant(
  status: ContactRow["status"]
): "success" | "processing" | "failed" | "secondary" | "outline" {
  const map = {
    new: "processing" as const,
    read: "secondary" as const,
    replied: "success" as const,
    archived: "outline" as const,
  };
  return map[status];
}

function contactStatusLabel(status: ContactRow["status"]) {
  const map = {
    new: "Nouveau",
    read: "Lu",
    replied: "Répondu",
    archived: "Archivé",
  };
  return map[status];
}

export function DashboardOverview({
  dashboard,
  contactCount,
  contacts,
}: {
  dashboard: AgencyDashboard;
  contactCount: number | null;
  contacts: ContactRow[];
  supabaseConnected: boolean;
}) {
  const metrics = getDashboardMetrics(dashboard.id);
  const leads = contactCount ?? 0;
  const icons =
    ACTIVITY_ICONS[dashboard.id as AgencyDashboard["id"]] ??
    ACTIVITY_ICONS.branding;
  const gradientId = `grad-${dashboard.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dashboard.label}</h1>
          <p className="text-muted-foreground">{dashboard.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            Choisir une date
          </Button>
          <Button size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Rapports
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.kpis.map((kpi, index) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                icon={icons[index]}
                value={kpi.value}
                change={kpi.change}
                positive={kpi.positive}
                sparkData={kpi.sparkData}
              />
            ))}
            <Card className="shadow-sm md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metrics.totalRevenueLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {metrics.totalRevenue.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
                <div className="mt-2 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.revenueData}>
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_3}
                        strokeWidth={2}
                        dot={{ r: 3, fill: CHART_3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>{metrics.chartMainTitle}</CardTitle>
                <CardDescription>{metrics.chartMainSubtitle}</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.monthlyData}>
                    <defs>
                      <linearGradient id={`${gradientId}-a`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_1} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_1} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id={`${gradientId}-b`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_2} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_2} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90%)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(240 3.8% 46.1%)", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(240 3.8% 46.1%)", fontSize: 12 }}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="desktop"
                      stroke={CHART_1}
                      fill={`url(#${gradientId}-a)`}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="mobile"
                      stroke={CHART_2}
                      fill={`url(#${gradientId}-b)`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="col-span-3 flex flex-col gap-4">
              <Card className="flex-1 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{metrics.chartBarTitle}</CardTitle>
                  <CardDescription>{metrics.chartBarSubtitle}</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90%)" />
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="mobile" fill={CHART_2} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="desktop" fill={CHART_5} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>{metrics.tableTitle}</CardTitle>
                <CardDescription>
                  {metrics.tableSubtitle} · {leads} messages contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Input placeholder="Filtrer les emails..." className="max-w-sm" />
                  <Button variant="outline" size="sm" className="ml-auto">
                    Colonnes
                  </Button>
                </div>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="w-10 p-3">
                          <input type="checkbox" className="rounded border-input" />
                        </th>
                        <th className="p-3 text-left font-medium">Statut</th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-right font-medium">Montant</th>
                        <th className="w-10 p-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PAYMENTS.map((payment, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3">
                            <input type="checkbox" className="rounded border-input" />
                          </td>
                          <td className="p-3">
                            <Badge variant={paymentStatusVariant(payment.status)}>
                              {payment.status === "success"
                                ? "Succès"
                                : payment.status === "processing"
                                  ? "En cours"
                                  : "Échec"}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium">{payment.email}</td>
                          <td className="p-3 text-right tabular-nums">
                            {payment.amount.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {contacts.length > 0 ? (
                  <div className="mt-6">
                    <h4 className="mb-3 text-sm font-medium">Messages contact (Supabase)</h4>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <tbody>
                          {contacts.slice(0, 4).map((contact) => (
                            <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="p-3">
                                <Badge variant={contactStatusVariant(contact.status)}>
                                  {contactStatusLabel(contact.status)}
                                </Badge>
                              </td>
                              <td className="p-3">{contact.email}</td>
                              <td className="p-3 text-right text-muted-foreground">
                                {new Date(contact.created_at).toLocaleDateString("fr-FR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Membres de l&apos;équipe</CardTitle>
                <CardDescription>
                  Équipe dédiée — {dashboard.shortLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {TEAM_MEMBERS.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-muted text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {member.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <select
                      defaultValue={member.role}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="Member">Membre</option>
                      <option value="Owner">Propriétaire</option>
                    </select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Analytics — {dashboard.shortLabel}</CardTitle>
              <CardDescription>{dashboard.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Connectez vos outils de suivi pour l&apos;activité{" "}
              {dashboard.shortLabel.toLowerCase()}.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Rapports — {dashboard.shortLabel}</CardTitle>
              <CardDescription>Exports PDF et CSV par activité.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Fonctionnalité à venir.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Alertes pour {dashboard.shortLabel.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Aucune notification pour le moment.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
