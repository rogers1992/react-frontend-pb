import { resolveImageUrl } from "../../../services/api";
import type { Product } from "../../../types";
import Badge from "../../../components/ui/badge/Badge";
import { PlusIcon } from "../../../icons";

interface ProductCardProps {
  product: Product;
  stockQuantity: number;
  onAdd: () => void;
}

function getStockBadge(stock: number) {
  if (stock === 0) return { color: "error" as const, label: "Agotado" };
  if (stock <= 10) return { color: "warning" as const, label: "Poco stock" };
  return { color: "success" as const, label: "En stock" };
}

export default function ProductCard({ product, stockQuantity, onAdd }: ProductCardProps) {
  const url = resolveImageUrl(product.image_url);
  const { color, label } = getStockBadge(stockQuantity);
  const isOutOfStock = stockQuantity === 0;
  const price = typeof product.unit_price === "string" ? parseFloat(product.unit_price) : product.unit_price;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:border-brand-300 dark:border-white/[0.05] dark:bg-gray-800 dark:hover:border-brand-500/30">
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
        <p className="text-brand-500 font-semibold text-lg">
          Bs{price.toFixed(2)}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Badge size="sm" color={color}>
            {label}
          </Badge>
          <button
            onClick={onAdd}
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
