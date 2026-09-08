"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ManualProjectSheet } from "@/components/admin/projects/manual-project-sheet";
import type { ClientPickerOption } from "@/lib/supabase/clients";
import type { ServiceId } from "@/types/database";

type ManualProjectLaunchContextValue = {
  openManualProjectSheet: (options?: {
    defaultServiceId?: ServiceId;
    defaultClientId?: string;
  }) => void;
};

const ManualProjectLaunchContext =
  createContext<ManualProjectLaunchContextValue | null>(null);

export function ManualProjectLaunchProvider({
  clients,
  children,
}: {
  clients: ClientPickerOption[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [defaultServiceId, setDefaultServiceId] = useState<
    ServiceId | undefined
  >();
  const [defaultClientId, setDefaultClientId] = useState<string | undefined>();

  const openManualProjectSheet = useCallback(
    (options?: {
      defaultServiceId?: ServiceId;
      defaultClientId?: string;
    }) => {
      setDefaultServiceId(options?.defaultServiceId);
      setDefaultClientId(options?.defaultClientId);
      setOpen(true);
    },
    []
  );

  const value = useMemo(
    () => ({ openManualProjectSheet }),
    [openManualProjectSheet]
  );

  return (
    <ManualProjectLaunchContext.Provider value={value}>
      {children}
      <ManualProjectSheet
        open={open}
        onOpenChange={setOpen}
        clients={clients}
        defaultServiceId={defaultServiceId}
        defaultClientId={defaultClientId}
      />
    </ManualProjectLaunchContext.Provider>
  );
}

export function useManualProjectLaunch() {
  const context = useContext(ManualProjectLaunchContext);
  if (!context) {
    throw new Error(
      "useManualProjectLaunch must be used within ManualProjectLaunchProvider"
    );
  }
  return context;
}
