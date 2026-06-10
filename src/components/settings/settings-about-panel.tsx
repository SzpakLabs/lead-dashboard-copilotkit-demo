const liveDemoUrl = "https://lead-dashboard-rosy.vercel.app/";
const repoUrl = "https://github.com/SzpakLabs/lead-dashboard-copilotkit-demo";

const changelogItems = [
  "Phase 4 turns /settings into a single workspace hub with browser-local demo preferences, sources, help, and about sections.",
  "The app now frames source labels and assistant behavior more honestly for portfolio reviewers.",
  "Release metadata and portfolio links are visible in-product instead of living only in repo docs."
] as const;

const metadataItems = [
  ["Live demo", liveDemoUrl],
  ["Repository", repoUrl],
  ["Release label", "v0.1.0 portfolio demo"],
  ["Release context", "June 10, 2026"],
  ["Developer", "Artem Litvinko"],
  ["Studio", "SzpakLabs"]
] as const;

export function SettingsAboutPanel() {
  return (
    <div className="settings-editor-stack">
      <div className="settings-callout settings-copy-block">
        <strong>Portfolio release metadata</strong>
        <p>
          This is a shareable lead-operations demo built to show product
          thinking, workflow design, and implementation quality without
          pretending to be a production SaaS admin surface.
        </p>
      </div>

      <div className="settings-metadata-grid">
        <article className="settings-faq-card">
          <strong>Overview</strong>
          <ul className="settings-detail-list">
            {metadataItems.map(([label, value]) => (
              <li key={label}>
                <span>{label}</span>
                {value.startsWith("https://") ? (
                  <a href={value} rel="noreferrer" target="_blank">
                    {value}
                  </a>
                ) : (
                  <strong>{value}</strong>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="settings-faq-card">
          <strong>Changelog summary</strong>
          <ul className="settings-bullet-list">
            {changelogItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="settings-faq-card">
          <strong>Developer contact</strong>
          <p>
            Public-safe portfolio metadata is included here. For tailored client
            conversations, keep direct LinkedIn or email outreach in your public
            profile and README rather than storing private contact paths in app
            settings.
          </p>
          <ul className="settings-bullet-list">
            <li>
              Use the public repo link above for code review and project
              context.
            </li>
            <li>
              Use the live demo URL for walkthroughs, screenshots, and outreach
              packaging.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
