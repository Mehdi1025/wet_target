"use client";

import { cn } from "@/lib/utils";
import {
  ARSENAL_ACCENT_OPTIONS,
  ARSENAL_ICON_OPTIONS,
} from "@/lib/admin/arsenal-icons";

type ArsenalIconPickerProps = {
  value: string;
  onChange: (iconKey: string) => void;
  disabled?: boolean;
};

export function ArsenalIconPicker({
  value,
  onChange,
  disabled = false,
}: ArsenalIconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
      {ARSENAL_ICON_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            title={option.label}
            disabled={disabled}
            onClick={() => onChange(option.key)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border transition-all",
              selected
                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

type ArsenalAccentPickerProps = {
  value: string;
  onChange: (accentClass: string) => void;
  disabled?: boolean;
};

export function ArsenalAccentPicker({
  value,
  onChange,
  disabled = false,
}: ArsenalAccentPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ARSENAL_ACCENT_OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            title={option.label}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all",
              selected
                ? "border-foreground scale-110 ring-2 ring-primary/40"
                : "border-transparent hover:scale-105"
            )}
          >
            <span
              className={cn(
                "block h-full w-full rounded-full bg-current opacity-80",
                option.value
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
