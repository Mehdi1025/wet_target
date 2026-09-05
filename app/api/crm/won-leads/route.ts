import { NextResponse } from "next/server";

import { verifyAdminSessionFromRequest } from "@/lib/admin/session";
import type { CrmWonLead } from "@/lib/crm/types";

export type { CrmWonLead };

function normalizeLeads(payload: unknown): CrmWonLead[] {
  if (Array.isArray(payload)) {
    return payload as CrmWonLead[];
  }
  if (
    payload &&
    typeof payload === "object" &&
    "leads" in payload &&
    Array.isArray((payload as { leads: unknown }).leads)
  ) {
    return (payload as { leads: CrmWonLead[] }).leads;
  }
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: CrmWonLead[] }).data;
  }
  return [];
}

export async function GET(request: Request) {
  const session = await verifyAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const secret = process.env.AGENCY_API_SECRET;
  const url = process.env.CRM_WON_LEADS_URL;

  if (!secret || !url) {
    return NextResponse.json(
      {
        error:
          "AGENCY_API_SECRET ou CRM_WON_LEADS_URL manquant dans .env.local",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        {
          error: `CRM Target OS a répondu ${response.status}`,
          detail: body.slice(0, 500),
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const payload: unknown = await response.json();
    const leads = normalizeLeads(payload);

    return NextResponse.json({ leads });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue CRM";
    return NextResponse.json(
      { error: "Impossible de joindre Target OS", detail: message },
      { status: 502 }
    );
  }
}
