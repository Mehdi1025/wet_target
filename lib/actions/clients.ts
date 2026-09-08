"use server";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClientMutationResult =
  | { success: true }
  | { success: false; error: string };

export async function updateClientNotes(
  clientId: string,
  notes: string
): Promise<ClientMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("clients")
      .update({ account_notes: notes.trim() || null })
      .eq("id", clientId);

    if (error) {
      return {
        success: false,
        error: error.message ?? "Impossible de sauvegarder les notes.",
      };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}
