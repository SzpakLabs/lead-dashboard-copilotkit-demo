"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge } from "./lead-ui";
import { leadSourceOptions, type LeadLedgerRow } from "./lead-workspace";

type LeadSearchOverlayProps = {
  leads: LeadLedgerRow[];
};

export function LeadSearchOverlay({ leads }: LeadSearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return leads.slice(0, 8);
    }

    return leads
      .filter((lead) =>
        [
          lead.title,
          lead.contactName,
          lead.company,
          lead.source,
          getSourceLabel(lead.source),
          lead.status,
          lead.nextStep,
          lead.timeline,
          lead.projectType
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 8);
  }, [leads, normalizedQuery]);

  function openLead(leadId: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("leadId", leadId);
    setIsOpen(false);
    setQuery("");
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <>
      <button
        className="ops-search"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Search className="size-4" />
        <span>Search leads</span>
      </button>
      {isOpen ? (
        <div
          aria-labelledby="lead-search-title"
          aria-modal="true"
          className="ops-search-overlay"
          role="dialog"
        >
          <div className="ops-search-panel">
            <div className="ops-search-header">
              <div>
                <p className="ops-eyebrow">Global search</p>
                <h2 id="lead-search-title">Find a lead</h2>
              </div>
              <button
                aria-label="Close search"
                className="ops-preview-close"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              autoFocus
              className="ops-search-input"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder="Lead, contact, source, status, next step..."
              type="search"
              value={query}
            />
            <div className="ops-search-results">
              {results.map((lead) => (
                <button
                  className="ops-search-result"
                  key={lead.id}
                  onClick={() => openLead(lead.id)}
                  type="button"
                >
                  <span>
                    <strong>{lead.title}</strong>
                    <small>
                      {lead.contactName}
                      {lead.company ? `, ${lead.company}` : ""} ·{" "}
                      {getSourceLabel(lead.source)}
                    </small>
                  </span>
                  <StatusBadge status={lead.status} />
                </button>
              ))}
              {results.length === 0 ? (
                <p className="ops-search-empty">No leads found.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function getSourceLabel(source: LeadLedgerRow["source"]) {
  return (
    leadSourceOptions.find((option) => option.value === source)?.label ?? source
  );
}
