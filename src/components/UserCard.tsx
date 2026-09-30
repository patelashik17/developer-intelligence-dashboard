import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/github";
import type { UserSummary } from "../api/types";
import { fmtNum, Skeleton, Stat } from "./ui";

/** Search results omit follower/repo counts, so each card lazily fetches its own details (cached per login). */
export default function UserCard({ user }: { user: UserSummary }) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["user", user?.login],
    queryFn: ({ signal }) => getUser(user?.login, signal),
    staleTime: 30 * 60_000,
  });

  return (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar_url}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          className="h-12 w-12 rounded-full"
        />
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{user?.login}</h3>
          {data?.name && (
            <p className="truncate text-sm text-slate-700">{data.name}</p>
          )}
        </div>
      </div>
      {isPending && <Skeleton className="mt-3 h-4 w-3/4" />}
      {isError && (
        <p className="mt-3 text-sm text-slate-600">
          Details unavailable.{" "}
          <button
            onClick={() => refetch()}
            className="text-indigo-700 underline"
          >
            Retry
          </button>
        </p>
      )}
      {data && (
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Stat label="Followers" value={fmtNum(data?.followers)} />
          <Stat label="Following" value={fmtNum(data?.following)} />
          <Stat label="Repos" value={fmtNum(data?.public_repos)} />
          {data?.location && <Stat label="Location" value={data?.location} />}
        </dl>
      )}
      <a
        href={user?.html_url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-slate-700 underline"
      >
        View profile<span className="sr-only"> (opens in new tab)</span>
      </a>
    </article>
  );
}
