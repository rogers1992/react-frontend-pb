import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { CloseIcon } from "../../../icons";
import type { Sale } from "../../../types";

interface SaleDetailModalProps {
  isOpen: boolean;
  sale: Sale | null;
  customerName: string;
  sellerName: string;
  onClose: () => void;
}

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

const statusLabels: Record<string, string> = {
  completed: "Completada",
  pending: "Pendiente",
  cancelled: "Cancelada",
};

const statusClasses: Record<string, string> = {
  completed: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  pending: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  cancelled: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
};

export default function SaleDetailModal({ isOpen, sale, customerName, sellerName, onClose }: SaleDetailModalProps) {
  if (!sale) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const subtotal = sale.items.reduce((sum, item) => {
    const price = typeof item.unit_price === "string" ? parseFloat(item.unit_price) : item.unit_price;
    const discount = typeof item.discount === "string" ? parseFloat(item.discount) : item.discount;
    return sum + price * item.quantity - discount;
  }, 0);

  const tax = typeof sale.tax_amount === "string" ? parseFloat(sale.tax_amount) : (sale.tax_amount ?? 0);
  const total = typeof sale.total_amount === "string" ? parseFloat(sale.total_amount) : sale.total_amount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Detalle de Venta #{sale.id}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(sale.sale_date)}
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
          <span className="text-gray-500 dark:text-gray-400">Cliente</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{customerName}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Vendedor</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{sellerName}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Método de pago</span>
          <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">
            {paymentLabels[sale.payment_method] ?? sale.payment_method}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Estado</span>
          <div className="mt-0.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[sale.status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
              {statusLabels[sale.status] ?? sale.status}
            </span>
          </div>
        </div>
        {sale.notes && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Notas</span>
            <p className="font-medium text-gray-800 dark:text-white/90 mt-0.5">{sale.notes}</p>
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
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Cant.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">P.Unit.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Descuento</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sale.items.map((item) => {
                const price = typeof item.unit_price === "string" ? parseFloat(item.unit_price) : item.unit_price;
                const discount = typeof item.discount === "string" ? parseFloat(item.discount) : item.discount;
                const totalPrice = typeof item.total_price === "string" ? parseFloat(item.total_price) : item.total_price;
                return (
                  <tr key={item.id} className="bg-white dark:bg-gray-900/30">
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">{item.product_name}</td>
                    <td className="px-4 py-3 text-center text-gray-800 dark:text-white/90">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-800 dark:text-white/90">Bs{price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                      {discount > 0 ? `-Bs${discount.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white/90">Bs{totalPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>Bs{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>IVA (16%)</span>
          <span>Bs{tax.toFixed(2)}</span>
        </div>
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
