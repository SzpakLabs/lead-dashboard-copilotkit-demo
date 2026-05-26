import type { Metadata } from "next";
import "./globals.css";
import { CopilotProvider } from "@/components/assistant/copilot-provider";
import { isAssistantRuntimeConfigured } from "@/lib/assistant/config";

export const metadata: Metadata = {
  title: "Lead Dashboard",
  description: "AI-assisted lead operations dashboard"
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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/copilotkit-react-core-v2.css" />
      </head>
      <body>{content}</body>
    </html>
  );
}
