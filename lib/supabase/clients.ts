import { createAdminClient } from "@/lib/supabase/admin";
import type { ClientRow } from "@/types/database";

export type ClientPickerOption = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  label: string;
};

function formatClientLabel(client: ClientRow): string {
  const company = client.company?.trim();
  const email = client.email?.trim();
  if (company && email) return `${client.name} · ${company} (${email})`;
  if (company) return `${client.name} · ${company}`;
  if (email) return `${client.name} (${email})`;
  return client.name;
}

export async function getClientById(id: string): Promise<ClientRow | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[getClientById]", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[getClientById]", error);
    return null;
  }
}

export async function getClientsForPicker(): Promise<ClientPickerOption[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, company")
      .order("name", { ascending: true });

    if (error) {
      console.error("[getClientsForPicker]", error.message);
      return [];
    }

    return (data ?? []).map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      label: formatClientLabel(client as ClientRow),
    }));
  } catch (error) {
    console.error("[getClientsForPicker]", error);
    return [];
  }
}
