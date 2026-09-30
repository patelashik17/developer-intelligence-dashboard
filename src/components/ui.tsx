import type { ReactNode } from "react";
import { ApiError } from "../api/client";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
export const fmtNum = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-slate-200 ${className}`}
    />
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const err =
    error instanceof ApiError
      ? error
      : new ApiError("server", "Something went wrong.");
  let detail = err.message;
  if (err.kind === "rate_limit") {
    detail += err.retryAt
      ? ` Try again after ${new Date(err.retryAt).toLocaleTimeString()}.`
      : " Wait a minute and try again.";
  }
  const canRetry = onRetry && err.kind !== "validation";
  const title =
    err.kind === "network"
      ? "You appear to be offline"
      : err.kind === "rate_limit"
        ? "Rate limit reached"
        : "Request failed";
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm">{detail}</p>
      {canRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-1">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const btn =
    "rounded border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600";
  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between"
    >
      <button
        className={btn}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-slate-700" aria-current="page">
        Page {page} of {totalPages}
      </span>
      <button
        className={btn}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
