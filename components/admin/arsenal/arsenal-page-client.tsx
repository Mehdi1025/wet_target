"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  FolderPlus,
  Layers,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  createArsenalDrawer,
  createArsenalLink,
  deleteArsenalDrawer,
  deleteArsenalLink,
  updateArsenalDrawer,
  updateArsenalLink,
} from "@/lib/actions/arsenal";
import { getArsenalIcon } from "@/lib/admin/arsenal-icons";
import type {
  ArsenalDrawerWithLinks,
  ArsenalLinkRow,
} from "@/lib/supabase/arsenal";
import {
  ArsenalAccentPicker,
  ArsenalIconPicker,
} from "@/components/admin/arsenal/arsenal-icon-picker";
import { InternalHub } from "@/components/admin/arsenal/internal-hub";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LinkFormState = {
  name: string;
  description: string;
  url: string;
  iconKey: string;
  accentClass: string;
};

const EMPTY_LINK_FORM: LinkFormState = {
  name: "",
  description: "",
  url: "",
  iconKey: "link",
  accentClass: "text-blue-400",
};

type ArsenalPageClientProps = {
  initialDrawers: ArsenalDrawerWithLinks[];
};

export function ArsenalPageClient({ initialDrawers }: ArsenalPageClientProps) {
  const router = useRouter();
  const [drawers, setDrawers] = useState(initialDrawers);
  const [newDrawerTitle, setNewDrawerTitle] = useState("");
  const [isCreatingDrawer, setIsCreatingDrawer] = useState(false);
  const [editingDrawerId, setEditingDrawerId] = useState<string | null>(null);
  const [editingDrawerTitle, setEditingDrawerTitle] = useState("");
  const [savingDrawerId, setSavingDrawerId] = useState<string | null>(null);
  const [deletingDrawerId, setDeletingDrawerId] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<ArsenalLinkRow | null>(null);
  const [linkForm, setLinkForm] = useState<LinkFormState>(EMPTY_LINK_FORM);
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  useEffect(() => {
    setDrawers(initialDrawers);
  }, [initialDrawers]);

  const totalLinks = drawers.reduce(
    (sum, drawer) => sum + drawer.links.length,
    0
  );

  function refresh() {
    router.refresh();
  }

  function openCreateLinkDialog(drawerId: string) {
    setActiveDrawerId(drawerId);
    setEditingLink(null);
    setLinkForm(EMPTY_LINK_FORM);
    setLinkDialogOpen(true);
  }

  function openEditLinkDialog(link: ArsenalLinkRow) {
    setActiveDrawerId(link.drawer_id);
    setEditingLink(link);
    setLinkForm({
      name: link.name,
      description: link.description ?? "",
      url: link.url,
      iconKey: link.icon_key,
      accentClass: link.accent_class,
    });
    setLinkDialogOpen(true);
  }

  async function handleCreateDrawer(event: React.FormEvent) {
    event.preventDefault();

    const title = newDrawerTitle.trim();
    if (!title) {
      toast.error("Indiquez un nom de tiroir.");
      return;
    }

    setIsCreatingDrawer(true);
    try {
      const result = await createArsenalDrawer(title);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Tiroir créé");
      setNewDrawerTitle("");
      refresh();
    } finally {
      setIsCreatingDrawer(false);
    }
  }

  async function handleSaveDrawerTitle(drawerId: string) {
    setSavingDrawerId(drawerId);
    try {
      const result = await updateArsenalDrawer(drawerId, editingDrawerTitle);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tiroir renommé");
      setEditingDrawerId(null);
      refresh();
    } finally {
      setSavingDrawerId(null);
    }
  }

  async function handleDeleteDrawer(drawerId: string) {
    if (!confirm("Supprimer ce tiroir et tous ses liens ?")) return;

    setDeletingDrawerId(drawerId);
    try {
      const result = await deleteArsenalDrawer(drawerId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tiroir supprimé");
      refresh();
    } finally {
      setDeletingDrawerId(null);
    }
  }

  async function handleSaveLink() {
    if (!activeDrawerId) return;

    setIsSavingLink(true);
    try {
      const result = editingLink
        ? await updateArsenalLink(editingLink.id, {
            name: linkForm.name,
            description: linkForm.description,
            url: linkForm.url,
            iconKey: linkForm.iconKey,
            accentClass: linkForm.accentClass,
          })
        : await createArsenalLink({
            drawerId: activeDrawerId,
            name: linkForm.name,
            description: linkForm.description,
            url: linkForm.url,
            iconKey: linkForm.iconKey,
            accentClass: linkForm.accentClass,
          });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(editingLink ? "Lien mis à jour" : "Lien ajouté");
      setLinkDialogOpen(false);
      refresh();
    } finally {
      setIsSavingLink(false);
    }
  }

  async function handleDeleteLink(linkId: string) {
    if (!confirm("Supprimer ce lien ?")) return;

    setDeletingLinkId(linkId);
    try {
      const result = await deleteArsenalLink(linkId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Lien supprimé");
      refresh();
    } finally {
      setDeletingLinkId(null);
    }
  }

  const activeDrawer = drawers.find((drawer) => drawer.id === activeDrawerId);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 text-zinc-50">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative space-y-4">
          <Badge
            variant="outline"
            className="border-zinc-700 bg-zinc-900/80 text-zinc-300"
          >
            Hub interne
          </Badge>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Arsenal
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Organisez vos outils en tiroirs personnalisés. Vercel, CRM,
              Stripe… tout au même endroit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Tiroirs
              </p>
              <p className="text-2xl font-bold tabular-nums">{drawers.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Liens
              </p>
              <p className="text-2xl font-bold tabular-nums">{totalLinks}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="h-10 bg-muted/50 p-1">
          <TabsTrigger value="manage" className="gap-2 px-4">
            <Layers className="h-4 w-4" />
            Gérer
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2 px-4">
            <FolderOpen className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-0 space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderPlus className="h-5 w-5 text-primary" />
                Nouveau tiroir
              </CardTitle>
              <CardDescription>
                Ex. Production, Finance, Marketing, CRM…
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleCreateDrawer}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  id="new-drawer-title"
                  name="drawerTitle"
                  autoComplete="off"
                  placeholder="Nom du tiroir"
                  value={newDrawerTitle}
                  onChange={(event) => setNewDrawerTitle(event.target.value)}
                  className="h-11 bg-background text-foreground"
                />
                <Button
                  type="submit"
                  disabled={isCreatingDrawer || !newDrawerTitle.trim()}
                  className="h-11 shrink-0 px-6"
                >
                  {isCreatingDrawer ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Créer le tiroir
                </Button>
              </form>
            </CardContent>
          </Card>

          {drawers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/50">
                  <FolderPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Commencez par un tiroir</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Saisissez un nom ci-dessus puis cliquez sur « Créer le
                  tiroir ».
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {drawers.map((drawer) => (
                <Card key={drawer.id} className="overflow-hidden shadow-sm">
                  <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {editingDrawerId === drawer.id ? (
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                          <Input
                            value={editingDrawerTitle}
                            onChange={(event) =>
                              setEditingDrawerTitle(event.target.value)
                            }
                            className="h-10 bg-background text-foreground"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveDrawerTitle(drawer.id)}
                              disabled={savingDrawerId === drawer.id}
                            >
                              {savingDrawerId === drawer.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Enregistrer"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingDrawerId(null)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <CardTitle className="text-xl">{drawer.title}</CardTitle>
                          <CardDescription>
                            {drawer.links.length} lien
                            {drawer.links.length > 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => openCreateLinkDialog(drawer.id)}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Ajouter un lien
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9"
                          onClick={() => {
                            setEditingDrawerId(drawer.id);
                            setEditingDrawerTitle(drawer.title);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteDrawer(drawer.id)}
                          disabled={deletingDrawerId === drawer.id}
                        >
                          {deletingDrawerId === drawer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {drawer.links.length === 0 ? (
                      <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Ce tiroir est vide — ajoutez votre premier lien.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {drawer.links.map((link) => {
                          const Icon = getArsenalIcon(link.icon_key);
                          return (
                            <div
                              key={link.id}
                              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                            >
                              <div
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm",
                                  link.accent_class
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                  {link.name}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                  {link.url}
                                </p>
                                {link.description ? (
                                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                    {link.description}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9"
                                  onClick={() => openEditLinkDialog(link)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteLink(link.id)}
                                  disabled={deletingLinkId === link.id}
                                >
                                  {deletingLinkId === link.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <InternalHub drawers={drawers} variant="full" showHeader={false} />
        </TabsContent>
      </Tabs>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Modifier le lien" : "Nouveau lien"}
            </DialogTitle>
            <DialogDescription>
              {activeDrawer
                ? `Tiroir : ${activeDrawer.title}`
                : "Ajoutez un outil à votre Arsenal."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="link-name">Nom</Label>
              <Input
                id="link-name"
                placeholder="Vercel, Stripe, Figma…"
                value={linkForm.name}
                onChange={(event) =>
                  setLinkForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://…"
                value={linkForm.url}
                onChange={(event) =>
                  setLinkForm((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-description">Description (optionnel)</Label>
              <Textarea
                id="link-description"
                placeholder="Courte description pour l'équipe"
                value={linkForm.description}
                onChange={(event) =>
                  setLinkForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-[80px] bg-background text-foreground"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Icône</Label>
              <ArsenalIconPicker
                value={linkForm.iconKey}
                onChange={(iconKey) =>
                  setLinkForm((current) => ({ ...current, iconKey }))
                }
                disabled={isSavingLink}
              />
            </div>

            <div className="space-y-3">
              <Label>Couleur d&apos;accent</Label>
              <ArsenalAccentPicker
                value={linkForm.accentClass}
                onChange={(accentClass) =>
                  setLinkForm((current) => ({ ...current, accentClass }))
                }
                disabled={isSavingLink}
              />
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Aperçu
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl border bg-background",
                    linkForm.accentClass
                  )}
                >
                  {(() => {
                    const PreviewIcon = getArsenalIcon(linkForm.iconKey);
                    return <PreviewIcon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <p className="font-medium">
                    {linkForm.name || "Nom du lien"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {linkForm.url || "https://…"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setLinkDialogOpen(false)}
              disabled={isSavingLink}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveLink} disabled={isSavingLink}>
              {isSavingLink ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingLink ? "Enregistrer" : "Ajouter le lien"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
