"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/admin/session";
import {
  getArsenalDrawers,
  type ArsenalDrawerWithLinks,
} from "@/lib/supabase/arsenal";
import { createAdminClient } from "@/lib/supabase/admin";

export type ArsenalMutationResult =
  | { success: true }
  | { success: false; error: string };

function revalidateArsenal() {
  revalidatePath("/admin");
  revalidatePath("/admin/arsenal");
}

async function requireAdmin(): Promise<ArsenalMutationResult | null> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }
  return null;
}

export async function fetchArsenalDrawers(): Promise<ArsenalDrawerWithLinks[]> {
  return getArsenalDrawers();
}

export async function createArsenalDrawer(
  title: string
): Promise<ArsenalMutationResult & { drawerId?: string }> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return { success: false, error: "Le titre du tiroir est requis." };
  }

  try {
    const supabase = createAdminClient();

    const { data: lastDrawer } = await supabase
      .from("arsenal_drawers")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastDrawer?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("arsenal_drawers")
      .insert({ title: trimmedTitle, sort_order: sortOrder })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Impossible de créer le tiroir.",
      };
    }

    revalidateArsenal();
    return { success: true, drawerId: data.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function updateArsenalDrawer(
  drawerId: string,
  title: string
): Promise<ArsenalMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return { success: false, error: "Le titre du tiroir est requis." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("arsenal_drawers")
      .update({ title: trimmedTitle })
      .eq("id", drawerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateArsenal();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function deleteArsenalDrawer(
  drawerId: string
): Promise<ArsenalMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("arsenal_drawers")
      .delete()
      .eq("id", drawerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateArsenal();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export type ArsenalLinkInput = {
  drawerId: string;
  name: string;
  description?: string;
  url: string;
  iconKey?: string;
  accentClass?: string;
};

export async function createArsenalLink(
  input: ArsenalLinkInput
): Promise<ArsenalMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const name = input.name.trim();
  const url = input.url.trim();

  if (!name) {
    return { success: false, error: "Le nom du lien est requis." };
  }
  if (!url) {
    return { success: false, error: "L'URL est requise." };
  }

  try {
    const supabase = createAdminClient();

    const { data: lastLink } = await supabase
      .from("arsenal_links")
      .select("sort_order")
      .eq("drawer_id", input.drawerId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastLink?.sort_order ?? -1) + 1;

    const { error } = await supabase.from("arsenal_links").insert({
      drawer_id: input.drawerId,
      name,
      description: input.description?.trim() || null,
      url,
      icon_key: input.iconKey ?? "link",
      accent_class: input.accentClass ?? "text-zinc-400",
      sort_order: sortOrder,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateArsenal();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function updateArsenalLink(
  linkId: string,
  input: Omit<ArsenalLinkInput, "drawerId">
): Promise<ArsenalMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const name = input.name.trim();
  const url = input.url.trim();

  if (!name) {
    return { success: false, error: "Le nom du lien est requis." };
  }
  if (!url) {
    return { success: false, error: "L'URL est requise." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("arsenal_links")
      .update({
        name,
        description: input.description?.trim() || null,
        url,
        icon_key: input.iconKey ?? "link",
        accent_class: input.accentClass ?? "text-zinc-400",
      })
      .eq("id", linkId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateArsenal();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function deleteArsenalLink(
  linkId: string
): Promise<ArsenalMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("arsenal_links")
      .delete()
      .eq("id", linkId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateArsenal();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}
