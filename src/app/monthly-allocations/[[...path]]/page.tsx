import { notFound, redirect } from "next/navigation";
import { parseMonthlyRoute } from "@/lib/monthly-allocations/model";
import { paths } from "@/lib/routes";

/** Preserve previously shared monthly URLs after moving the page under revenues. */
export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const route = parseMonthlyRoute((await params).path ?? []);
  if (!route) notFound();
  redirect(paths.monthlyAllocations(route.month, route.prime, route.venue));
}
