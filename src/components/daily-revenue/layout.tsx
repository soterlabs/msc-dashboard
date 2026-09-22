"use client";

import type { ReactNode } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function RevenueViews({ overview, history, sources }: { overview: ReactNode; history: ReactNode; sources: ReactNode }) {
  return <div className="space-y-6">
    <div className="space-y-6">{overview}</div>
    <Disclosure title="History" contentClassName="space-y-6 text-foreground">{history}</Disclosure>
    <Disclosure title="Data & sources" contentClassName="space-y-4 text-foreground">{sources}</Disclosure>
  </div>;
}

export function Disclosure({ title, children, contentClassName = "space-y-3 text-muted-foreground" }: { title: string; children: ReactNode; contentClassName?: string }) {
  return <Collapsible className="min-w-0 rounded-xl bg-muted/80 whitespace-normal">
    <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-expanded:rounded-b-none">
      {title}<CaretDownIcon aria-hidden className="size-4 shrink-0 transition-transform group-aria-expanded:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent><div className={`break-words px-4 pt-2 pb-4 text-sm leading-relaxed ${contentClassName}`}>{children}</div></CollapsibleContent>
  </Collapsible>;
}

export function EstimateDetails({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Sheet>
    <SheetTrigger render={<Button variant="secondary" size="sm" />}>View details</SheetTrigger>
    <SheetContent className="w-full! sm:max-w-lg! whitespace-normal text-left font-normal">
      <SheetHeader className="shrink-0 border-b pr-14">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </SheetHeader>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">{children}</div>
    </SheetContent>
  </Sheet>;
}
