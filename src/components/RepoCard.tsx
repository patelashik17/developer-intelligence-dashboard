import { Link } from "react-router-dom";
import type { Repo } from "../api/types";
import { fmtDate, fmtNum, Stat } from "./ui";

export default function RepoCard({
  repo,
  isFavorite,
  onToggleFavorite,
}: {
  repo: Repo;
  isFavorite: boolean;
  onToggleFavorite: (repo: Repo) => void;
}) {
  return (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <img
          src={repo?.owner?.avatar_url}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">
            <Link
              to={`/repo/${repo?.owner?.login}/${repo?.name}`}
              className="text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              {repo?.full_name}
            </Link>
          </h3>
          <p className="text-sm text-slate-700">
            {repo?.description ?? "No description provided."}
          </p>
        </div>
        <button
          type="button"
          aria-label={`${isFavorite ? "Remove" : "Save"} ${repo.full_name} ${isFavorite ? "from" : "to"} favorites`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(repo)}
          className={`shrink-0 rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600 ${isFavorite ? "bg-red-500 text-white hover:bg-red-600" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}
        >
          {isFavorite ? "Remove from Favorites" : "Save to Favorites"}
        </button>
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Stat label="Language" value={repo?.language ?? "n/a"} />
        <Stat label="Stars" value={fmtNum(repo?.stargazers_count)} />
        <Stat label="Forks" value={fmtNum(repo?.forks_count)} />
        <Stat label="Open issues" value={fmtNum(repo?.open_issues_count)} />
        <Stat label="Updated" value={fmtDate(repo?.updated_at)} />
      </dl>
      <a
        href={repo?.html_url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-slate-700 underline"
      >
        View on GitHub<span className="sr-only"> (opens in new tab)</span>
      </a>
    </article>
  );
}
