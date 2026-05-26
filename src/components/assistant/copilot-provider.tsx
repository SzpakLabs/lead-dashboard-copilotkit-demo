"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint
      onError={({ code, error }) => {
        console.error("[copilotkit]", code, error.message);
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
