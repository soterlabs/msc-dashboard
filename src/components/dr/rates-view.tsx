"use client";

import { useDr } from "@/components/data-context";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RATE_FAMILIES,
  currentRateWindow,
  previousRateWindow,
} from "@/lib/dr/domain";
import { dayLong, formatRatePercent } from "@/lib/format";

import { Hint, Prose, Swatch } from "../kit";

export function RatesView() {
  const dr = useDr();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-1.5 text-base font-medium">
        Rate families
        <Hint
          label={`Exchange-rate (XR) reward tiers, applied per token. Rates as they stood on ${dayLong(dr.ratesAsOf)}, the close of the reporting window.`}
        />
      </h2>

      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3">
        {RATE_FAMILIES.map((f) => {
          const current = currentRateWindow(dr, f.key);
          const previous = previousRateWindow(dr, f.key);
          return (
            <Card key={f.key} className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Swatch color={`var(${f.colorVar})`} />
                  {f.title}
                </CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">
                  {current ? formatRatePercent(current.apy, 2) : "—"}
                </CardTitle>
                <CardAction>
                  {/* Filled and borderless, the same badge as the token tags in
                      the ledger: one treatment for every badge in the console,
                      whether it sits in a card corner or in a table cell. */}
                  <Badge variant="secondary" className="font-mono">
                    {f.key}
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Annual exchange-rate reward
                </p>
                {/* Only when the rate moved inside the reporting window: the
                    months on screen are then a blend of the two, and a single
                    headline rate would not explain them. */}
                {previous && current ? (
                  <p className="text-sm text-muted-foreground">
                    Was {formatRatePercent(previous.apy, 2)} until{" "}
                    {dayLong(previous.end)}
                  </p>
                ) : null}
              </CardContent>

              <CardFooter className="border-t pt-6">
                <Prose>{f.blurb}</Prose>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
