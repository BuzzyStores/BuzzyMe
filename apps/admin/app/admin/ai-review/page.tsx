import { Bot, ChevronDown } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { AiReviewActions } from "../../../components/ai-review-actions";
import { getAdminAiOutputs } from "../../../lib/admin-data";

export default async function AdminAiReviewPage() {
  const outputs = await getAdminAiOutputs();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-control">Admin</p>
          <h1 className="text-xl font-semibold text-ink">AI review</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
        {outputs.map((output) => (
          <Panel key={output.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Bot className="h-5 w-5 text-control" aria-hidden />
                  <h2 className="text-base font-semibold text-ink">{output.vendorName}</h2>
                  <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {output.outputType}
                  </span>
                  <span className="rounded-sm bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
                    {output.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{output.createdAt}</p>
              </div>
              <AiReviewActions outputId={output.id} />
            </div>

            <details className="mt-4 rounded-md border border-slate-200 bg-field p-3">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink">
                JSON preview
                <ChevronDown className="h-4 w-4" aria-hidden />
              </summary>
              <pre className="mt-3 overflow-auto rounded-md bg-white p-3 text-xs text-slate-700">
                {JSON.stringify(output.preview, null, 2)}
              </pre>
            </details>
          </Panel>
        ))}
      </main>
    </AppShell>
  );
}
