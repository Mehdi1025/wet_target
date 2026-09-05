import type { Database } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { createClient } from "@supabase/supabase-js";

export type SupabaseHealth = {
  connected: boolean;
  contactCount: number | null;
  mode: "secret" | "publishable" | "none";
  hint?: string;
};

export async function getSupabaseHealth(): Promise<SupabaseHealth> {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (serviceRoleKey) {
    try {
      const admin = createAdminClient();
      const { count, error, status } = await admin
        .from("contact_submissions")
        .select("*", { count: "exact", head: true });

      if (!error && status !== 401) {
        return {
          connected: true,
          contactCount: count ?? 0,
          mode: "secret",
        };
      }
    } catch {
      // fall through to publishable check
    }
  }

  try {
    const pub = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );
    const { count, error } = await pub
      .from("contact_submissions")
      .select("*", { count: "exact", head: true });

    if (!error) {
      return {
        connected: true,
        contactCount: count ?? 0,
        mode: "publishable",
        hint: serviceRoleKey
          ? "La clé secrète Supabase n'a pas pu être utilisée. Vérifie SUPABASE_SECRET_KEY dans .env.local."
          : undefined,
      };
    }

    if (error.code === "PGRST205" || error.message.includes("does not exist")) {
      return {
        connected: false,
        contactCount: null,
        mode: "none",
        hint:
          "La table contact_submissions n'existe pas. Exécute supabase/migrations/20260905120000_initial_schema.sql dans le SQL Editor Supabase.",
      };
    }
  } catch {
    // fall through
  }

  return {
    connected: false,
    contactCount: null,
    mode: "none",
    hint:
      "Impossible de joindre Supabase. Vérifie NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local.",
  };
}
