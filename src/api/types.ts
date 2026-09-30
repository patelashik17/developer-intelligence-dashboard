export interface Owner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: Owner;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  subscribers_count?: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface UserSummary {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface UserDetail extends UserSummary {
  name: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  user: { login: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request?: unknown;
}

export interface SearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export type SearchType = "repos" | "users";
export interface SearchParams {
  type: SearchType;
  q: string;
  page: number;
  lang: string;
  stars: number;
}
