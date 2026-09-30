import { get } from "./client";
import type {
  Issue,
  Repo,
  SearchParams,
  SearchResponse,
  UserDetail,
  UserSummary,
} from "./types";

export const PER_PAGE = 12;
export const MAX_RESULTS = 1000; // GitHub search only exposes the first 1000 hits

export const buildRepoQuery = ({
  q,
  lang,
  stars,
}: Pick<SearchParams, "q" | "lang" | "stars">) =>
  [q.trim(), lang && `language:${lang}`, stars > 0 && `stars:>=${stars}`]
    .filter(Boolean)
    .join(" ");

export const searchRepos = (p: SearchParams, signal?: AbortSignal) =>
  get<SearchResponse<Repo>>(
    "/search/repositories",
    { q: buildRepoQuery(p), page: p.page, per_page: PER_PAGE },
    signal,
  );

export const searchUsers = (p: SearchParams, signal?: AbortSignal) =>
  get<SearchResponse<UserSummary>>(
    "/search/users",
    { q: p.q.trim(), page: p.page, per_page: PER_PAGE },
    signal,
  );

export const getUser = (login: string, signal?: AbortSignal) =>
  get<UserDetail>(`/users/${login}`, undefined, signal);

export const getRepo = (owner: string, repo: string, signal?: AbortSignal) =>
  get<Repo>(`/repos/${owner}/${repo}`, undefined, signal);

/** The issues endpoint also returns PRs; drop them. */
export const getIssues = async (
  owner: string,
  repo: string,
  signal?: AbortSignal,
): Promise<Issue[]> => {
  const items = await get<Issue[]>(
    `/repos/${owner}/${repo}/issues`,
    { state: "all", sort: "updated", direction: "desc", per_page: 30 },
    signal,
  );
  return items.filter((i) => !i.pull_request).slice(0, 15);
};
