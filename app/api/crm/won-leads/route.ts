import { NextResponse } from "next/server";

import { verifyAdminSessionFromRequest } from "@/lib/admin/session";
import { fetchPendingWonLeads } from "@/lib/crm/fetch-won-leads";
import type { CrmWonLead } from "@/lib/crm/types";

export type { CrmWonLead };

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
    const { leads, available } = await fetchPendingWonLeads();

    if (!available) {
      return NextResponse.json(
        {
          error: "Impossible de joindre Target OS",
        },
        { status: 502 }
      );
    }

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
