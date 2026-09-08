"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Grid3X3 } from "lucide-react";

import { fetchArsenalDrawers } from "@/lib/actions/arsenal";
import type { ArsenalDrawerWithLinks } from "@/lib/supabase/arsenal";
import { InternalHub } from "@/components/admin/arsenal/internal-hub";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ArsenalQuickAccess() {
  const [open, setOpen] = useState(false);
  const [drawers, setDrawers] = useState<ArsenalDrawerWithLinks[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      const data = await fetchArsenalDrawers();
      setDrawers(data);
    });
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          aria-label="Ouvrir l'Arsenal"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(100vw-2rem,420px)] p-0"
      >
        <div className="border-b px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Accès rapide
          </p>
          <p className="font-semibold">Arsenal</p>
        </div>
        <div className="max-h-[min(70vh,480px)] overflow-y-auto p-3">
          <InternalHub
            drawers={drawers}
            variant="compact"
            showHeader={false}
          />
        </div>
        <div className="border-t p-3">
          <Button variant="secondary" size="sm" className="w-full" asChild>
            <Link href="/admin/arsenal" onClick={() => setOpen(false)}>
              Gérer l&apos;Arsenal
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
