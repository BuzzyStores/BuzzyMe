import type { ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className = "" }: SurfaceProps) {
  return <main className={`min-h-screen bg-slate-50 text-slate-950 ${className}`}>{children}</main>;
}

export function Panel({ children, className = "" }: SurfaceProps) {
  return <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
