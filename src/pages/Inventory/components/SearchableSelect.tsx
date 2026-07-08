import { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
  searchText?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  disabled?: boolean;
  className?: string;
}

const MAX_VISIBLE = 50;

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar opción",
  searchPlaceholder = "Buscar...",
  noResultsText = "Sin resultados",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      (o.searchText ?? o.label).toLowerCase().includes(q)
    );
  }, [options, query]);

  const visible = filtered.slice(0, MAX_VISIBLE);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setFocusedIndex(-1);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const el = listRef.current.querySelector<HTMLElement>(
        `[data-index="${focusedIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, isOpen]);

  const open = () => {
    if (!disabled) setIsOpen(true);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!isOpen) {
          open();
        } else if (focusedIndex >= 0 && visible[focusedIndex]) {
          handleSelect(visible[focusedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setFocusedIndex((prev) =>
            prev < visible.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : visible.length - 1
          );
        }
        break;
      case "Backspace":
        if (isOpen && !query && selectedOption) {
          handleClear(e as unknown as React.MouseEvent);
        }
        break;
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div
        onClick={open}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs transition focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } ${
          selectedOption
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="flex items-center gap-1 pl-2">
          {selectedOption && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Limpiar selección"
            >
              <svg
                className="fill-current"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                />
              </svg>
            </button>
          ) : null}
          <svg
            className={`stroke-current transition-transform ${
              isOpen ? "rotate-180" : ""
            } text-gray-500 dark:text-gray-400`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 z-40 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-200 p-2 dark:border-gray-800">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFocusedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-hidden focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {noResultsText}
              </div>
            ) : (
              visible.map((option, index) => {
                const isSelected = option.value === value;
                const isFocused = index === focusedIndex;
                return (
                  <div
                    key={option.value}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`flex cursor-pointer items-center px-4 py-2.5 text-sm ${
                      isSelected
                        ? "bg-brand-500/10 text-brand-700 dark:text-brand-400"
                        : isFocused
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"
                          : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                  </div>
                );
              })
            )}
            {filtered.length > MAX_VISIBLE && (
              <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                Mostrando {MAX_VISIBLE} de {filtered.length} resultados. Afina la búsqueda.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
