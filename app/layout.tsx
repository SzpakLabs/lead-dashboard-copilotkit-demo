import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Dashboard",
  description: "AI-assisted lead operations dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
