import type { ReactNode } from "react";
import { RevenueRouteView } from "@/components/ssr/route-view";
import { loadDr, loadSsr } from "@/lib/load";

export default function Layout({ children }: { children: ReactNode }) {
  return <RevenueRouteView ssr={loadSsr()} dr={loadDr()}>{children}</RevenueRouteView>;
}
