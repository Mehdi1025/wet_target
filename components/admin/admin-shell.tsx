"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  ListTodo,
  PanelLeft,
  Search,
  Settings,
  Sun,
  Users,
  Webhook,
} from "lucide-react";

import { logoutAction } from "@/app/admin/login/actions";
import {
  AGENCY_DASHBOARDS,
  getDashboardPath,
} from "@/lib/admin/dashboards";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AppSidebarProps = {
  username: string;
  collapsed?: boolean;
};

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      {label}
    </Link>
  );
}

export function AppSidebar({ username, collapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const initials = username.slice(0, 2).toUpperCase();
  const dashboardOpen =
    pathname.includes("/admin/dashboard") || pathname === "/admin";
  const isGlobalView = pathname === "/admin";

  if (collapsed) return null;

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 flex-col justify-center border-b border-sidebar-border px-4">
        <Link href="/admin" className="font-semibold tracking-tight">
          Target Agency
        </Link>
        <span className="text-xs text-muted-foreground">
          Next.js + shadcn/ui
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
            Général
          </p>
          <NavItem
            href="/admin/inbox"
            icon={Inbox}
            label="Inbox Production"
            active={pathname === "/admin/inbox"}
          />

          <Collapsible defaultOpen={dashboardOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent/60">
              <span className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 opacity-70" />
                Dashboard
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 transition-transform [[data-state=open]_&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-3">
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/60",
                  isGlobalView
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 shrink-0",
                    isGlobalView ? "opacity-100" : "opacity-40"
                  )}
                />
                <span className="truncate">Vue globale</span>
              </Link>
              {AGENCY_DASHBOARDS.map((dashboard) => {
                const href = getDashboardPath(dashboard.id);
                const active = pathname === href;
                return (
                  <Link
                    key={dashboard.id}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/60",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80"
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 shrink-0",
                        active ? "opacity-100" : "opacity-40"
                      )}
                    />
                    <span className="truncate">{dashboard.shortLabel}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <NavItem href="/admin" icon={ListTodo} label="Tâches" />
          <NavItem href="/admin" icon={Users} label="Utilisateurs" />
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
            Autre
          </p>
          <NavItem href="/admin" icon={Settings} label="Paramètres" />
          <NavItem href="/admin" icon={Webhook} label="Développeurs" />
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-sidebar-accent/60">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{username}</p>
              <p className="truncate text-xs text-muted-foreground">
                {username}@target-agency.fr
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Retour au site</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logoutAction} className="w-full">
                <button type="submit" className="w-full text-left">
                  Déconnexion
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar username={username} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="relative mx-auto hidden w-full max-w-md md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="h-9 bg-muted/50 pl-9"
            />
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              ⌘ K
            </kbd>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
            <Sun className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
