import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function isNewFormatKey(key: string): boolean {
  return key.startsWith("sb_secret_") || key.startsWith("sb_publishable_");
}

/**
 * New Supabase keys (sb_secret_*) must not be sent as Authorization Bearer JWT.
 * @see https://supabase.com/docs/guides/getting-started/api-keys
 */
function createSupabaseFetch(apiKey: string): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers ?? {});
    headers.set("apikey", apiKey);

    if (isNewFormatKey(apiKey)) {
      headers.delete("authorization");
      headers.delete("Authorization");
    }

    return fetch(input, {
      ...init,
      headers,
    });
  };
}

export function createAdminClient(): SupabaseClient<Database> {
  const apiKey = getSupabaseServiceRoleKey();

  if (!apiKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is missing in .env.local."
    );
  }

  return createClient<Database>(getSupabaseUrl(), apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: createSupabaseFetch(apiKey),
      headers: {
        apikey: apiKey,
      },
    },
  });
}
