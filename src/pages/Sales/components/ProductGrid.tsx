import { useMemo } from "react";
import SearchInput from "../../../components/common/SearchInput";
import ProductCard from "./ProductCard";
import type { Product, Category } from "../../../types";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  isWholesale: boolean;
}

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  warehouseInventory: Map<number, number>;
  warehouseSelected: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: number | "all";
  onCategoryChange: (cat: number | "all") => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  cart: CartItem[];
  wholesaleMode: boolean;
  sortBy: "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock";
  onSortChange: (sort: string) => void;
  hideOutOfStock: boolean;
  onHideOutOfStockChange: (hide: boolean) => void;
}

export default function ProductGrid({
  products,
  categories,
  warehouseInventory,
  warehouseSelected,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onProductClick,
  cart,
  wholesaleMode,
  sortBy,
  onSortChange,
  hideOutOfStock,
  onHideOutOfStockChange,
}: ProductGridProps) {
  const filtered = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    const queryWords = searchQuery ? normalize(searchQuery).split(" ").filter(Boolean) : [];

    const result = products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        queryWords.every(
          (qw) =>
            normalize(p.name).includes(qw) ||
            normalize(p.sku || "").includes(qw) ||
            normalize(p.barcode || "").includes(qw),
        );
      const matchesCategory =
        selectedCategory === "all" || p.category_id === selectedCategory;
      const matchesWholesale = !wholesaleMode || p.wholesale_price != null;
      const matchesStock = !hideOutOfStock || (warehouseInventory.get(p.id) ?? 0) > 0;
      return matchesSearch && matchesCategory && matchesWholesale && matchesStock;
    });

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.unit_price ?? 0) - (b.unit_price ?? 0);
        case "price-desc":
          return (b.unit_price ?? 0) - (a.unit_price ?? 0);
        case "stock":
          return (warehouseInventory.get(b.id) ?? 0) - (warehouseInventory.get(a.id) ?? 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchQuery, selectedCategory, wholesaleMode, hideOutOfStock, warehouseInventory, sortBy]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  return (
    <div className="space-y-4">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar por nombre, SKU o código de barras..."
        className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-2"
      />

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="name-asc">Nombre (A-Z)</option>
          <option value="name-desc">Nombre (Z-A)</option>
          <option value="price-asc">Precio (menor a mayor)</option>
          <option value="price-desc">Precio (mayor a menor)</option>
          <option value="stock">Stock disponible</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={hideOutOfStock}
            onChange={(e) => onHideOutOfStockChange(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500/20"
          />
          Solo con stock
        </label>
      </div>

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
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((product) => {
            const stockQuantity = warehouseInventory.get(product.id) ?? 0;
            const cartQty = cart.find((i) => i.product.id === product.id)?.quantity ?? 0;
            const availableStock = Math.max(0, stockQuantity - cartQty);
            return (
            <ProductCard
              key={product.id}
              product={product}
              category={categoryMap.get(product.category_id)}
              stockQuantity={stockQuantity}
              availableStock={availableStock}
              warehouseSelected={warehouseSelected}
              onAdd={() => onAddToCart(product)}
              onClick={() => onProductClick(product)}
              wholesaleMode={wholesaleMode}
            />
            );
          })}
        </div>
      )}
    </div>
  );
}
