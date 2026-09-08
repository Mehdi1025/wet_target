"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { updateClientNotes } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ClientNotesTabProps = {
  clientId: string;
  initialNotes: string | null;
};

export function ClientNotesTab({
  clientId,
  initialNotes,
}: ClientNotesTabProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateClientNotes(clientId, notes);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Notes enregistrées");
      router.refresh();
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Notes & Appels</CardTitle>
        <CardDescription>
          Résumés d&apos;appels, idées d&apos;upsell et contexte relationnel
          pour l&apos;équipe account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ex. Appel du 12/03 — intéressé par une campagne Meta Ads Q2. Relancer après livraison du site."
          className="min-h-[220px] resize-y"
          disabled={isPending}
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Enregistrement…" : "Enregistrer les notes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
