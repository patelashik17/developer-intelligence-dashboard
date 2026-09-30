import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getIssues, getRepo } from "../api/github";
import {
  EmptyState,
  ErrorState,
  fmtDate,
  fmtNum,
  Skeleton,
  Stat,
} from "../components/ui";

export default function RepoPage() {
  const { owner = "", repo = "" } = useParams();
  const navigate = useNavigate();
  const repoQ = useQuery({
    queryKey: ["repo", owner, repo],
    queryFn: ({ signal }) => getRepo(owner, repo, signal),
  });
  // Independent query: a failing issues request must not hide the repo details.
  const issuesQ = useQuery({
    queryKey: ["issues", owner, repo],
    queryFn: ({ signal }) => getIssues(owner, repo, signal),
  });
  const r = repoQ.data;

  return (
    <div>
      <button
        onClick={() =>
          window.history.state?.idx > 0 ? navigate(-1) : navigate("/")
        }
        className="text-sm text-indigo-700 underline focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        Back to results
      </button>

      <section aria-labelledby="repo-title" className="mt-4">
        {repoQ.isPending && (
          <div>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="mt-3 h-20" />
          </div>
        )}
        {repoQ.isError && (
          <ErrorState error={repoQ.error} onRetry={() => repoQ.refetch()} />
        )}
        {r && (
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <img
                src={r.owner.avatar_url}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h1 id="repo-title" className="text-xl font-semibold">
                  {r.full_name}
                </h1>
                <a
                  href={r.owner.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-700 underline"
                >
                  Owner: {r.owner.login}
                </a>
              </div>
            </div>
            <p className="mt-3 text-slate-800">
              {r.description ?? "No description provided."}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              <Stat label="Stars" value={fmtNum(r.stargazers_count)} />
              <Stat label="Forks" value={fmtNum(r.forks_count)} />
              <Stat
                label="Watchers"
                value={fmtNum(r.subscribers_count ?? r.watchers_count)}
              />
              <Stat label="Open issues" value={fmtNum(r.open_issues_count)} />
              <Stat label="Language" value={r.language ?? "n/a"} />
              <Stat label="Default branch" value={r.default_branch} />
              <Stat label="Created" value={fmtDate(r.created_at)} />
              <Stat label="Updated" value={fmtDate(r.updated_at)} />
            </dl>
            <a
              href={r.html_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-slate-700 underline"
            >
              View on GitHub<span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        )}
      </section>

      <section aria-labelledby="issues-title" className="mt-8">
        <h2 id="issues-title" className="mb-3 text-lg font-semibold">
          Recent issues
        </h2>
        {issuesQ.isPending && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )}
        {issuesQ.isError && (
          <ErrorState error={issuesQ.error} onRetry={() => issuesQ.refetch()} />
        )}
        {issuesQ.data?.length === 0 && (
          <EmptyState
            title="No issues yet"
            hint="This repository has no issues, or issues are disabled."
          />
        )}
        {issuesQ.data && issuesQ.data.length > 0 && (
          <ul className="space-y-2">
            {issuesQ.data.map((i) => (
              <li
                key={i.id}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${i.state === "open" ? "bg-emerald-100 text-emerald-900" : "bg-violet-100 text-violet-900"}`}
                  >
                    {i.state}
                  </span>
                  <a
                    href={i.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-700 hover:underline"
                  >
                    #{i.number} {i.title}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  by {i.user?.login ?? "unknown"}, opened{" "}
                  {fmtDate(i.created_at)}, updated {fmtDate(i.updated_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-8 text-sm">
        <Link to="/" className="text-indigo-700 underline">
          New search
        </Link>
      </p>
    </div>
  );
}
