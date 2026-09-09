"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import {
  BankIcon,
  CoinsIcon,
  ScrollIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  SECTIONS,
  VISIBLE_SECTIONS,
  paths,
  sectionFromPath,
  type Section,
} from "@/lib/routes";
import { SoterLabsMark } from "./soter-labs";
import { ThemeToggle } from "./theme-toggle";

/** Icons live here, not in the route map: nothing on the server needs them. */
const ICONS: Record<Section, Icon> = {
  dr: CoinsIcon,
  ssr: TrendUpIcon,
  "sky-total": BankIcon,
  prime: ScrollIcon,
};

/**
 * The chrome around every route: sidebar, header, and the frame the section's
 * own page renders into.
 *
 * It holds no section state any more — the URL is the state, so this reads the
 * pathname and the nav is a list of links. That is what makes a view
 * shareable: /supply-side-revenues/grove/2026-08 opens on Grove's August
 * settlement instead of on whatever the last click left behind.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = sectionFromPath(pathname);

  return (
    <SidebarProvider>
      <AppSidebar section={current?.key} />
      <SidebarInset>
        <SiteHeader section={current?.key} />
        <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* ------------------------------------------------------------- sidebar */

function AppSidebar({ section }: { section?: Section }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* The wordmark is a label, not a control — rendered as a div so it
                keeps the menu button's layout without being a <button> a
                keyboard lands on. `pointer-events-none` hides it from the mouse
                but not from Tab, which is how it read before. */}
            <SidebarMenuButton
              render={<div />}
              size="lg"
              className="pointer-events-none gap-3 data-[state=open]:bg-transparent"
            >
              <SoterLabsMark className="size-7 shrink-0" />
              {/* The mark carries the brand's gold on its own; setting the
                  wordmark in it too made gold a third accent competing with the
                  primary, so the name sits in the sidebar's own foreground. */}
              <span className="font-brand text-base tracking-[0.13em] uppercase">
                Soter Labs
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarMenu>
            {VISIBLE_SECTIONS.map((s) => {
              const Icon = ICONS[s.key];
              const active = section === s.key;
              return (
                <SidebarMenuItem key={s.key}>
                  <SidebarMenuButton
                    isActive={active}
                    /* isActive only styles the item (data-active). This is the
                       one thing that tells a screen reader which report is
                       open — without it all four items announce identically. */
                    aria-current={active ? "page" : undefined}
                    tooltip={s.label}
                    /* A real <a>: middle-click, cmd-click and "copy link
                       address" all have to work on a nav whose whole point is
                       that its destinations are shareable. */
                    render={<Link href={`/${s.slug}`} />}
                  >
                    <Icon weight={active ? "fill" : "regular"} />
                    <span>{s.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/* --------------------------------------------------------------- header */

function SiteHeader({ section }: { section?: Section }) {
  const current = SECTIONS.find((s) => s.key === section);
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-2xl border-b bg-background/80 backdrop-blur-xl">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1.5" />
        <Separator
          orientation="vertical"
          className="mr-1 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:block">
              <Link href={paths.home}>Reports</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{current?.label ?? "Not found"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 text-xs lg:flex">
            <span className="text-muted-foreground">Source</span>
            <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
              {current?.source ?? "—"}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
