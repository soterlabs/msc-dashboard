import { AppShell } from "@/components/app-shell";
import { loadDr, loadPrime, loadSkyTotal, loadSsr } from "@/lib/load";

/**
 * Server component: reads the datasets from data/generated/ and hands them to
 * the client shell. The read happens at build time (this page is statically
 * prerendered), so the numbers are fixed at deploy — the same behaviour as when
 * the data was compiled into the bundle as .ts modules.
 */
export default function Home() {
  return (
    <AppShell
      dr={loadDr()}
      ssr={loadSsr()}
      skyTotal={loadSkyTotal()}
      prime={loadPrime()}
    />
  );
}
