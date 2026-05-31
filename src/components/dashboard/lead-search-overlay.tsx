"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge } from "./lead-ui";
import { type LeadLedgerRow } from "./lead-workspace";

type LeadSearchOverlayProps = {
  leads: LeadLedgerRow[];
  sourceLabels: Record<string, string>;
};

export function LeadSearchOverlay({
  leads,
  sourceLabels
}: LeadSearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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
          sourceLabels[lead.source],
          lead.status,
          lead.nextStep,
          lead.timeline,
          lead.projectType,
          ...(lead.customFieldValues ?? [])
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 8);
  }, [leads, normalizedQuery, sourceLabels]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  function openLead(leadId: string) {
    const targetPathname =
      pathname === "/" || pathname === "/calendar" ? pathname : "/";
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("leadId", leadId);
    setIsOpen(false);
    setQuery("");
    router.replace(`${targetPathname}?${nextParams.toString()}`, {
      scroll: false
    });
  }

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
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
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeSearch();
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) =>
                results.length === 0 ? 0 : (index + 1) % results.length
              );
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) =>
                results.length === 0
                  ? 0
                  : (index - 1 + results.length) % results.length
              );
              return;
            }

            if (event.key === "Enter" && results[activeIndex]) {
              event.preventDefault();
              openLead(results[activeIndex].id);
            }
          }}
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
                onClick={closeSearch}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              aria-activedescendant={
                results[activeIndex]
                  ? `lead-search-result-${results[activeIndex].id}`
                  : undefined
              }
              aria-controls="lead-search-results"
              aria-expanded="true"
              aria-label="Search leads"
              className="ops-search-input"
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Lead, contact, source, status, next step..."
              ref={inputRef}
              role="combobox"
              type="search"
              value={query}
            />
            <div
              className="ops-search-results"
              id="lead-search-results"
              role="listbox"
            >
              {results.map((lead, index) => (
                <button
                  aria-selected={index === activeIndex}
                  className="ops-search-result"
                  id={`lead-search-result-${lead.id}`}
                  key={lead.id}
                  onClick={() => openLead(lead.id)}
                  role="option"
                  type="button"
                >
                  <span>
                    <strong>{lead.title}</strong>
                    <small>
                      {lead.contactName}
                      {lead.company ? `, ${lead.company}` : ""} ·{" "}
                      {sourceLabels[lead.source] ?? lead.source}
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
