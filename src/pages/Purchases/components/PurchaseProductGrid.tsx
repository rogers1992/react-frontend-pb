import { useMemo } from "react";
import SearchInput from "../../../components/common/SearchInput";
import { resolveImageUrl } from "../../../services/api";
import { PlusIcon } from "../../../icons";
import type { Product, Category, Warehouse } from "../../../types";

interface PurchaseProductGridProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: number | "all";
  onCategoryChange: (cat: number | "all") => void;
  onAddToCart: (product: Product) => void;
  inCartIds: Set<number>;
  selectedWarehouse: Warehouse | null;
  canAddProducts: boolean;
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
  selectedWarehouse,
  canAddProducts,
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

      // When wholesale warehouse selected, only show products with wholesale cost
      const matchesWholesale =
        !selectedWarehouse?.is_wholesale ||
        p.wholesale_cost_price != null ||
        p.current_wholesale_cost != null;

      return matchesSearch && matchesCategory && matchesWholesale;
    });
  }, [products, searchQuery, selectedCategory, selectedWarehouse]);

  return (
    <div className="space-y-4">
      {!canAddProducts && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400">
          Selecciona almacén y proveedor para agregar productos.
        </div>
      )}
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
          <p className="text-sm">
            {selectedWarehouse?.is_wholesale
              ? "No hay productos con costo mayorista configurado"
              : "No se encontraron productos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const url = resolveImageUrl(product.image_url);
            const rawPrice = selectedWarehouse?.is_wholesale
              ? product.wholesale_price
              : product.unit_price;
            const price =
              typeof rawPrice === "string" ? parseFloat(rawPrice) : (rawPrice ?? 0);
            const alreadyInCart = inCartIds.has(product.id);

            const relevantCost = selectedWarehouse?.is_wholesale
              ? (product.current_wholesale_cost ?? product.wholesale_cost_price)
              : (product.current_cost ?? product.cost_price);

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
                    Precio venta: Bs{price.toFixed(2)}
                  </p>
                  {relevantCost != null && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {selectedWarehouse?.is_wholesale ? "Costo mayor" : "Costo"}: Bs{relevantCost.toFixed(2)}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={!canAddProducts || alreadyInCart}
                      className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        alreadyInCart
                          ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                          : canAddProducts
                            ? "bg-brand-500 text-white hover:bg-brand-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
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