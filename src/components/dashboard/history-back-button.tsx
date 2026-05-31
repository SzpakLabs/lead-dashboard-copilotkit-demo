"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function HistoryBackButton() {
  const router = useRouter();

  function goBack() {
    const referrer = document.referrer;
    const hasSameOriginReferrer =
      referrer && new URL(referrer).origin === window.location.origin;

    if (hasSameOriginReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button className="ops-button" type="button" onClick={goBack}>
      <ArrowLeft className="size-4" />
      <span>Back</span>
    </button>
  );
}
