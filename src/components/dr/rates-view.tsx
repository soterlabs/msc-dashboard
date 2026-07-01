import * as React from "react";

import { tokenRates } from "@/lib/data";
import {
  RATE_FAMILIES,
  rateFamilyMeta,
  tokenColor,
  tokensByFamily,
} from "@/lib/domain";
import { formatRatePercent } from "@/lib/format";
import { DOCS } from "@/lib/links";
import { cn } from "@/lib/utils";

import {
  Card,
  LeaderRow,
  NoteText,
  Pill,
  SectionTitle,
  Swatch,
} from "./primitives";

export function RatesView() {
  const byFamily = tokensByFamily();

  return (
    <div className="space-y-10">
      {/* rate-family cards */}
      <section>
        <SectionTitle
          title="Rate families"
          note="exchange-rate (XR) reward tiers applied per token"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {RATE_FAMILIES.map((f) => {
            const tokens = byFamily[f.key] ?? [];
            const sample = tokenRates.find((r) => r.rateType === f.key);
            const color = `var(${f.colorVar})`;
            return (
              <Card key={f.key} className="flex flex-col px-5 py-4">
                <div className="flex items-center gap-2">
                  <Swatch color={color} />
                  <span className="font-mono text-[12px] font-semibold tracking-[0.12em] text-ink uppercase">
                    {f.key}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted">
                    {f.title}
                  </span>
                </div>

                <p className="mt-3 font-mono text-[2rem] leading-none font-semibold text-ink tabular-nums">
                  {formatRatePercent(f.apy, 2)}
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-muted">
                  annual exchange-rate reward
                </p>

                <div className="mt-4 space-y-2 border-t border-line pt-3.5">
                  <LeaderRow
                    label="reward / period"
                    value={formatRatePercent(sample?.rewardPer ?? f.apy, 4)}
                  />
                  <LeaderRow label="tokens" value={tokens.length} />
                </div>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {tokens.map((t) => (
                    <Pill key={t} color={tokenColor(t)}>
                      {t}
                    </Pill>
                  ))}
                </div>

                <p className="mt-4 font-serif text-[12.5px] leading-relaxed text-muted italic">
                  {f.blurb}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* methodology note */}
      <Card className="px-5 py-4">
        <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-gold uppercase">
          How the rate is applied
        </p>
        <p className="mt-2 max-w-3xl font-serif text-[13.5px] leading-relaxed text-ink/80">
          Each token earns DR at its exchange-rate tier. The headline{" "}
          <span className="font-semibold not-italic">APY</span> is the annual
          figure; the{" "}
          <span className="font-semibold not-italic">reward / period</span> is
          the per-period multiplier actually used to attribute DR to a balance.
          Spark-wrapped collateral earns the reduced{" "}
          <span className="font-mono text-xs text-ink not-italic">XR*</span>{" "}
          tier, and staked USDS uses the lowest{" "}
          <span className="font-mono text-xs text-ink not-italic">
            XR-stUSDS
          </span>{" "}
          tier.
        </p>
        <p className="mt-3 max-w-3xl font-serif text-[13.5px] leading-relaxed text-ink/80">
          The tiers themselves are set by Sky governance — read where these XR
          rates come from in the{" "}
          <a
            href={DOCS.atlas.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold underline decoration-gold/40 underline-offset-2 not-italic hover:decoration-gold"
          >
            Sky Atlas
          </a>
          .
        </p>
      </Card>

      {/* full rate table */}
      <section>
        <SectionTitle
          title="Token rates"
          note={`${tokenRates.length} tokens · per-period multiplier in %`}
        />
        <Card className="overflow-hidden">
          <div className="dr-scroll overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="bg-thead">
                  <Th>Token</Th>
                  <Th>Rate family</Th>
                  <Th className="text-right">APY</Th>
                  <Th className="text-right">Reward / period</Th>
                  <Th className="min-w-[280px]">Notes</Th>
                </tr>
              </thead>
              <tbody>
                {tokenRates.map((r) => {
                  const fam = rateFamilyMeta(r.rateType);
                  return (
                    <tr
                      key={r.token}
                      className="border-b border-line transition-colors hover:bg-paper/60"
                    >
                      <Td>
                        <span className="inline-flex items-center gap-1.5">
                          <Swatch color={tokenColor(r.token)} />
                          <span className="font-medium text-ink">
                            {r.token}
                          </span>
                        </span>
                      </Td>
                      <Td>
                        <Pill color={`var(${fam.colorVar})`}>{r.rateType}</Pill>
                      </Td>
                      <Td className="text-right font-semibold text-ink">
                        {formatRatePercent(r.apy, 2)}
                      </Td>
                      <Td className="text-right text-muted">
                        {formatRatePercent(r.rewardPer, 4)}
                      </Td>
                      <Td className="whitespace-normal">
                        {r.notes ? (
                          <NoteText note={r.notes} className="text-muted" />
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 font-mono text-[10.5px] font-medium tracking-[0.1em] text-muted uppercase",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-2.5 font-mono text-xs", className)}>
      {children}
    </td>
  );
}
