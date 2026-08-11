import { useMemo } from "react";
import SearchInput from "../../../components/common/SearchInput";
import ProductCard from "./ProductCard";
import type { Product, Category } from "../../../types";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  warehouseInventory: Map<number, number>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: number | "all";
  onCategoryChange: (cat: number | "all") => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({
  products,
  categories,
  warehouseInventory,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onProductClick,
}: ProductGridProps) {
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
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={categoryMap.get(product.category_id)}
              stockQuantity={warehouseInventory.get(product.id) ?? 0}
              onAdd={() => onAddToCart(product)}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
