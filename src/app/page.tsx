import { redirect } from "next/navigation";

import { paths } from "@/lib/routes";

/**
 * The console has no landing page of its own — the first report is the landing
 * page. Redirecting rather than rendering it here keeps one canonical URL per
 * view, which is the point of the routes: a link someone shares and a link
 * someone copies out of the address bar are the same string.
 */
export default function Home() {
  redirect(paths.home);
}
