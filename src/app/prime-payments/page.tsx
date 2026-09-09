import { notFound } from "next/navigation";

import { PrimeProvider } from "@/components/data-context";
import { PrimePayments } from "@/components/prime/prime-payments";
import { FLAGS } from "@/lib/flags";
import { loadPrime } from "@/lib/load";

/**
 * /prime-payments — one page, no drill-down. Its table is driven entirely by
 * filters, which stay out of the URL: they are how the ledger is being read,
 * not which page it is.
 *
 * Flagged off, this 404s without calling `loadPrime()`.
 */
export default function Page() {
  if (!FLAGS.primePayments) notFound();

  return (
    <PrimeProvider value={loadPrime()}>
      <PrimePayments />
    </PrimeProvider>
  );
}
