const faqCards = [
  {
    answer:
      "Open the console, create a draft lead from a pasted note or chat, review the extracted fields, then show how the same work appears in the lead view, follow-up flow, and calendar.",
    title: "What is the fastest demo story?"
  },
  {
    answer:
      "The core workflow, source labels, review states, follow-ups, calendar views, and database-backed lead data are real. The assistant is optional. External channel integrations, production auth, and billing are deferred.",
    title: "What is real today?"
  },
  {
    answer:
      "Every inbound request becomes reviewable work before it becomes trusted data. The operator stays in control of status changes, follow-up decisions, and any assistant-suggested mutation.",
    title: "Why does human review matter here?"
  },
  {
    answer:
      "It helps a small service business avoid losing context across chats, notes, and memory. The operator gets clearer prioritization by source, urgency, budget, next step, and due work.",
    title: "Why would a business care?"
  }
] as const;

export function SettingsHelpPanel({
  assistantEnabled
}: {
  assistantEnabled: boolean;
}) {
  return (
    <div className="settings-editor-stack">
      <div className="settings-callout settings-copy-block">
        <strong>Lead operations for small service teams</strong>
        <p>
          This demo shows how scattered inbound requests can become structured,
          reviewable lead work instead of getting lost across chats,
          spreadsheets, and memory. The value is operational clarity: faster
          review, cleaner follow-up ownership, and better visibility into the
          pipeline and calendar workload.
        </p>
        <p>
          The main story stays concrete. A manual, source-labeled intake creates
          a draft lead. The operator reviews the extracted details, confirms the
          next step, and manages follow-ups from the console, lead view, and
          calendar without pretending that the product already has every
          external integration.
        </p>
      </div>

      <div className="settings-faq-grid">
        {faqCards.map((card) => (
          <article className="settings-faq-card" key={card.title}>
            <strong>{card.title}</strong>
            <p>{card.answer}</p>
          </article>
        ))}
        <article className="settings-faq-card">
          <strong>Where does the assistant fit?</strong>
          <p>
            {assistantEnabled
              ? "Assistant entry points are available in this environment as an optional layer for reports, forecasts, and preview-first actions."
              : "The core demo does not depend on the assistant. In this environment it should be presented as optional and currently disabled rather than broken."}
          </p>
        </article>
        <article className="settings-faq-card">
          <strong>What is deferred?</strong>
          <p>
            Real Telegram, website widget, telephony, production auth, billing,
            and full multi-tenant admin are follow-on work. Source labels here
            support workflow context, not live proof of those integrations.
          </p>
        </article>
      </div>
    </div>
  );
}
