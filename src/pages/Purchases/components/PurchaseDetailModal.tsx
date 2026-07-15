import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { CloseIcon } from "../../../icons";
import type { Order } from "../../../types";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  supplierName: string;
  warehouseName: string;
  createdByName: string;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  received: "Recibido",
  cancelled: "Cancelado",
};

const statusClasses: Record<string, string> = {
  pending: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  received: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  cancelled: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

export default function PurchaseDetailModal({
  isOpen,
  order,
  supplierName,
  warehouseName,
  createdByName,
  onClose,
}: PurchaseDetailModalProps) {
  if (!order) return null;

  const total = typeof order.total_amount === "string" ? parseFloat(order.total_amount) : order.total_amount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Detalle de Compra #{order.id}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(order.order_date)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Cerrar"
        >
          <CloseIcon className="size-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Proveedor</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{supplierName}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Almacén</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{warehouseName}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Registrado por</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{createdByName}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Estado</span>
          <div className="mt-0.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[order.status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>
        </div>
        {order.expected_date && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Fecha esperada</span>
            <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{formatDateOnly(order.expected_date)}</p>
          </div>
        )}
        {order.received_date && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Fecha de recepción</span>
            <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{formatDateOnly(order.received_date)}</p>
          </div>
        )}
        {order.notes && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Notas</span>
            <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Artículos</h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Producto</th>
                <th className="text-center px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">Cant.</th>
                <th className="text-right px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Costo Unit.</th>
                <th className="text-right px-2 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {order.items.map((item) => {
                const cost = typeof item.unit_cost === "string" ? parseFloat(item.unit_cost) : item.unit_cost;
                const totalPrice = typeof item.total_price === "string" ? parseFloat(item.total_price) : item.total_price;
                return (
                  <tr key={item.id} className="bg-white dark:bg-gray-900/30">
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90 break-words">{item.product_name}</td>
                    <td className="px-2 py-3 text-center text-gray-800 dark:text-white/90">{item.quantity}</td>
                    <td className="px-2 py-3 text-right text-gray-800 dark:text-white/90">Bs{cost.toFixed(2)}</td>
                    <td className="px-2 py-3 text-right font-medium text-gray-800 dark:text-white/90">Bs{totalPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white/90 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>Bs{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}