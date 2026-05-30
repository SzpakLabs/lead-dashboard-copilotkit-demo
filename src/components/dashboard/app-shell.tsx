import { Bot, CalendarDays, LayoutDashboard, Settings2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { cn } from "@/lib/utils";

type AppShellSection = "console" | "calendar" | "fields" | "intake";

type AppShellProps = {
  actions?: ReactNode;
  activeSection: AppShellSection;
  assistantEnabled?: boolean;
  children: ReactNode;
  eyebrow: string;
  eyebrowIcon: ReactNode;
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
    href: "/settings/fields",
    icon: <Settings2 className="size-4" />,
    label: "Fields",
    section: "fields"
  }
];

export function AppShell({
  actions,
  activeSection,
  assistantEnabled = false,
  children,
  eyebrow,
  eyebrowIcon,
  title
}: AppShellProps) {
  return (
    <main className="ops-console min-h-screen" data-density="compact">
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

        <nav className="ops-primary-nav" aria-label="Primary navigation">
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

        {actions ? (
          <div className="ops-actions" aria-label="Workspace actions">
            {actions}
          </div>
        ) : null}
      </header>

      {children}
    </main>
  );
}
