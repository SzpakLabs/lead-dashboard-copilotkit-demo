"use client";

import { useAgentContext } from "@copilotkit/react-core/v2";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type AssistantContextValue =
  | string
  | number
  | boolean
  | null
  | AssistantContextValue[]
  | { [key: string]: AssistantContextValue };

export type AssistantPageContext = {
  [key: string]: AssistantContextValue;
};

type AssistantRouteContextProps = {
  activeSection: string;
  pageContext?: AssistantPageContext;
};

export function AssistantRouteContext({
  activeSection,
  pageContext = {}
}: AssistantRouteContextProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash.replace("#", ""));
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const value = useMemo(
    () => ({
      activeSection,
      route: {
        pathname,
        hash: hash || null,
        searchParams: toSearchParamRecord(searchParams)
      },
      page: pageContext
    }),
    [activeSection, hash, pageContext, pathname, searchParams]
  );

  useAgentContext({
    description:
      "Current LeadOps route, visible page state, filters, selected records, and active route hash.",
    value
  });

  return null;
}

function toSearchParamRecord(searchParams: URLSearchParams) {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    const current = params[key];

    if (!current) {
      params[key] = value;
      return;
    }

    params[key] = Array.isArray(current)
      ? [...current, value]
      : [current, value];
  });

  return params;
}
