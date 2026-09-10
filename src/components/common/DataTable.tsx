import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import SearchInput from "./SearchInput";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
  onRowClick?: (item: T) => void;
  footer?: ReactNode;
  renderFooter?: (filteredData: T[]) => ReactNode;

  serverSide?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

type SortDirection = "asc" | "desc" | null;

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className="px-5 py-4">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No se encontraron registros.",
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  actions,
  onRowClick,
  footer,
  renderFooter,
  serverSide = false,
  totalItems,
  currentPage: controlledPage = 0,
  pageSize: controlledPageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [localPage, setLocalPage] = useState(0);
  const [localPageSize, setLocalPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const effectivePage = serverSide ? controlledPage : localPage;
  const effectivePageSize = serverSide ? controlledPageSize : localPageSize;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    if (!serverSide) setLocalPage(0);
  };

  useEffect(() => {
    if (!serverSide) setLocalPage(0);
  }, [searchValue, serverSide]);

  const sortedData = useMemo(() => {
    if (serverSide) return data;
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const aNum = typeof aVal === "string" ? parseFloat(aVal) : null;
      const bNum = typeof bVal === "string" ? parseFloat(bVal) : null;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (aNum !== null && bNum !== null && !isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [data, sortKey, sortDir, serverSide]);

  const filteredData = useMemo(() => {
    if (serverSide) return sortedData;
    if (!searchValue) return sortedData;
    const q = searchValue.toLowerCase();
    return sortedData.filter((item) =>
      columns.some((col) => {
        const val = (item as unknown as Record<string, unknown>)[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [sortedData, searchValue, columns, serverSide]);

  const displayTotal = serverSide ? (totalItems ?? 0) : filteredData.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / effectivePageSize));
  const currentPageIndex = Math.min(effectivePage, totalPages - 1);
  const paginatedData = serverSide
    ? filteredData
    : filteredData.slice(
        currentPageIndex * effectivePageSize,
        currentPageIndex * effectivePageSize + effectivePageSize,
      );

  const sortIcon = (key: string) => {
    if (sortKey !== key || !sortDir) {
      return (
        <svg
          className="ml-1 inline size-4 text-gray-300 dark:text-gray-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      );
    }
    if (sortDir === "asc") {
      return (
        <svg
          className="ml-1 inline size-4 text-brand-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m7 9 5-5 5 5" />
        </svg>
      );
    }
    return (
      <svg
        className="ml-1 inline size-4 text-brand-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m7 15 5 5 5-5" />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {(onSearchChange || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <div className="w-full sm:max-w-xs">
              <SearchInput
                value={searchValue ?? ""}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    isHeader
                    className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${
                      col.sortable
                        ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        : ""
                    } ${col.className ?? ""}`}
                    {...(col.sortable
                      ? { onClick: () => handleSort(col.key) }
                      : {})}
                  >
                    {col.header}
                    {col.sortable && sortIcon(col.key)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </TableRow>
              ) : (
                paginatedData.map((item, rowIndex) => (
                  <TableRow
                    key={
                      ((item as unknown as Record<string, unknown>)
                        .id as string) ?? rowIndex
                    }
                    className={
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                        : ""
                    }
                    {...(onRowClick ? { onClick: () => onRowClick(item) } : {})}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(item)
                          : String(
                              (item as unknown as Record<string, unknown>)[
                                col.key
                              ] ?? "",
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>

            {(footer || renderFooter) && (
              <tfoot className="border-t-2 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50">
                {renderFooter ? renderFooter(filteredData) : footer}
              </tfoot>
            )}
          </Table>
        </div>
      </div>

      {!loading && displayTotal > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {currentPageIndex * effectivePageSize + 1}–
            {Math.min((currentPageIndex + 1) * effectivePageSize, displayTotal)} de{" "}
            {displayTotal}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={effectivePageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (serverSide && onPageSizeChange) {
                  onPageSizeChange(newSize);
                } else {
                  setLocalPageSize(newSize);
                  setLocalPage(0);
                }
              }}
              className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button
              onClick={() => {
                if (serverSide && onPageChange) {
                  onPageChange(effectivePage - 1);
                } else {
                  setLocalPage((p) => Math.max(0, p - 1));
                }
              }}
              disabled={currentPageIndex === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-400">
              {currentPageIndex + 1} / {totalPages}
            </span>
            <button
              onClick={() => {
                if (serverSide && onPageChange) {
                  onPageChange(effectivePage + 1);
                } else {
                  setLocalPage((p) => Math.min(totalPages - 1, p + 1));
                }
              }}
              disabled={currentPageIndex >= totalPages - 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
