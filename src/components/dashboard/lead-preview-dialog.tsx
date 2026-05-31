"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

type LeadPreviewDialogProps = {
  children: ReactNode;
  title: string;
};

export function LeadPreviewDialog({ children, title }: LeadPreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const closePreview = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("leadId");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    function handleClose() {
      closePreview();
    }

    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [closePreview]);

  return (
    <dialog aria-label={title} className="ops-preview-dialog" ref={dialogRef}>
      <div className="ops-preview-shell">
        <button
          aria-label="Close lead preview"
          className="ops-preview-close"
          onClick={closePreview}
          type="button"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
