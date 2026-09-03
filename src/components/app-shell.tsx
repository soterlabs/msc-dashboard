"use client";

import * as React from "react";
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
import { FLAGS, type Flags } from "@/lib/flags";
import { DataProvider, type Datasets } from "./data-context";
import { DistributionRewards } from "./dr/distribution-rewards";
import { PrimePayments } from "./prime/prime-payments";
import { SkyTotalNetRevenue } from "./sky-total/sky-total-net-revenue";
import { SoterLabsMark } from "./soter-labs";
import { ThemeToggle } from "./theme-toggle";
import { SupplySideRevenues } from "./ssr/supply-side-revenues";

type Section = "dr" | "ssr" | "sky-total" | "prime";

const NAV: {
  key: Section;
  label: string;
  icon: Icon;
  source: string;
  /** Tabs without a flag are always shown; see src/lib/flags.ts. */
  flag?: keyof Flags;
}[] = [
  {
    key: "dr",
    label: "Distribution Rewards",
    icon: CoinsIcon,
    source: "dr_comparison_latest.xlsx",
  },
  {
    key: "ssr",
    label: "Supply Side Revenues",
    icon: TrendUpIcon,
    source: "soter · settlement-reports",
  },
  {
    key: "sky-total",
    label: "Sky Total Net Revenue",
    icon: BankIcon,
    source: "soter · settlement-reports · sky_total",
    flag: "skyTotalNetRevenue",
  },
  {
    key: "prime",
    label: "Prime Payments",
    icon: ScrollIcon,
    source: "prime/payments.csv",
    flag: "primePayments",
  },
];

/**
 * The tabs this build shows. Flags are build-time constants, so this is settled
 * once at module load rather than re-derived per render.
 */
const VISIBLE_NAV = NAV.filter((n) => !n.flag || FLAGS[n.flag]);

export function AppShell({ dr, ssr, skyTotal, prime }: Datasets) {
  const [section, setSection] = React.useState<Section>("dr");
  // The datasets are inert once loaded, so the context value only needs to be
  // stable across re-renders caused by switching sections.
  const datasets = React.useMemo(
    () => ({ dr, ssr, skyTotal, prime }),
    [dr, ssr, skyTotal, prime],
  );

  return (
    <DataProvider value={datasets}>
      <SidebarProvider>
        <AppSidebar section={section} onSelect={setSection} />
        <SidebarInset>
          <SiteHeader section={section} />
          {/* `section` only ever holds a visible tab: it starts at "dr", which
              carries no flag, and every setter comes from VISIBLE_NAV. */}
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6 lg:p-8">
            {section === "dr" && <DistributionRewards />}
            {section === "ssr" && <SupplySideRevenues />}
            {section === "sky-total" && <SkyTotalNetRevenue />}
            {section === "prime" && <PrimePayments />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}

/* ------------------------------------------------------------- sidebar */

function AppSidebar({
  section,
  onSelect,
}: {
  section: Section;
  onSelect: (s: Section) => void;
}) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
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
            {VISIBLE_NAV.map((n) => (
              <SidebarMenuItem key={n.key}>
                <SidebarMenuButton
                  isActive={section === n.key}
                  onClick={() => onSelect(n.key)}
                  tooltip={n.label}
                >
                  <n.icon weight={section === n.key ? "fill" : "regular"} />
                  <span>{n.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/* --------------------------------------------------------------- header */

function SiteHeader({ section }: { section: Section }) {
  const current = NAV.find((n) => n.key === section)!;
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
            <BreadcrumbItem className="hidden sm:block">Reports</BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{current.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 text-xs lg:flex">
            <span className="text-muted-foreground">Source</span>
            <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
              {current.source}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
