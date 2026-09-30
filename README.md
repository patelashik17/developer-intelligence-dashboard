# Developer Intelligence Dashboard

Search GitHub repositories and users, then drill into repository details and recent issues.

**Stack:** Vite, React 18, TypeScript (strict), Tailwind CSS v4, axios, TanStack Query, React Router.

## Setup and run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No API key or additional configuration is needed. Run `npm run build` to type-check and create a production build; `npm run preview` serves that build locally.

## Architecture

- `src/api/client.ts` is the only module that uses axios. It forwards abort signals and normalizes failures into a typed `ApiError` (`network | rate_limit | not_found | validation | server`).
- `src/api/github.ts` owns typed GitHub endpoint functions; `src/api/types.ts` defines response models.
- `src/pages/SearchPage.tsx` reads search type, query, page, and repository filters from the URL. `src/pages/RepoPage.tsx` loads repository details and issues independently so an issues failure does not hide repository details.
- `src/components/` contains result cards, shared loading/empty/error/pagination UI, and the app-level error boundary. `src/hooks/useDebounced.ts` debounces search input; `src/hooks/useFavoriteRepos.ts` persists saved repositories in browser storage.
- TanStack Query owns remote data and its cache. Components own transient UI state, such as the uncommitted search text.

## Key decisions

### 1. Server state with TanStack Query

**Decision:** Use TanStack Query for API-backed state, with query keys based on request parameters, cancellation via `AbortSignal`, and a five-minute default stale time.

**Alternatives considered:** Keep results in component state or introduce a global state store.

**Why I chose this:** It provides caching, request deduplication, cancellation, and protection from stale responses without building a custom server-state layer.

**Trade-off:** It adds a dependency and cached data can be briefly old until it becomes stale or is explicitly refetched.

### 2. Search state in the URL

**Decision:** Persist search type, query, page, language, and minimum stars in URL search parameters; keep only the text currently being typed locally until its debounce completes.

**Alternatives considered:** Keep all search state only in component state or use a separate global store.

**Why I chose this:** Search links can be bookmarked, refreshed, and navigated with browser history, while the URL remains the single source of truth for submitted criteria.

**Trade-off:** URL parsing and updates need to handle missing or invalid parameter values, and the input can briefly differ from the committed URL query during debounce.

### 3. Debounced search and loading behavior

**Decision:** Wait 400 ms after typing before updating the search query. Show loading UI during active requests and do not display previous results as though they match a newly selected search mode or query.

**Alternatives considered:** Request on every keystroke or keep previous results visible during every query change.

**Why I chose this:** Debouncing reduces unnecessary calls against GitHub's unauthenticated rate limits. Hiding stale results avoids confusing repository cards with user results when search mode changes.

**Trade-off:** Results are not instantaneous while typing, and the UI temporarily replaces results with a loader during a fetch.

### 4. Typed API errors and retry policy

**Decision:** Normalize API errors into `ApiError` categories. Retry only network and server failures, up to two retries; show rate-limit, validation, and other errors in the affected view with retry where appropriate.

**Alternatives considered:** Expose raw axios errors to components or retry every failure uniformly.

**Why I chose this:** A consistent error model lets the UI explain common failures and avoids repeatedly sending requests that are unlikely to succeed, especially rate-limited requests.

**Trade-off:** Error normalization can expose only details deliberately mapped by the client, rather than every detail in GitHub's response.

### 5. Progressive user details

**Decision:** Render the user search result immediately, then load follower, following, repository count, and location from `/users/{login}` in each card. Cache those details for 30 minutes per login.

**Alternatives considered:** Omit profile details or fetch full details before rendering the result list.

**Why I chose this:** GitHub's user search response does not include all requested profile fields; loading details per card keeps the result list responsive and isolates an individual profile request failure.

**Trade-off:** This creates additional requests (up to one per displayed user), which can reach unauthenticated rate limits sooner. Individual detail fields may load after the search results.

### 6. Numbered pagination

**Decision:** Use 12 results per page and numbered previous/next navigation, capped at GitHub's first 1,000 search results.

**Alternatives considered:** Infinite scroll or loading all results at once.

**Why I chose this:** Numbered pagination limits each response and gives users a clear position and repeatable URL state without accumulating a large list in the browser.

**Trade-off:** Users need to navigate between pages, and GitHub search does not make results beyond its 1,000-result limit available.

### 7. Independent repository and issue queries

**Decision:** Fetch repository details and recent issues as separate queries on the repository page.

**Alternatives considered:** Treat the page as one combined request flow or hide the entire page if either request fails.

**Why I chose this:** A failure loading issues should not prevent users from seeing repository metadata, and each area can show its own loading, empty, and retry state.

**Trade-off:** The page has multiple loading/error states to present, and the two requests may finish at different times.

### 8. Browser-local repository favorites

**Decision:** Save repository snapshots in `localStorage` and show them in a dedicated saved-repositories view.

**Alternatives considered:** Keep favorites only in memory, or add a backend/account-based sync mechanism.

**Why I chose this:** It makes favorites useful across reloads without requiring authentication, a backend, or additional GitHub requests.

**Trade-off:** Favorites are limited to the current browser and device, and saved repository details can become outdated until the user searches for that repository again.

## Assumptions

- The application uses GitHub's public REST API without authentication. Users accept its lower unauthenticated rate limits; no private repositories or authenticated actions are in scope.
- Search returns public GitHub users and repositories. Repository issues exclude pull requests and show up to 15 of the most recently updated issues.
- Repository search filters are language and minimum stars. Search results are limited to the first 1,000 matches by GitHub.
- A current browser with JavaScript enabled and network access to `api.github.com` is available.

## Testing approach

- `npm run build` runs the TypeScript check followed by the Vite production build. This was run successfully for the current implementation.
- There is no automated unit or browser-test suite yet. Manual smoke testing should cover both search modes, query changes and pagination, repository detail navigation, empty results, rate-limit/network failures with retry, and narrow viewport layout.

## Known limitations

- Unauthenticated rate limits apply; user results cost one additional request per displayed card.
- The issues list shows up to 15 recently updated issues, filters out pull requests, and has no pagination.
- Favorites are stored only in this browser's `localStorage`; they are not synced across devices and represent the data as it was when saved.
- There is no automated test suite or authentication. API response caching is in memory and does not persist across page reloads.

## AI usage disclosure

GitHub Copilot was used to inspect the existing implementation, suggest and make focused reliability changes, and help verify them with the production build. The engineering choices in this work were to show a loading state rather than stale results when searches change, recognize rate-limit responses from GitHub's status, headers, or message, and contain unexpected render errors in an app-level error boundary. I reviewed and adjusted the generated changes, including removing an unused query flag found by TypeScript during the build. No material AI suggestion was rejected during this focused work; broader additions were left out to keep the changes limited to the requested loading and error handling.
