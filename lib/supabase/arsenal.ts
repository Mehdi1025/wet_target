import { createAdminClient } from "@/lib/supabase/admin";

export type ArsenalLinkRow = {
  id: string;
  drawer_id: string;
  name: string;
  description: string | null;
  url: string;
  icon_key: string;
  accent_class: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ArsenalDrawerRow = {
  id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ArsenalDrawerWithLinks = ArsenalDrawerRow & {
  links: ArsenalLinkRow[];
};

export async function getArsenalDrawers(): Promise<ArsenalDrawerWithLinks[]> {
  try {
    const supabase = createAdminClient();

    const { data: drawers, error: drawersError } = await supabase
      .from("arsenal_drawers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (drawersError) {
      console.error("[getArsenalDrawers] drawers", drawersError.message);
      return [];
    }

    if (!drawers || drawers.length === 0) {
      return [];
    }

    const drawerIds = drawers.map((drawer) => drawer.id);

    const { data: links, error: linksError } = await supabase
      .from("arsenal_links")
      .select("*")
      .in("drawer_id", drawerIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (linksError) {
      console.error("[getArsenalDrawers] links", linksError.message);
    }

    const linksByDrawer = new Map<string, ArsenalLinkRow[]>();
    for (const link of links ?? []) {
      const current = linksByDrawer.get(link.drawer_id) ?? [];
      current.push(link as ArsenalLinkRow);
      linksByDrawer.set(link.drawer_id, current);
    }

    return (drawers as ArsenalDrawerRow[]).map((drawer) => ({
      ...drawer,
      links: linksByDrawer.get(drawer.id) ?? [],
    }));
  } catch (error) {
    console.error("[getArsenalDrawers]", error);
    return [];
  }
}

export function flattenArsenalLinks(
  drawers: ArsenalDrawerWithLinks[]
): (ArsenalLinkRow & { drawerTitle: string })[] {
  return drawers.flatMap((drawer) =>
    drawer.links.map((link) => ({
      ...link,
      drawerTitle: drawer.title,
    }))
  );
}

export function getArsenalPreviewLinks(
  drawers: ArsenalDrawerWithLinks[],
  limit = 4
): (ArsenalLinkRow & { drawerTitle: string })[] {
  return flattenArsenalLinks(drawers).slice(0, limit);
}
