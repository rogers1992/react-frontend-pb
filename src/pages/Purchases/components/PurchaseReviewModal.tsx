import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import type { Product, Supplier, Warehouse } from "../../../types";

interface CartItem {
  product: Product;
  quantity: number;
  unit_cost: number;
}

interface PurchaseReviewModalProps {
  isOpen: boolean;
  cart: CartItem[];
  selectedSupplier: Supplier | null;
  selectedWarehouse: Warehouse | null;
  expectedDate: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PurchaseReviewModal({
  isOpen,
  cart,
  selectedSupplier,
  selectedWarehouse,
  expectedDate,
  onConfirm,
  onBack,
}: PurchaseReviewModalProps) {
  if (!isOpen) return null;

  const supplierName = selectedSupplier?.name ?? "Sin seleccionar";
  const warehouseName = selectedWarehouse?.name ?? "Sin seleccionar";

  const totals = cart.reduce(
    (acc, item) => {
      const cost =
        typeof item.unit_cost === "number"
          ? item.unit_cost
          : parseFloat(item.unit_cost as unknown as string);
      const lineTotal = cost * item.quantity;
      acc.subtotal += lineTotal;
      acc.items += item.quantity;
      return acc;
    },
    { subtotal: 0, items: 0 },
  );

  const total = totals.subtotal;

  // ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone
  const formatDate = (iso: string) => {
    if (!iso) return "Sin especificar";
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onBack} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Revisar Compra
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Verifica los detalles antes de registrar la orden de compra
        </p>
      </div>

      {/* Purchase info */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Proveedor</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {supplierName}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Almacén</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {warehouseName}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Fecha esperada</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {formatDate(expectedDate)}
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
                  Costo Unit.
                </th>
                <th className="text-right px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {cart.map((item) => {
                const cost =
                  typeof item.unit_cost === "number"
                    ? item.unit_cost
                    : parseFloat(item.unit_cost as unknown as string);
                const lineTotal = cost * item.quantity;
                return (
                  <tr
                    key={item.product.id}
                    className="bg-white dark:bg-gray-900/30"
                  >
                    <td className="px-4 py-3">
                      <p className="text-gray-800 dark:text-white/90 break-words">
                        {item.product.name}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-center text-gray-800 dark:text-white/90">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-3 text-right text-gray-800 dark:text-white/90">
                      Bs{cost.toFixed(2)}
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
          Confirmar Compra
        </Button>
      </div>
    </Modal>
  );
}