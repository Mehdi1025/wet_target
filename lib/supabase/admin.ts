import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

const PGRST303_MAX_RETRIES = 3;
const PGRST303_BASE_DELAY_MS = 200;

function isNewFormatKey(key: string): boolean {
  return key.startsWith("sb_secret_") || key.startsWith("sb_publishable_");
}

function isPgrst303Response(response: Response, body: unknown): boolean {
  if (response.status !== 401) return false;

  if (body && typeof body === "object") {
    const record = body as { code?: string; message?: string };
    if (record.code === "PGRST303") return true;
    if (record.message?.includes("JWT issued at future")) return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries transient PGRST303 errors (gateway clock drift with sb_secret_ keys).
 * @see https://github.com/supabase/supabase/issues/49655
 */
async function fetchWithPgrst303Retry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= PGRST303_MAX_RETRIES; attempt++) {
    const response = await fetch(input, init);
    lastResponse = response;

    if (response.status !== 401 || attempt === PGRST303_MAX_RETRIES) {
      return response;
    }

    let body: unknown = null;
    try {
      body = await response.clone().json();
    } catch {
      return response;
    }

    if (!isPgrst303Response(response, body)) {
      return response;
    }

    await sleep(PGRST303_BASE_DELAY_MS * 2 ** attempt);
  }

  return lastResponse!;
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

    return fetchWithPgrst303Retry(input, {
      ...init,
      headers,
    });
  };
}

export function createAdminClient(): SupabaseClient<Database> {
  const apiKey = getSupabaseServiceRoleKey();

  if (!apiKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is missing in .env.local."
    );
  }

  const useCustomFetch = isNewFormatKey(apiKey);

  return createClient<Database>(getSupabaseUrl(), apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: useCustomFetch
      ? {
          fetch: createSupabaseFetch(apiKey),
          headers: {
            apikey: apiKey,
          },
        }
      : {
          // Legacy JWT service_role — sent as Bearer, no gateway minting.
          fetch: fetchWithPgrst303Retry,
        },
  });
}
