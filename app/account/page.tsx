import Link from "next/link";

import { spurs } from "@/lib/auth";

export default async function AccountPage() {
  const user = await spurs.requireUser("/account");

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-8 px-4 py-10">
      <Link className="text-sm text-muted-foreground transition-colors hover:text-foreground" href="/">
        Back to Block Busters
      </Link>

      <section className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div>
          <p className="text-sm font-medium text-brand">Your account</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">
            {user.name || user.username || "Welcome"}
          </h1>
        </div>

        <dl className="divide-y divide-border text-sm">
          <div className="flex flex-wrap justify-between gap-2 py-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email || "Not provided"}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-4">
            <dt className="text-muted-foreground">Username</dt>
            <dd>{user.username ? `@${user.username}` : "Not provided"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
