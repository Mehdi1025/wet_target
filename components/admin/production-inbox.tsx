"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  Inbox,
  Mail,
  RefreshCw,
  User,
} from "lucide-react";

import type { CrmWonLead } from "@/lib/crm/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function formatAmount(amount: number) {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function contactName(lead: CrmWonLead) {
  const parts = [lead.prenom, lead.nom].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Contact non renseigné";
}

export function ProductionInbox() {
  const [leads, setLeads] = useState<CrmWonLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CrmWonLead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/won-leads", { cache: "no-store" });
      const data = (await res.json()) as {
        leads?: CrmWonLead[];
        error?: string;
        detail?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      setLeads(data.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const totalAmount = leads.reduce((sum, l) => sum + (l.deal_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Inbox className="h-8 w-8" />
            Inbox de Production
          </h1>
          <p className="text-muted-foreground">
            Deals gagnés synchronisés depuis Target OS (CRM)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchLeads()}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deals à produire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur totale signée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatAmount(totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive">Connexion CRM</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vérifiez <code className="rounded bg-muted px-1">CRM_WON_LEADS_URL</code>{" "}
              et <code className="rounded bg-muted px-1">AGENCY_API_SECRET</code> dans{" "}
              <code className="rounded bg-muted px-1">.env.local</code>, puis
              actualisez.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
      ) : leads.length === 0 && !error ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">Aucun deal gagné en attente</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Les contrats signés dans Target OS apparaîtront ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className="cursor-pointer shadow-sm transition-colors hover:bg-muted/30"
              onClick={() => setSelected(lead)}
            >
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{lead.entreprise}</p>
                    <Badge variant="success">Deal gagné</Badge>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {contactName(lead)}
                    <span className="text-muted-foreground/50">·</span>
                    <Mail className="h-3.5 w-3.5" />
                    {lead.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Signé le {formatDate(lead.created_at)}
                    {lead.rdv_date
                      ? ` · RDV ${formatDate(lead.rdv_date)}`
                      : null}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-bold tabular-nums">
                    {formatAmount(lead.deal_amount)}
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Voir la fiche →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.entreprise}</SheetTitle>
                <SheetDescription>
                  Deal gagné · {formatAmount(selected.deal_amount)}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Entreprise</p>
                      <p className="text-muted-foreground">{selected.entreprise}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-muted-foreground">{contactName(selected)}</p>
                      <p className="text-muted-foreground">{selected.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Dates</p>
                      <p className="text-muted-foreground">
                        Signé : {formatDate(selected.created_at)}
                      </p>
                      <p className="text-muted-foreground">
                        RDV : {formatDate(selected.rdv_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {selected.notes ? (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-medium">Notes CRM</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {selected.notes}
                    </p>
                  </div>
                ) : null}

                {selected.slug ? (
                  <p className="text-xs text-muted-foreground">
                    Slug CRM : <code>{selected.slug}</code>
                  </p>
                ) : null}

                <Button className="w-full" disabled>
                  Créer un projet (bientôt)
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
