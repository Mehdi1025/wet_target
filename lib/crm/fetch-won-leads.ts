import type { CrmWonLead } from "@/lib/crm/types";
import { getImportedCrmLeadIds } from "@/lib/supabase/projects";

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

export async function fetchPendingWonLeads(): Promise<{
  leads: CrmWonLead[];
  available: boolean;
}> {
  const secret = process.env.AGENCY_API_SECRET;
  const url = process.env.CRM_WON_LEADS_URL;

  if (!secret || !url) {
    return { leads: [], available: false };
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
      console.error("[fetchPendingWonLeads]", response.status);
      return { leads: [], available: false };
    }

    const payload: unknown = await response.json();
    const leads = normalizeLeads(payload);
    const importedIds = await getImportedCrmLeadIds();
    const pendingLeads = leads.filter((lead) => !importedIds.has(lead.id));

    return { leads: pendingLeads, available: true };
  } catch (error) {
    console.error("[fetchPendingWonLeads]", error);
    return { leads: [], available: false };
  }
}

export async function getPendingInboxLeadCount(): Promise<number | null> {
  const { leads, available } = await fetchPendingWonLeads();
  if (!available) return null;
  return leads.length;
}
