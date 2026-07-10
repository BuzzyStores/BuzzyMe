"use client";

import { useState } from "react";
import { CheckCircle2, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { updateAdminCampaign } from "../lib/admin-data";

export function CampaignReviewActions({ campaignId }: { campaignId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function act(action: "approve" | "reject" | "activate" | "pause") {
    const result = await updateAdminCampaign(campaignId, action);
    setStatus(`${result.action ?? action} updated`);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-control px-3 text-sm font-semibold text-white"
          onClick={() => void act("approve")}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Approve
        </button>
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white"
          onClick={() => void act("activate")}
          type="button"
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          Activate
        </button>
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink"
          onClick={() => void act("pause")}
          type="button"
        >
          <PauseCircle className="h-4 w-4" aria-hidden />
          Pause
        </button>
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-alert"
          onClick={() => void act("reject")}
          type="button"
        >
          <XCircle className="h-4 w-4" aria-hidden />
          Reject
        </button>
      </div>
      {status ? <p className="text-xs font-medium text-slate-500">{status}</p> : null}
    </div>
  );
}
