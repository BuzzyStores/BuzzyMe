"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { CampaignType } from "@buzzystores/types";
import { generateVendorCampaign } from "../lib/campaigns";

export function CampaignGenerator() {
  const [campaignType, setCampaignType] = useState<CampaignType>(CampaignType.WEEKEND_OFFER);
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function generate() {
    const result = await generateVendorCampaign({
      campaignType,
      language: "en",
      ...(instruction ? { instruction } : {})
    });
    setStatus(`Generated ${result.campaign?.title ?? "campaign draft"}`);
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Campaign type
        <select
          className="min-h-11 rounded-md border border-slate-300 bg-white px-3"
          onChange={(event) => setCampaignType(event.target.value as CampaignType)}
          value={campaignType}
        >
          {Object.values(CampaignType).map((value) => (
            <option key={value} value={value}>
              {value.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>
      <textarea
        className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
        onChange={(event) => setInstruction(event.target.value)}
        placeholder="Optional instruction"
        value={instruction}
      />
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-work px-4 text-sm font-semibold text-white"
        onClick={() => void generate()}
        type="button"
      >
        <Wand2 className="h-4 w-4" aria-hidden />
        Generate AI draft
      </button>
      {status ? <p className="rounded-md border border-slate-200 bg-field px-3 py-2 text-sm text-slate-700">{status}</p> : null}
    </div>
  );
}
