"use client";

import type { ServiceId } from "@/types/database";

import { useManualProjectLaunch } from "@/components/admin/projects/manual-project-launch-context";
import { Button } from "@/components/ui/button";

type ManualProjectFormProps = {
  defaultServiceId?: ServiceId;
  onSuccess?: () => void;
};

/** @deprecated Use the global Omni-Launch sheet via useManualProjectLaunch() */
export function ManualProjectForm({
  defaultServiceId,
  onSuccess,
}: ManualProjectFormProps) {
  const { openManualProjectSheet } = useManualProjectLaunch();

  return (
    <Button
      type="button"
      className="w-full"
      onClick={() => {
        openManualProjectSheet({ defaultServiceId });
        onSuccess?.();
      }}
    >
      Ouvrir Omni-Launch
    </Button>
  );
}
