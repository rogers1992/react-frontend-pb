const DEFAULT_STORAGE_KEY = "app_search_history";
const MAX_HISTORY = 5;

export function getSearchHistory(storageKey: string = DEFAULT_STORAGE_KEY): string[] {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function addToHistory(query: string, storageKey: string = DEFAULT_STORAGE_KEY): void {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return;

  const prev = getSearchHistory(storageKey);
  const filtered = prev.filter((q) => q !== trimmed);
  const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(storageKey, JSON.stringify(updated));
}

export function clearSearchHistory(storageKey: string = DEFAULT_STORAGE_KEY): void {
  localStorage.removeItem(storageKey);
}
