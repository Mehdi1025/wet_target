"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink, Grid3X3, Sparkles } from "lucide-react";

import {
  getArsenalGlowClass,
  getArsenalIcon,
} from "@/lib/admin/arsenal-icons";
import type {
  ArsenalDrawerWithLinks,
  ArsenalLinkRow,
} from "@/lib/supabase/arsenal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LinkWithDrawer = ArsenalLinkRow & { drawerTitle: string };

type InternalHubProps = {
  drawers: ArsenalDrawerWithLinks[];
  previewLinks?: LinkWithDrawer[];
  variant?: "full" | "compact" | "preview";
  className?: string;
  showHeader?: boolean;
};

function ToolCard({
  link,
  drawerTitle,
  variant,
}: {
  link: ArsenalLinkRow;
  drawerTitle: string;
  variant: "full" | "compact" | "preview";
}) {
  const Icon = getArsenalIcon(link.icon_key);
  const glowClass = getArsenalGlowClass(link.accent_class);

  if (variant === "compact") {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group flex items-center gap-3 rounded-xl border bg-card/80 p-3 transition-all duration-200",
          "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md",
          glowClass
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm",
            link.accent_class
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{link.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {drawerTitle}
          </p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full"
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300",
          "hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg",
          glowClass
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40",
            link.accent_class,
            "bg-current"
          )}
        />

        <div className="relative flex h-full flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-sm",
                link.accent_class
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold tracking-tight">{link.name}</h3>
            </div>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {drawerTitle}
            </Badge>
            {link.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {link.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </a>
  );
}

function EmptyArsenal({ variant }: { variant: InternalHubProps["variant"] }) {
  if (variant === "compact") {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucun lien configuré.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-background shadow-sm">
        <Grid3X3 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">Votre Arsenal est vide</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Créez un tiroir et ajoutez vos premiers liens pour construire votre hub
        interne.
      </p>
      <Link
        href="/admin/arsenal"
        className="mt-4 text-sm font-medium text-primary hover:underline"
      >
        Configurer l&apos;Arsenal
      </Link>
    </div>
  );
}

export function InternalHub({
  drawers,
  previewLinks = [],
  variant = "full",
  className,
  showHeader = true,
}: InternalHubProps) {
  const hasContent = drawers.some((drawer) => drawer.links.length > 0);
  const totalLinks = drawers.reduce(
    (sum, drawer) => sum + drawer.links.length,
    0
  );

  return (
    <section className={cn("space-y-6", className)}>
      {showHeader ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Hub interne
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Arsenal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {drawers.length} tiroir{drawers.length > 1 ? "s" : ""} ·{" "}
              {totalLinks} lien{totalLinks > 1 ? "s" : ""}
            </p>
          </div>
          {variant === "preview" ? (
            <Link
              href="/admin/arsenal"
              className="text-sm font-medium text-primary hover:underline"
            >
              Gérer l&apos;Arsenal →
            </Link>
          ) : null}
        </div>
      ) : null}

      {!hasContent ? (
        <EmptyArsenal variant={variant} />
      ) : variant === "full" ? (
        <div className="space-y-10">
          {drawers.map((drawer) => {
            if (drawer.links.length === 0) return null;

            return (
              <div key={drawer.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {drawer.title}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {drawer.links.length} lien
                    {drawer.links.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {drawer.links.map((link) => (
                    <ToolCard
                      key={link.id}
                      link={link}
                      drawerTitle={drawer.title}
                      variant="full"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : variant === "compact" ? (
        <div className="grid grid-cols-1 gap-2">
          {drawers.flatMap((drawer) =>
            drawer.links.map((link) => (
              <ToolCard
                key={link.id}
                link={link}
                drawerTitle={drawer.title}
                variant="compact"
              />
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(previewLinks.length > 0
            ? previewLinks
            : drawers
                .flatMap((drawer) =>
                  drawer.links.map((link) => ({
                    ...link,
                    drawerTitle: drawer.title,
                  }))
                )
                .slice(0, 4)
          ).map((link) => (
            <ToolCard
              key={link.id}
              link={link}
              drawerTitle={link.drawerTitle}
              variant="preview"
            />
          ))}
        </div>
      )}
    </section>
  );
}
