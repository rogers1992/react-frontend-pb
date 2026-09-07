import { useState, useRef, useEffect } from "react";
import type { Warehouse } from "../../types";
import { ChevronDownIcon, CheckLineIcon } from "../../icons";

interface WarehouseMultiSelectProps {
  warehouses: Warehouse[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function WarehouseMultiSelect({
  warehouses,
  selectedIds,
  onChange,
}: WarehouseMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = selectedIds.length === warehouses.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : warehouses.map((w) => w.id));
  };

  const toggleOne = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    );
  };

  const removeOne = (id: number) => {
    onChange(selectedIds.filter((i) => i !== id));
  };

  const label =
    selectedIds.length === 0
      ? "Todos"
      : selectedIds.length === warehouses.length
        ? "Todos"
        : `${selectedIds.length} almacén${selectedIds.length !== 1 ? "es" : ""}`;

  const selectedWarehouses = warehouses.filter((w) =>
    selectedIds.includes(w.id),
  );

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        Almacén
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-11 w-full min-w-[180px] rounded-lg border border-gray-300 bg-white px-3 text-left text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 flex items-center justify-between"
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon
          className={`size-4 text-gray-400 transition shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {selectedIds.length > 0 && selectedIds.length < warehouses.length && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedWarehouses.map((w) => (
            <span
              key={w.id}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            >
              {w.name}
              <button
                type="button"
                onClick={() => removeOne(w.id)}
                className="hover:text-brand-900 dark:hover:text-brand-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={toggleAll}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                allSelected
                  ? "bg-brand-500 border-brand-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {allSelected && <CheckLineIcon className="size-3 text-white" />}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Todos
            </span>
          </button>
          {warehouses.map((w) => {
            const checked = selectedIds.includes(w.id);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => toggleOne(w.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    checked
                      ? "bg-brand-500 border-brand-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {checked && <CheckLineIcon className="size-3 text-white" />}
                </span>
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {w.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
