import { resolveImageUrl } from "../../../services/api";
import type { Product } from "../../../types";
import { TrashBinIcon, PlusIcon } from "../../../icons";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface CartItemRowProps {
  item: CartItem;
  stockQuantity: number;
  onUpdate: (quantity: number, discount: number) => void;
  onRemove: () => void;
}

export default function CartItemRow({
  item,
  stockQuantity,
  onUpdate,
  onRemove,
}: CartItemRowProps) {
  const url = resolveImageUrl(item.product.image_url);
  const price =
    typeof item.product.unit_price === "string"
      ? parseFloat(item.product.unit_price)
      : item.product.unit_price;
  const lineTotal = price * item.quantity - (item.discount || 0);

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, Math.min(stockQuantity, item.quantity + delta));
    onUpdate(newQty, item.discount);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onUpdate(item.quantity, Math.max(0, val));
  };

  return (
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] space-y-2">
      {/* Top row: image, name, total, remove */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
          {url ? (
            <img
              src={url}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-brand-500">
              {item.product.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
            {item.product.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bs{price.toFixed(2)} c/u
          </p>
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white/90 shrink-0">
          Bs{lineTotal.toFixed(2)}
        </p>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-error-500 transition shrink-0"
          title="Eliminar"
        >
          <TrashBinIcon className="size-4" />
        </button>
      </div>

      {/* Bottom row: quantity controls, discount */}
      <div className="flex items-center gap-4 pl-[52px]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Cantidad
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
              className="h-7 w-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-800 dark:text-white/90">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={item.quantity >= stockQuantity}
              className="h-7 w-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Descuento
          </span>
          <span className="text-xs text-gray-400">Bs</span>
          <input
            type="number"
            value={item.discount || ""}
            onChange={handleDiscountChange}
            placeholder="0"
            min="0"
            className="w-16 h-7 rounded-md border border-gray-300 px-2 text-xs text-right dark:bg-gray-800 dark:border-gray-600 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>
    </div>
  );
}
