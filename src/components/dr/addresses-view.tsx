import * as React from "react";

import { ArrowUpRight } from "lucide-react";

import { l2Addresses, refCodeRows } from "@/lib/data";
import { formatUSD } from "@/lib/format";
import { explorer, explorerUrl } from "@/lib/links";
import { cn } from "@/lib/utils";

import { Card, NoteText, Pill, SectionTitle } from "./primitives";

const CHAIN_ORDER = ["base", "arbitrum", "optimism", "unichain"];

export function AddressesView() {
  const chains = Array.from(new Set(l2Addresses.map((a) => a.chain))).sort(
    (a, b) => CHAIN_ORDER.indexOf(a) - CHAIN_ORDER.indexOf(b)
  );
  const code10001 = refCodeRows.find((r) => r.refCode === "10001");

  return (
    <div className="space-y-8">
      <Card className="px-5 py-4">
        <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-gold uppercase">
          Why these addresses exist
        </p>
        <NoteText
          className="mt-2 max-w-3xl text-ink/80"
          note="Smart-contract-held L2 sUSDS (ALM, sUSDC vaults, PSM3, Morpho, etc.) has no on-chain referral event, so its balance is folded into synthetic ref code 10001 and split out from ref code 0. The addresses below are the filter set behind that code."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{l2Addresses.length} addresses</Pill>
          <Pill>{chains.length} chains</Pill>
          <Pill color="var(--group-other)">→ ref code 10001</Pill>
          {code10001 ? (
            <Pill>{formatUSD(code10001.total)} DR · window</Pill>
          ) : null}
        </div>
      </Card>

      {chains.map((chain) => {
        const rows = l2Addresses.filter((a) => a.chain === chain);
        return (
          <section key={chain}>
            <SectionTitle
              title={
                <span className="capitalize">
                  {chain}{" "}
                  <span className="font-mono text-xs font-normal text-muted">
                    {rows.length} contracts
                  </span>
                </span>
              }
            />
            <Card className="overflow-hidden">
              <div className="dr-scroll overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="bg-thead">
                      <Th className="w-[200px]">Label</Th>
                      <Th>Address</Th>
                      <Th className="text-right">Ref code</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr
                        key={a.address}
                        className="border-b border-line transition-colors hover:bg-paper/60"
                      >
                        <Td className="font-medium text-ink capitalize">
                          {a.label}
                        </Td>
                        <Td>
                          {explorerUrl(a.chain, a.address) ? (
                            <a
                              href={explorerUrl(a.chain, a.address)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`View on ${explorer(a.chain)?.name}`}
                              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink hover:underline"
                            >
                              {a.address}
                              <ArrowUpRight className="size-3 text-gold" />
                            </a>
                          ) : (
                            <span className="text-muted">{a.address}</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <span className="font-medium text-gold">
                            {a.refCode}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        );
      })}
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
    <td className={cn("px-3 py-2.5 font-mono text-[11px]", className)}>
      {children}
    </td>
  );
}
