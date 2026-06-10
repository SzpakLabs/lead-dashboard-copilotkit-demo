import { AlertTriangle, DatabaseZap } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DatabaseUnavailablePage({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? error.message
      : "The demo database could not be reached.";

  return (
    <AppShell
      activeSection="console"
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      title="Lead operations"
    >
      <section className="ops-page-stack">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="size-4" />
              Database unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The dashboard cannot load because the production database is not
              reachable right now.
            </p>
            <p className="rounded-md border border-border bg-background/70 p-3 font-mono text-xs text-foreground">
              {message}
            </p>
            <p>
              Fix the Vercel `DATABASE_URL` and redeploy, or point the app at a
              live Postgres instance with the seeded demo data.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

export function EmptyDatabasePage({
  reason,
  title = "Lead operations",
  activeSection = "console"
}: {
  reason: string;
  title?: string;
  activeSection?: "console" | "calendar" | "settings" | "intake";
}) {
  return (
    <AppShell
      activeSection={activeSection}
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      title={title}
    >
      <section className="ops-page-stack">
        <Card className="border-border/80 bg-background/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseZap className="size-4 text-muted-foreground" />
              Empty database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The production database is connected, but it does not have the
              demo workspace or seed data yet.
            </p>
            <p className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-foreground">
              {reason}
            </p>
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                What this demo needs:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>A `software-services-demo` workspace</li>
                <li>
                  Seeded users, leads, contacts, follow-ups, and source data
                </li>
                <li>Applied migrations for the current schema</li>
              </ul>
            </div>
            <p>
              Once the database is seeded, this page will show the console
              normally.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
