"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function AiReviewActions({ outputId }: { outputId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="inline-flex min-h-9 items-center gap-2 rounded-md bg-control px-3 text-sm font-semibold text-white"
        onClick={() => setStatus(`Approved ${outputId}`)}
        type="button"
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Approve
      </button>
      <button
        className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink"
        onClick={() => setStatus(`Rejected ${outputId}`)}
        type="button"
      >
        <XCircle className="h-4 w-4" aria-hidden />
        Reject
      </button>
      {status ? <span className="text-xs font-medium text-slate-500">{status}</span> : null}
    </div>
  );
}
