import { useState, useEffect, useRef } from "react";
import {
  getSearchHistory,
  addToHistory,
  clearSearchHistory,
} from "../../utils/searchHistory";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  storageKey?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 300,
  className,
  storageKey = "app_search_history",
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory(storageKey));
  }, [storageKey]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const saveToHistory = (query: string) => {
    addToHistory(query, storageKey);
    setHistory(getSearchHistory(storageKey));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    if (value) saveToHistory(value);
    setInternalValue("");
    onChange("");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onFocus={() => {
          if (!value && history.length > 0) setShowHistory(true);
        }}
        onBlur={() => {
          if (value) saveToHistory(value);
          setShowHistory(false);
        }}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-9 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
      {showHistory && history.length > 0 && !value && (
        <div className="absolute z-20 w-full mt-1 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 font-medium">
              Búsquedas recientes
            </p>
            {history.map((query) => (
              <button
                key={query}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(query);
                  setShowHistory(false);
                }}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded truncate"
              >
                {query}
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setHistory([]);
                clearSearchHistory(storageKey);
              }}
              className="w-full text-left px-2 py-1.5 text-xs text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded mt-1"
            >
              Limpiar historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
