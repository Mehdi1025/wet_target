"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import type { ClientPickerOption } from "@/lib/supabase/clients";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type NewClientDraft = {
  name: string;
  email: string;
  company: string;
};

export const EMPTY_NEW_CLIENT: NewClientDraft = {
  name: "",
  email: "",
  company: "",
};

type ClientSelectorProps = {
  clients: ClientPickerOption[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
  newClient: NewClientDraft;
  onNewClientChange: (patch: Partial<NewClientDraft>) => void;
  isCreating: boolean;
  onIsCreatingChange: (creating: boolean) => void;
  disabled?: boolean;
  lockedClient?: ClientPickerOption;
};

export function ClientSelector({
  clients,
  selectedClientId,
  onSelectClient,
  newClient,
  onNewClientChange,
  isCreating,
  onIsCreatingChange,
  disabled = false,
  lockedClient,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);

  if (lockedClient) {
    return (
      <div className="rounded-lg border bg-background p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Client verrouillé (upsell)
        </p>
        <p className="mt-1 font-medium">{lockedClient.label}</p>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-client-name">Nom complet</Label>
          <Input
            id="new-client-name"
            placeholder="Jean Dupont"
            value={newClient.name}
            onChange={(event) =>
              onNewClientChange({ name: event.target.value })
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-client-email">Email</Label>
          <Input
            id="new-client-email"
            type="email"
            placeholder="client@entreprise.fr"
            value={newClient.email}
            onChange={(event) =>
              onNewClientChange({ email: event.target.value })
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-client-company">Nom de l&apos;entreprise</Label>
          <Input
            id="new-client-company"
            placeholder="Acme SAS"
            value={newClient.company}
            onChange={(event) =>
              onNewClientChange({ company: event.target.value })
            }
            disabled={disabled}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            onIsCreatingChange(false);
            onNewClientChange(EMPTY_NEW_CLIENT);
          }}
          disabled={disabled}
        >
          Choisir un client existant
        </Button>
      </div>
    );
  }

  const selectedClient = clients.find((client) => client.id === selectedClientId);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedClient ? selectedClient.label : "Rechercher un client…"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Nom, entreprise, email…" />
            <CommandList>
              <CommandEmpty>Aucun client trouvé.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.label}
                    onSelect={() => {
                      onSelectClient(
                        client.id === selectedClientId ? null : client.id
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedClientId === client.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="truncate">{client.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-start px-2 text-primary"
                onClick={() => {
                  onSelectClient(null);
                  onIsCreatingChange(true);
                  setOpen(false);
                }}
                disabled={disabled}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau client
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
