import { useEffect, useState } from "react";
import type { Repo } from "../api/types";

const STORAGE_KEY = "developer-intelligence:favorites";

function readFavorites(): Repo[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? (value as Repo[]) : [];
  } catch {
    return [];
  }
}

export function useFavoriteRepos() {
  const [favorites, setFavorites] = useState<Repo[]>(readFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Keep favorites available for this session if browser storage is blocked.
    }
  }, [favorites]);

  const toggleFavorite = (repo: Repo) => {
    setFavorites((current) =>
      current.some((favorite) => favorite.id === repo.id)
        ? current.filter((favorite) => favorite.id !== repo.id)
        : [repo, ...current],
    );
  };

  return { favorites, toggleFavorite };
}