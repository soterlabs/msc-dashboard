import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE, passwordToken } from "@/lib/auth";
import { PasswordField } from "./password-field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  if (!process.env.SITE_PASSWORD) redirect("/");
  const params = await searchParams;
  const from =
    params.from && params.from.startsWith("/") && !params.from.startsWith("//")
      ? params.from
      : "/";

  async function login(formData: FormData) {
    "use server";
    const password = process.env.SITE_PASSWORD;
    const entered = String(formData.get("password") ?? "");
    const dest = String(formData.get("from") ?? "/");
    const safeDest = dest.startsWith("/") && !dest.startsWith("//") ? dest : "/";

    if (!password || entered !== password) {
      redirect(`/login?error=1&from=${encodeURIComponent(safeDest)}`);
    }

    const store = await cookies();
    store.set(AUTH_COOKIE, await passwordToken(password), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect(safeDest);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-serif text-xl leading-none font-semibold text-ink">
            Sky
          </span>
          <span className="h-4 w-px bg-line-strong" />
          <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-gold uppercase">
            Soter console
          </span>
        </div>

        <div className="rounded-md border border-line bg-card p-6">
          <h1 className="font-serif text-2xl font-semibold text-ink">Protected</h1>
          <p className="mt-2 font-mono text-[12px] leading-relaxed text-muted">
            Enter the access password to continue.
          </p>

          <form action={login} className="mt-5 space-y-3">
            <input type="hidden" name="from" value={from} />
            <PasswordField />
            {params.error ? (
              <p className="font-mono text-[11px] text-loss">
                Incorrect password. Try again.
              </p>
            ) : null}
            <button
              type="submit"
              className="h-10 w-full rounded-[6px] bg-ink-deep font-mono text-[12px] font-medium tracking-wide text-ondark uppercase transition-opacity hover:opacity-90"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
