import { Info, Settings2, ShieldCheck, Tags } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SettingsSection = "workspace" | "sources" | "help" | "about";

const sectionLinks: Array<{
  href: string;
  icon: typeof Settings2;
  key: SettingsSection;
  label: string;
}> = [
  {
    href: "/settings?section=workspace",
    icon: Settings2,
    key: "workspace",
    label: "Workspace"
  },
  {
    href: "/settings?section=sources",
    icon: Tags,
    key: "sources",
    label: "Sources"
  },
  {
    href: "/settings?section=help",
    icon: Info,
    key: "help",
    label: "Help"
  },
  {
    href: "/settings?section=about",
    icon: ShieldCheck,
    key: "about",
    label: "About"
  }
];

export function SettingsSectionNav({
  activeSection
}: {
  activeSection: SettingsSection;
}) {
  return (
    <nav className="ops-settings-nav" aria-label="Settings sections">
      {sectionLinks.map((section) => {
        const Icon = section.icon;

        return (
          <Link
            aria-current={activeSection === section.key ? "page" : undefined}
            className={cn(activeSection === section.key ? "is-active" : "")}
            href={section.href}
            key={section.key}
          >
            <Icon className="size-4" />
            <span>{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
