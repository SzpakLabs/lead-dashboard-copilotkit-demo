export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Demo Core</p>
        <h1 className="text-4xl font-semibold tracking-normal">Lead Dashboard</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Foundation scaffold is ready for workspace-scoped leads, contacts,
          follow-ups, ingestion events, and audit activity.
        </p>
      </section>
    </main>
  );
}
