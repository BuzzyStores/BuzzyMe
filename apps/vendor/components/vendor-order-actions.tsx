"use client";

import { useState } from "react";
import { CheckCircle2, PackageCheck, XCircle } from "lucide-react";
import { updateVendorOrder } from "../lib/orders";

export function VendorOrderActions({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function act(action: "accept" | "reject" | "ready" | "complete") {
    const result = await updateVendorOrder(orderId, action);
    setStatus(`${result.action} at ${new Date(result.updatedAt).toLocaleTimeString()}`);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-work px-3 text-sm font-semibold text-white"
          onClick={() => void act("accept")}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Accept
        </button>
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink"
          onClick={() => void act("ready")}
          type="button"
        >
          <PackageCheck className="h-4 w-4" aria-hidden />
          Ready
        </button>
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink"
          onClick={() => void act("complete")}
          type="button"
        >
          Complete
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
