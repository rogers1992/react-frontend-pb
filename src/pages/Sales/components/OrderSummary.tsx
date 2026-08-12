import { useMemo } from "react";
import type { Customer, Warehouse, Product } from "../../../types";
import CartItemRow from "./CartItemRow";
import PaymentMethodSelector from "./PaymentMethodSelector";
import Button from "../../../components/ui/button/Button";
import { TAX_RATE, formatTaxLabel } from "../../../utils/tax";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface OrderSummaryProps {
  cart: CartItem[];
  customers: Customer[];
  selectedCustomer: Customer | null;
  selectedWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  paymentMethod: string;
  submitting: boolean;
  warehouseInventory: Map<number, number>;
  hasNoWarehouses?: boolean;
  onSelectCustomer: (c: Customer | null) => void;
  onSelectWarehouse: (w: Warehouse | null) => void;
  onUpdateCart: (productId: number, quantity: number, discount: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onPaymentMethodChange: (method: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrderSummary({
  cart,
  customers,
  selectedCustomer,
  selectedWarehouse,
  warehouses,
  paymentMethod,
  submitting,
  warehouseInventory,
  hasNoWarehouses = false,
  onSelectCustomer,
  onSelectWarehouse,
  onUpdateCart,
  onRemoveFromCart,
  onPaymentMethodChange,
  onConfirm,
  onCancel,
}: OrderSummaryProps) {
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = typeof item.product.unit_price === "string" ? parseFloat(item.product.unit_price) : item.product.unit_price;
      return sum + price * item.quantity - (item.discount || 0);
    }, 0);
    const iva = subtotal * TAX_RATE;
    return { subtotal, iva, total: subtotal + iva };
  }, [cart]);

  return (
    <div className="sticky top-4 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-800 p-5 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Resumen de Venta
      </h3>

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
        {hasNoWarehouses && (
          <p className="mt-1 text-xs text-error-500">
            No tienes almacenes asignados. Contacta al administrador.
          </p>
        )}
      </div>

      {/* Customer selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cliente
        </label>
        <select
          value={selectedCustomer?.id ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              onSelectCustomer(null);
            } else {
              const c = customers.find((cu) => cu.id === Number(val));
              onSelectCustomer(c ?? null);
            }
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
        >
          <option value="">Cliente General</option>
          {customers
            .filter((c) => !(c.first_name === "Cliente" && c.last_name === "General"))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
        </select>
        {selectedCustomer === null && (
          <p className="mt-1 text-xs text-gray-400">Cliente General</p>
        )}
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
              <CartItemRow
                key={item.product.id}
                item={item}
                stockQuantity={warehouseInventory.get(item.product.id) ?? 0}
                onUpdate={(qty, disc) => onUpdateCart(item.product.id, qty, disc)}
                onRemove={() => onRemoveFromCart(item.product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment method */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Método de pago
        </p>
        <PaymentMethodSelector value={paymentMethod} onChange={onPaymentMethodChange} />
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>Bs{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatTaxLabel()}</span>
          <span>Bs{totals.iva.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white/90 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>Bs{totals.total.toFixed(2)}</span>
        </div>
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
          disabled={cart.length === 0 || submitting}
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
            "Confirmar Venta"
          )}
        </Button>
      </div>
    </div>
  );
}
