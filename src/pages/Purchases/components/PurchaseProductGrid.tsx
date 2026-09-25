import { useMemo } from "react";
import SearchInput from "../../../components/common/SearchInput";
import { resolveImageUrl } from "../../../services/api";
import { PlusIcon } from "../../../icons";
import type { Product, Category } from "../../../types";

interface PurchaseProductGridProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: number | "all";
  onCategoryChange: (cat: number | "all") => void;
  onAddToCart: (product: Product) => void;
  inCartIds: Set<number>;
}

export default function PurchaseProductGrid({
  products,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  inCartIds,
}: PurchaseProductGridProps) {
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-4">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar por nombre, SKU o código de barras..."
      />

      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => onCategoryChange("all")}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            selectedCategory === "all"
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedCategory === cat.id
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            className="mb-3 size-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-sm">No se encontraron productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const url = resolveImageUrl(product.image_url);
            const price =
              typeof product.unit_price === "string"
                ? parseFloat(product.unit_price)
                : product.unit_price;
            const alreadyInCart = inCartIds.has(product.id);

            return (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:border-brand-300 dark:border-white/[0.05] dark:bg-gray-800 dark:hover:border-brand-500/30"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {url ? (
                    <img src={url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-semibold text-brand-500">
                      {product.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-medium text-gray-800 dark:text-white/90 truncate text-sm">
                    {product.name}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    Precio venta: ${price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        alreadyInCart
                          ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                          : "bg-brand-500 text-white hover:bg-brand-600"
                      }`}
                    >
                      <PlusIcon className="size-3.5" />
                      {alreadyInCart ? "Agregado" : "Agregar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}