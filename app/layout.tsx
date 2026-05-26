import type { Metadata } from "next";
import "./globals.css";
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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/copilotkit-react-core-v2.css" />
      </head>
      <body>{content}</body>
    </html>
  );
}
