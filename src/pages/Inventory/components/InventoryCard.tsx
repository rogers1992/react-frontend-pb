import type { InventoryItem, Product } from "../../../types";
import Badge from "../../../components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { resolveImageUrl } from "../../../services/api";

interface InventoryCardProps {
  item: InventoryItem;
  product: Product | undefined;
  warehouseName: string;
  onEdit: (item: InventoryItem) => void;
  onTransfer: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

function getQuedanBadge(item: InventoryItem) {
  const available = item.quantity - item.reserved_quantity;
  const min = item.min_stock_level ?? 0;

  if (available === 0)
    return { color: "error" as const, label: "Agotado" };
  if (available <= min)
    return { color: "warning" as const, label: `Quedan ${available}` };
  return { color: "success" as const, label: `Quedan ${available}` };
}

export default function InventoryCard({
  item,
  product,
  warehouseName,
  onEdit,
  onTransfer,
  onDelete,
}: InventoryCardProps) {
  const url = product ? resolveImageUrl(product.image_url) : undefined;
  const initial = product?.name?.[0]?.toUpperCase() ?? "?";
  const { color, label } = getQuedanBadge(item);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-white/[0.05] dark:bg-gray-800">
      {/* Image block */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {url ? (
          <img
            src={url}
            alt={product?.name ?? "Producto"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-semibold text-brand-500">{initial}</span>
        )}

        {/* Quedan badge */}
        <div className="absolute top-2 right-2">
          <Badge size="sm" color={color}>
            {label}
          </Badge>
        </div>
      </div>

      {/* Content block */}
      <div className="p-2 space-y-1">
        <p className="font-medium text-gray-800 dark:text-white/90 truncate text-sm">
          {product?.name ?? `Producto #${item.product_id}`}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {warehouseName}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          SKU: {product?.sku || "—"}
        </p>
      </div>

      {/* Action strip — scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2 border-t border-gray-100 dark:border-gray-700/50 custom-scrollbar">
        <button
          onClick={() => onEdit(item)}
          className="flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400 transition"
        >
          <PencilIcon className="size-3.5" />
          Editar
        </button>
        <button
          onClick={() => onTransfer(item)}
          className="flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-500/15 dark:hover:text-blue-400 transition"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          Transferir
        </button>
        <button
          onClick={() => onDelete(item)}
          className="flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/15 dark:hover:text-red-400 transition"
        >
          <TrashBinIcon className="size-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
