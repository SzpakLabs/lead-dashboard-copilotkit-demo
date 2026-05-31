import { Bot, CalendarDays, LayoutDashboard, Settings2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { IntakeDrawer } from "@/components/leads/intake-drawer";
import type { SourceOption } from "@/lib/domain/sources/manage-sources";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

type AppShellSection = "console" | "calendar" | "settings" | "intake";

type AppShellProps = {
  actions?: ReactNode;
  activeSection: AppShellSection;
  assistantEnabled?: boolean;
  children: ReactNode;
  eyebrow: string;
  eyebrowIcon: ReactNode;
  intakeSourceOptions?: SourceOption[];
  showNewIntake?: boolean;
  title: string;
};

const navItems: Array<{
  href: string;
  icon: ReactNode;
  label: string;
  section: AppShellSection;
}> = [
  {
    href: "/",
    icon: <LayoutDashboard className="size-4" />,
    label: "Console",
    section: "console"
  },
  {
    href: "/calendar",
    icon: <CalendarDays className="size-4" />,
    label: "Calendar",
    section: "calendar"
  },
  {
    href: "/settings",
    icon: <Settings2 className="size-4" />,
    label: "Settings",
    section: "settings"
  }
];

export function AppShell({
  actions,
  activeSection,
  assistantEnabled = false,
  children,
  eyebrow,
  eyebrowIcon,
  intakeSourceOptions = [],
  showNewIntake = false,
  title
}: AppShellProps) {
  return (
    <div
      className="ops-console min-h-screen"
      data-density="compact"
      id="ops-app-shell"
    >
      <a className="ops-skip-link" href="#ops-main-content">
        Skip to lead workspace
      </a>
      {assistantEnabled ? <AssistantPanel /> : null}

      <header className="ops-command-bar">
        <div className="ops-command-identity">
          <div className="min-w-0">
            <p className="ops-eyebrow">
              {eyebrowIcon}
              {eyebrow}
            </p>
            <h1>{title}</h1>
          </div>
          {assistantEnabled ? (
            <span className="ops-assistant-state">
              <Bot className="size-4" />
              Assistant
            </span>
          ) : null}
        </div>

        <nav className="ops-primary-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              aria-current={item.section === activeSection ? "page" : undefined}
              className={cn(
                "ops-nav-link",
                item.section === activeSection ? "is-active" : ""
              )}
              href={item.href}
              key={item.section}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ops-actions" aria-label="Workspace actions">
          {actions}
          <ThemeToggle />
          {showNewIntake ? (
            <IntakeDrawer sourceOptions={intakeSourceOptions} />
          ) : null}
        </div>
      </header>

      <main id="ops-main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
