import { resolveImageUrl } from "../../../services/api";
import type { Product, Category } from "../../../types";
import Badge from "../../../components/ui/badge/Badge";
import { PlusIcon, EyeIcon } from "../../../icons";

interface ProductCardProps {
  product: Product;
  category: Category | undefined;
  stockQuantity: number;
  onAdd: () => void;
  onClick: () => void;
}

function getStockBadge(stock: number) {
  if (stock === 0) return { color: "error" as const, label: "Agotado" };
  if (stock <= 10) return { color: "warning" as const, label: "Poco stock" };
  return { color: "success" as const, label: "En stock" };
}

export default function ProductCard({
  product,
  category,
  stockQuantity,
  onAdd,
  onClick,
}: ProductCardProps) {
  const url = resolveImageUrl(product.image_url);
  const { color, label } = getStockBadge(stockQuantity);
  const isOutOfStock = stockQuantity === 0;
  const price =
    typeof product.unit_price === "string"
      ? parseFloat(product.unit_price)
      : product.unit_price;

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:border-brand-300 hover:shadow-lg dark:border-white/[0.05] dark:bg-gray-800 dark:hover:border-brand-500/30 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {url ? (
          <img
            src={url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-3xl font-semibold text-brand-500">
            {product.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}

        {/* View Details Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
            <EyeIcon className="size-5 text-brand-500" />
          </div>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <Badge size="sm" color={color}>
            {label}
          </Badge>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <p className="font-medium text-gray-800 dark:text-white/90 truncate text-sm">
          {product.name}
        </p>

        {/* Category */}
        {category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {category.name}
          </p>
        )}

        {/* Description (truncated) */}
        {product.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-brand-500 font-semibold text-lg">
            Bs{price.toFixed(2)}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            disabled={isOutOfStock}
            className="flex items-center justify-center gap-1 bg-brand-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <PlusIcon className="size-3.5" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
