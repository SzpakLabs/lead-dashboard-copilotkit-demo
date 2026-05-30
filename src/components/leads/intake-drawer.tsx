"use client";

import { Maximize2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IngestionForm } from "@/components/leads/ingestion-form";

export function IntakeDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const drawerId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [isOpen]);

  const drawer =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="ops-drawer-overlay is-open"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div
              aria-labelledby={titleId}
              aria-modal="true"
              className="ops-intake-drawer"
              id={drawerId}
              ref={sheetRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className="ops-drawer-header">
                <div>
                  <p className="ops-eyebrow">
                    <Plus className="size-4" />
                    Intake
                  </p>
                  <h2 id={titleId}>Create draft lead</h2>
                  <p>Paste a call note, chat, or transcript for review.</p>
                </div>
                <button
                  aria-label="Close intake drawer"
                  className="ops-icon-button"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-4" />
                </button>
              </div>

              <IngestionForm className="border-0 bg-transparent p-0" />

              <div className="ops-drawer-footer">
                <Link href="/intake" onClick={() => setIsOpen(false)}>
                  <Maximize2 className="size-4" />
                  Open focused intake
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        aria-controls={drawerId}
        aria-expanded={isOpen}
        className="ops-button ops-button-primary"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4" />
        <span>New intake</span>
      </button>
      {drawer}
    </>
  );
}
