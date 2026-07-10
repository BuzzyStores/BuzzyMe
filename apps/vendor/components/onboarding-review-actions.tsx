"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import { reviewAiOutput } from "../lib/activation";

export function OnboardingReviewActions() {
  const [status, setStatus] = useState<string | null>(null);

  async function review(action: "approve" | "request-changes") {
    const result = await reviewAiOutput(action);
    setStatus(result.status);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-work px-3 text-sm font-semibold text-white"
          onClick={() => void review("approve")}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Approve draft
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink"
          onClick={() => void review("request-changes")}
          type="button"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden />
          Request changes
        </button>
      </div>
      {status ? (
        <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
          {status}
        </p>
      ) : null}
    </div>
  );
}
