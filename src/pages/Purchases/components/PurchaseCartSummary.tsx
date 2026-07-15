import { useMemo } from "react";
import type { Supplier, Warehouse, Product } from "../../../types";
import { resolveImageUrl } from "../../../services/api";
import { TrashBinIcon, PlusIcon } from "../../../icons";
import Button from "../../../components/ui/button/Button";
import DatePicker from "../../../components/form/date-picker";

interface CartItem {
  product: Product;
  quantity: number;
  unit_cost: number;
}

interface PurchaseCartSummaryProps {
  cart: CartItem[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  selectedSupplier: Supplier | null;
  selectedWarehouse: Warehouse | null;
  expectedDate: string;
  submitting: boolean;
  onSelectSupplier: (s: Supplier | null) => void;
  onSelectWarehouse: (w: Warehouse | null) => void;
  onExpectedDateChange: (d: string) => void;
  onUpdateCart: (productId: number, quantity: number, unitCost: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PurchaseCartSummary({
  cart,
  suppliers,
  warehouses,
  selectedSupplier,
  selectedWarehouse,
  expectedDate,
  submitting,
  onSelectSupplier,
  onSelectWarehouse,
  onExpectedDateChange,
  onUpdateCart,
  onRemoveFromCart,
  onConfirm,
  onCancel,
}: PurchaseCartSummaryProps) {
  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const cost =
        typeof item.unit_cost === "number"
          ? item.unit_cost
          : parseFloat(item.unit_cost as unknown as string);
      return sum + cost * item.quantity;
    }, 0);
  }, [cart]);

  return (
    <div className="sticky top-4 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-800 p-5 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Resumen de Compra
      </h3>

      {/* Supplier selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Proveedor
        </label>
        <select
          value={selectedSupplier?.id ?? ""}
          onChange={(e) => {
            const s = suppliers.find((sp) => sp.id === Number(e.target.value));
            onSelectSupplier(s ?? null);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
        >
          <option value="">Sin proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Warehouse selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Almacén
        </label>
        <select
          value={selectedWarehouse?.id ?? ""}
          onChange={(e) => {
            const w = warehouses.find((wh) => wh.id === Number(e.target.value));
            onSelectWarehouse(w ?? null);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
        >
          <option value="">Seleccionar almacén</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Expected date */}
      <div>
        <DatePicker
          id="purchase-expected-date"
          label="Fecha esperada (opcional)"
          value={expectedDate}
          onChange={onExpectedDateChange}
        />
      </div>

      {/* Cart items */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Productos ({cart.reduce((s, i) => s + i.quantity, 0)})
        </p>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <svg
              className="mb-2 size-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <p className="text-sm">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-3">
            {cart.map((item) => (
              <PurchaseCartItemRow
                key={item.product.id}
                item={item}
                onUpdate={(qty, cost) => onUpdateCart(item.product.id, qty, cost)}
                onRemove={() => onRemoveFromCart(item.product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white/90 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>Bs{total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400">
          La orden se creará con estado <span className="font-medium text-warning-600">Pendiente</span>. El inventario se actualizará al recibir.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={onConfirm}
          disabled={cart.length === 0 || !selectedWarehouse || submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </span>
          ) : (
            "Confirmar Compra"
          )}
        </Button>
      </div>
    </div>
  );
}

interface PurchaseCartItemRowProps {
  item: CartItem;
  onUpdate: (quantity: number, unitCost: number) => void;
  onRemove: () => void;
}

function PurchaseCartItemRow({ item, onUpdate, onRemove }: PurchaseCartItemRowProps) {
  const url = resolveImageUrl(item.product.image_url);
  const cost =
    typeof item.unit_cost === "number"
      ? item.unit_cost
      : parseFloat(item.unit_cost as unknown as string);
  const lineTotal = cost * item.quantity;

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, item.quantity + delta);
    onUpdate(newQty, cost);
  };

  const handleQuantityDirectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      onUpdate(1, cost);
      return;
    }
    onUpdate(Math.floor(val), cost);
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdate(item.quantity, isNaN(val) || val < 0 ? 0 : val);
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
            Bs{cost.toFixed(2)} c/u
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

      {/* Bottom row: quantity controls, unit cost */}
      <div className="flex items-center gap-4 pl-[52px]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Cantidad</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
              className="h-7 w-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={item.quantity}
              onChange={handleQuantityDirectChange}
              className="w-12 h-7 rounded-md border border-gray-300 text-center text-sm font-medium text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              onClick={() => handleQuantityChange(1)}
              className="h-7 w-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Costo</span>
          <span className="text-xs text-gray-400">Bs</span>
          <input
            type="number"
            value={cost || ""}
            onChange={handleCostChange}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-20 h-7 rounded-md border border-gray-300 px-2 text-xs text-right dark:bg-gray-800 dark:border-gray-600 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>
    </div>
  );
}