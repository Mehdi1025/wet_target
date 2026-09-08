"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FolderOpen, Globe, PenTool } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { updateProjectAssets } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ScopeAssetsBlockProps = {
  projectId: string;
  description: string | null;
  figmaUrl: string | null;
  driveUrl: string | null;
  stagingUrl: string | null;
};

type AssetField = {
  key: "figma_url" | "drive_url" | "staging_url";
  label: string;
  placeholder: string;
  icon: LucideIcon;
};

const ASSET_FIELDS: AssetField[] = [
  {
    key: "figma_url",
    label: "Figma",
    placeholder: "https://figma.com/file/…",
    icon: PenTool,
  },
  {
    key: "drive_url",
    label: "Google Drive",
    placeholder: "https://drive.google.com/…",
    icon: FolderOpen,
  },
  {
    key: "staging_url",
    label: "Staging / Preview",
    placeholder: "https://staging.example.com",
    icon: Globe,
  },
];

export function ScopeAssetsBlock({
  projectId,
  description,
  figmaUrl,
  driveUrl,
  stagingUrl,
}: ScopeAssetsBlockProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    figma_url: figmaUrl ?? "",
    drive_url: driveUrl ?? "",
    staging_url: stagingUrl ?? "",
  });

  function handleSave() {
    startTransition(async () => {
      const result = await updateProjectAssets(projectId, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Liens mis à jour");
      router.refresh();
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Scope & Assets</CardTitle>
        <CardDescription>Fichiers, liens et périmètre du projet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-2 text-sm font-medium">Description</p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {description?.trim() || "Aucune description renseignée."}
          </p>
        </div>

        <div className="space-y-4">
          {ASSET_FIELDS.map((field) => {
            const Icon = field.icon;
            const value = values[field.key];

            return (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {field.label}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={field.key}
                    value={value}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    disabled={isPending}
                  />
                  {value.trim() ? (
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={value.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ouvrir ${field.label}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Enregistrement…" : "Enregistrer les liens"}
        </Button>
      </CardContent>
    </Card>
  );
}
