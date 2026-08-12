import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { resolveImageUrl } from "../../../services/api";
import type { Product, Customer, Warehouse } from "../../../types";
import { TAX_RATE, formatTaxLabel } from "../../../utils/tax";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface SaleReviewModalProps {
  isOpen: boolean;
  cart: CartItem[];
  selectedCustomer: Customer | null;
  selectedWarehouse: Warehouse | null;
  paymentMethod: string;
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
  paymentMethod,
  onConfirm,
  onBack,
}: SaleReviewModalProps) {
  if (!isOpen) return null;

  const customerName = selectedCustomer
    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
    : "Cliente General";

  const totals = cart.reduce(
    (acc, item) => {
      const price =
        typeof item.product.unit_price === "string"
          ? parseFloat(item.product.unit_price)
          : item.product.unit_price;
      const lineTotal = price * item.quantity - (item.discount || 0);
      acc.subtotal += lineTotal;
      acc.items += item.quantity;
      return acc;
    },
    { subtotal: 0, items: 0 },
  );

  const tax = totals.subtotal * TAX_RATE;
  const total = totals.subtotal + tax;

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
          <span className="text-gray-500 dark:text-gray-400">
            Método de pago
          </span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {paymentLabels[paymentMethod] ?? paymentMethod}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Artículos</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {totals.items} producto{totals.items !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Items table */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Artículos
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
                  Descuento
                </th>
                <th className="text-right px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {cart.map((item) => {
                const url = resolveImageUrl(item.product.image_url);
                const price =
                  typeof item.product.unit_price === "string"
                    ? parseFloat(item.product.unit_price)
                    : item.product.unit_price;
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
                    <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">
                      {item.discount > 0
                        ? `-Bs${item.discount.toFixed(2)}`
                        : "-"}
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

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>Bs{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatTaxLabel()}</span>
          <span>Bs{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white/90 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>Bs{total.toFixed(2)}</span>
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
