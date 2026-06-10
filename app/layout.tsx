import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { CopilotProvider } from "@/components/assistant/copilot-provider";
import { isAssistantRuntimeConfigured } from "@/lib/assistant/config";

export const metadata: Metadata = {
  title: "LeadOps Demo | AI-assisted lead dashboard",
  description:
    "Demo lead operations dashboard for turning unstructured sales conversations into structured follow-up-ready leads.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = isAssistantRuntimeConfigured() ? (
    <CopilotProvider>{children}</CopilotProvider>
  ) : (
    children
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <Script id="leadops-theme-init" strategy="beforeInteractive">{`{
  try {
    const key = "leadops-color-scheme";
    const storedTheme = localStorage.getItem(key);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
    document.documentElement.classList.toggle("dark", theme ? theme === "dark" : systemDark);
    if (theme) {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
    }
  } catch {}
}`}</Script>
        <link rel="stylesheet" href="/copilotkit-react-core-v2.css" />
      </head>
      <body>
        {content}
        <Analytics />
      </body>
    </html>
  );
}
