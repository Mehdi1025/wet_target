import type { Database } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { createClient } from "@supabase/supabase-js";

export type ContactRow = Database["public"]["Tables"]["contact_submissions"]["Row"];

async function getClient() {
  try {
    return createAdminClient();
  } catch {
    return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}

export async function getRecentContacts(limit = 8): Promise<ContactRow[]> {
  try {
    const client = await getClient();
    const { data, error } = await client
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getContactCount(): Promise<number | null> {
  try {
    const client = await getClient();
    const { count, error } = await client
      .from("contact_submissions")
      .select("*", { count: "exact", head: true });

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export type ContactStats = {
  total: number;
  new: number;
  replied: number;
  conversionRate: number | null;
};

export async function getContactStats(): Promise<ContactStats> {
  try {
    const client = await getClient();
    const { data, error } = await client
      .from("contact_submissions")
      .select("status");

    if (error || !data) {
      return { total: 0, new: 0, replied: 0, conversionRate: null };
    }

    const total = data.length;
    const newCount = data.filter((r) => r.status === "new").length;
    const replied = data.filter(
      (r) => r.status === "replied" || r.status === "archived"
    ).length;
    const conversionRate =
      total > 0 ? Math.round((replied / total) * 1000) / 10 : null;

    return { total, new: newCount, replied, conversionRate };
  } catch {
    return { total: 0, new: 0, replied: 0, conversionRate: null };
  }
}
