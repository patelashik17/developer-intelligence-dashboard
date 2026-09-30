import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import RepoPage from "./pages/RepoPage";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("developer-intelligence:theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("developer-intelligence:theme", theme);
    } catch {
      // The selected theme remains active for this session if storage is blocked.
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-white focus:p-2"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-700 text-xs font-bold text-white">
              DI
            </span>
            <span className="font-semibold text-slate-900">
              Developer Intelligence
            </span>
          </Link>
          <button
            type="button"
            aria-label="Toggle dark mode"
            aria-pressed={darkMode}
            onClick={() => setDarkMode((current) => !current)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            {darkMode ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/repo/:owner/:repo" element={<RepoPage />} />
          <Route
            path="*"
            element={
              <p>
                Page not found.{" "}
                <Link className="text-indigo-700 underline" to="/">
                  Back to search
                </Link>
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
