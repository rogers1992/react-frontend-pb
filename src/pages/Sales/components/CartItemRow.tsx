import { resolveImageUrl } from "../../../services/api";
import type { Product } from "../../../types";
import { TrashBinIcon, PlusIcon } from "../../../icons";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  isWholesale: boolean;
  paymentMethod: string;
}

interface CartItemRowProps {
  item: CartItem;
  stockQuantity: number;
  onUpdate: (quantity: number, discount: number) => void;
  onRemove: () => void;
  onPaymentMethodChange: (method: string) => void;
  getActivePrice: (product: Product, isWholesale: boolean) => number;
}

export default function CartItemRow({
  item,
  stockQuantity,
  onUpdate,
  onRemove,
  onPaymentMethodChange,
  getActivePrice,
}: CartItemRowProps) {
  const url = resolveImageUrl(item.product.image_url);
  const price = getActivePrice(item.product, item.isWholesale);
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
            Bs{price.toFixed(2)} c/u{item.isWholesale && " (por mayor)"}
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

      {/* Payment method selector */}
      <div className="flex items-center gap-2 pl-[52px]">
        <span className="text-xs text-gray-500 dark:text-gray-400">Método:</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onPaymentMethodChange("efectivo")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition cursor-pointer ${
              item.paymentMethod === "efectivo"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="3" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            Efectivo
          </button>
          <button
            type="button"
            onClick={() => onPaymentMethodChange("transferencia")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition cursor-pointer ${
              item.paymentMethod === "transferencia"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" />
              <path d="M8 3H3v5" />
              <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
              <path d="m15 9 6-6" />
            </svg>
            Transferencia
          </button>
        </div>
      </div>
    </div>
  );
}
