import { useMemo } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { resolveImageUrl } from "../../../services/api";
import type { Product, Customer, Warehouse } from "../../../types";
import { TAX_RATE, formatTaxLabel } from "../../../utils/tax";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  isWholesale: boolean;
  paymentMethod: string;
}

interface SaleReviewModalProps {
  isOpen: boolean;
  cart: CartItem[];
  selectedCustomer: Customer | null;
  selectedWarehouse: Warehouse | null;
  notes: string;
  getActivePrice: (product: Product, isWholesale: boolean) => number;
  onConfirm: () => void;
  onBack: () => void;
}

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

export default function SaleReviewModal({
  isOpen,
  cart,
  selectedCustomer,
  selectedWarehouse,
  notes,
  getActivePrice,
  onConfirm,
  onBack,
}: SaleReviewModalProps) {
  const customerName = selectedCustomer
    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
    : "Cliente General";

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = getActivePrice(item.product, item.isWholesale);
      return sum + price * item.quantity - (item.discount || 0);
    }, 0);
    const tax = subtotal * TAX_RATE;
    return { subtotal, tax, total: subtotal + tax, items: cart.reduce((s, i) => s + i.quantity, 0) };
  }, [cart, getActivePrice]);

  const groupedCart = useMemo(() => {
    const groups = new Map<string, { items: CartItem[]; subtotal: number }>();
    cart.forEach((item) => {
      const method = item.paymentMethod || "efectivo";
      if (!groups.has(method)) groups.set(method, { items: [], subtotal: 0 });
      const price = getActivePrice(item.product, item.isWholesale);
      const lineTotal = price * item.quantity - (item.discount || 0);
      groups.get(method)!.items.push(item);
      groups.get(method)!.subtotal += lineTotal;
    });
    return groups;
  }, [cart, getActivePrice]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onBack} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Revisar Venta
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Verifica los detalles antes de confirmar la venta
        </p>
      </div>

      {/* Sale info */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Cliente</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {customerName}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Almacén</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {selectedWarehouse?.name ?? "Sin seleccionar"}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Artículos</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {totals.items} producto{totals.items !== 1 ? "s" : ""}
          </p>
        </div>
        {groupedCart.size > 1 && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Ventas a crear</span>
            <p className="font-medium text-brand-600 dark:text-brand-400 mt-0.5">
              {groupedCart.size} ({Array.from(groupedCart.keys()).map((k) => paymentLabels[k] ?? k).join(", ")})
            </p>
          </div>
        )}
        {notes && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Notas</span>
            <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5 whitespace-pre-wrap break-words">
              {notes}
            </p>
          </div>
        )}
      </div>

      {/* Items grouped by payment method */}
      {Array.from(groupedCart.entries()).map(([method, group]) => {
        const tax = group.subtotal * TAX_RATE;
        const total = group.subtotal + tax;
        const label = paymentLabels[method] ?? method;
        return (
          <div key={method} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-base">{method === "efectivo" ? "" : "↗"}</span>
              {label}
              <span className="ml-auto font-semibold text-gray-800 dark:text-white/90">Bs{total.toFixed(2)}</span>
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      Producto
                    </th>
                    <th className="text-center px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">
                      Cant.
                    </th>
                    <th className="text-right px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                      P.Unit.
                    </th>
                    <th className="text-right px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {group.items.map((item) => {
                    const url = resolveImageUrl(item.product.image_url);
                    const price = getActivePrice(item.product, item.isWholesale);
                    const lineTotal = price * item.quantity - (item.discount || 0);

                    return (
                      <tr
                        key={item.product.id}
                        className="bg-white dark:bg-gray-900/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                              {url ? (
                                <img
                                  src={url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold text-brand-500">
                                  {item.product.name?.[0]?.toUpperCase() ?? "?"}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-800 dark:text-white/90 break-words">
                                {item.product.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center text-gray-800 dark:text-white/90">
                          {item.quantity}
                        </td>
                        <td className="px-2 py-3 text-right text-gray-800 dark:text-white/90">
                          Bs{price.toFixed(2)}
                        </td>
                        <td className="px-2 py-3 text-right font-medium text-gray-800 dark:text-white/90">
                          Bs{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Grand Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>Bs{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatTaxLabel()}</span>
          <span>Bs{totals.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white/90 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>Bs{totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" size="sm" className="flex-1" onClick={onBack}>
          Volver
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={onConfirm}
        >
          Confirmar Venta
        </Button>
      </div>
    </Modal>
  );
}
