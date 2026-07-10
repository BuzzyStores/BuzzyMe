"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitOrderReview } from "../lib/orders";

export function OrderReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submitReview() {
    const result = await submitOrderReview(orderId, {
      rating,
      ...(comment ? { comment } : {})
    });
    setStatus(`Review submitted: ${result.rating}/5`);
  }

  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-field p-3">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" aria-hidden />
        <p className="text-sm font-semibold text-ink">Review this order</p>
      </div>
      <select
        className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        onChange={(event) => setRating(Number(event.target.value))}
        value={rating}
      >
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {value} stars
          </option>
        ))}
      </select>
      <textarea
        className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
        onChange={(event) => setComment(event.target.value)}
        placeholder="Comment"
        value={comment}
      />
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-market px-3 text-sm font-semibold text-white"
        onClick={() => void submitReview()}
        type="button"
      >
        Submit review
      </button>
      {status ? <p className="text-sm font-medium text-slate-600">{status}</p> : null}
    </div>
  );
}
