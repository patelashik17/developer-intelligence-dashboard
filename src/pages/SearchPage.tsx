import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MAX_RESULTS, PER_PAGE, searchRepos, searchUsers } from "../api/github";
import type {
  Repo,
  SearchParams,
  SearchResponse,
  UserSummary,
} from "../api/types";
import { useDebounced } from "../hooks/useDebounced";
import RepoCard from "../components/RepoCard";
import UserCard from "../components/UserCard";
import { EmptyState, ErrorState, Pagination, Skeleton } from "../components/ui";
import { useFavoriteRepos } from "../hooks/useFavoriteRepos";

const field =
  "rounded border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600";

export default function SearchPage() {
  const [view, setView] = useState<"search" | "favorites">("search");
  const { favorites, toggleFavorite } = useFavoriteRepos();
  const searchInput = useRef<HTMLInputElement>(null);

  // URL is the source of truth for everything except the raw text being typed.
  const [sp, setSp] = useSearchParams();
  const params: SearchParams = {
    type: sp.get("type") === "users" ? "users" : "repos",
    q: sp.get("q") ?? "",
    page: Math.max(1, Number(sp.get("page")) || 1),
    lang: sp.get("lang") ?? "",
    stars: Math.max(0, Number(sp.get("stars")) || 0),
  };

  const update = (patch: Record<string, string | null>, resetPage = true) =>
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) =>
          v ? next.set(k, v) : next.delete(k),
        );
        if (resetPage) next.delete("page");
        return next;
      },
      { replace: true },
    );

  // Debounce typing into the URL.
  const [text, setText] = useState(params.q);
  const debounced = useDebounced(text.trim());
  useEffect(() => {
    if (debounced !== params.q) update({ q: debounced || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !isTyping && view === "search") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [view]);

  const enabled = view === "search" && params.q.length > 0;
  const { data, isError, error, refetch, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ["search", params],
      queryFn: ({ signal }): Promise<SearchResponse<Repo | UserSummary>> =>
        params.type === "repos"
          ? searchRepos(params, signal)
          : searchUsers(params, signal),
      enabled,
    });

  const totalPages = data
    ? Math.ceil(Math.min(data.total_count, MAX_RESULTS) / PER_PAGE)
    : 0;
  const showList =
    enabled && data && data.items.length > 0 && !isError && !isFetching;

  return (
    <div>
      <div className="mb-7 border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
          Developer intelligence
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Explore GitHub
        </h1>
      </div>

      <nav aria-label="Repository views" className="mb-6 flex gap-1 border-b border-slate-200">
        <button
          type="button"
          aria-pressed={view === "search"}
          onClick={() => setView("search")}
          className={`border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 ${view === "search" ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-700 hover:text-slate-900"}`}
        >
          Search
        </button>
        <button
          type="button"
          aria-pressed={view === "favorites"}
          onClick={() => setView("favorites")}
          className={`border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 ${view === "favorites" ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-700 hover:text-slate-900"}`}
        >
          Saved repositories ({favorites.length})
        </button>
      </nav>

      {view === "search" && (
        <>
          <div
            role="group"
            aria-label="Search type"
            className="mb-4 inline-flex rounded border border-slate-300 bg-white p-1"
          >
            {([
              ["repos", "Repositories"],
              ["users", "Developers"],
            ] as const).map(([type, label]) => (
              <button
                key={type}
                type="button"
                aria-pressed={params.type === type}
                onClick={() =>
                  update({ type, lang: null, stars: null })
                }
                className={`rounded px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 ${params.type === type ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:flex-wrap"
          >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium">
            Search GitHub
          </label>
          <input
            id="q"
            ref={searchInput}
            type="search"
            className={field}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              params.type === "repos" ? "e.g. react query" : "e.g. torvalds"
            }
          />
          <span className="text-xs text-slate-600">
            Press <kbd className="rounded border border-slate-300 px-1 py-0.5 font-mono">/</kbd> to focus
          </span>
        </div>
        {params.type === "repos" && (
          <>
            <div className="flex flex-col gap-1 sm:w-36">
              <label htmlFor="lang" className="text-sm font-medium">
                Language
              </label>
              <input
                id="lang"
                className={field}
                defaultValue={params.lang}
                onBlur={(e) => update({ lang: e.target.value.trim() || null })}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                placeholder="React"
              />
            </div>
            <div className="flex flex-col gap-1 sm:w-28">
              <label htmlFor="stars" className="text-sm font-medium">
                Min stars
              </label>
              <input
                id="stars"
                type="number"
                min={0}
                className={field}
                defaultValue={params.stars || ""}
                onBlur={(e) => update({ stars: e.target.value || null })}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </div>
          </>
        )}
          </form>
        </>
      )}

      {view === "search" ? (
        <section aria-busy={isFetching} className="mt-6">
        <p aria-live="polite" className="mb-3 text-sm text-slate-700">
          {enabled &&
            data &&
            !isFetching &&
            `${data.total_count.toLocaleString()} results`}
        </p>

        {!enabled && (
          <EmptyState
            title="Start typing to search GitHub"
            hint="Switch between repositories and users above."
          />
        )}
        {enabled && isFetching && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        )}
        {enabled && isError && (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
        {enabled &&
          !isFetching &&
          !isError &&
          data &&
          data.items.length === 0 && (
            <EmptyState
              title={`No ${params.type === "repos" ? "repositories" : "users"} found`}
              hint="Try a different term or loosen the filters."
            />
          )}

        {showList && (
          <ul
            className={`grid gap-3 sm:grid-cols-2 ${isPlaceholderData ? "opacity-60" : ""}`}
          >
            {params.type === "repos"
              ? (data.items as Repo[]).map((r) => (
                  <li key={r.id}>
                    <RepoCard
                      repo={r}
                      isFavorite={favorites.some((favorite) => favorite.id === r.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </li>
                ))
              : (data.items as UserSummary[]).map((u) => (
                  <li key={u.id}>
                    <UserCard user={u} />
                  </li>
                ))}
          </ul>
        )}
        {enabled && !isFetching && !isError && (
          <Pagination
            page={params.page}
            totalPages={totalPages}
            onChange={(p) => {
              update({ page: String(p) }, false);
              window.scrollTo({ top: 0 });
            }}
          />
        )}
        </section>
      ) : (
        <section aria-labelledby="favorites-title" className="mt-6">
          <h1 id="favorites-title" className="mb-3 text-xl font-semibold">
            Saved repositories
          </h1>
          {favorites.length === 0 ? (
            <EmptyState
              title="No saved repositories"
              hint="Save a repository from search results to keep it here."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {favorites.map((repo) => (
                <li key={repo.id}>
                  <RepoCard
                    repo={repo}
                    isFavorite
                    onToggleFavorite={toggleFavorite}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
