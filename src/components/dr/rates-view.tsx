import { useDr } from "@/components/data-context";
import {
  RATE_FAMILIES,
  currentRateWindow,
  previousRateWindow,
} from "@/lib/dr/domain";
import { dayLong, formatRatePercent } from "@/lib/format";

import { Card, SectionTitle, Swatch } from "./primitives";

export function RatesView() {
  const dr = useDr();

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          title="Rate families"
          info={`Exchange-rate (XR) reward tiers, applied per token. Rates as they stood on ${dayLong(dr.ratesAsOf)}, the close of the reporting window.`}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {RATE_FAMILIES.map((f) => {
            const current = currentRateWindow(dr, f.key);
            const previous = previousRateWindow(dr, f.key);
            return (
              <Card key={f.key} className="flex flex-col px-5 py-4">
                <div className="flex items-center gap-2">
                  <Swatch color={`var(${f.colorVar})`} />
                  <span className="font-sans text-[12px] font-semibold tracking-[0.12em] text-ink uppercase">
                    {f.title}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted">
                    {f.key}
                  </span>
                </div>

                <p className="mt-3 font-mono text-[2rem] leading-none font-semibold text-ink tabular-nums">
                  {current ? formatRatePercent(current.apy, 2) : "—"}
                </p>
                <p className="mt-1.5 font-sans text-[11px] text-muted">
                  annual exchange-rate reward
                </p>

                {/* Only when the rate moved inside the reporting window: the
                    months on screen are then a blend of the two, and a single
                    headline rate would not explain them. */}
                {previous && current && (
                  <p className="mt-2 font-sans text-[11px] text-muted">
                    was {formatRatePercent(previous.apy, 2)} until{" "}
                    {dayLong(previous.end)}
                  </p>
                )}

                <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
                  {f.blurb}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
