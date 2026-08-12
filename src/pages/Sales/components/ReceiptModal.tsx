import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { CheckCircleIcon } from "../../../icons";
import type { Sale } from "../../../types";
import { formatTaxLabel } from "../../../utils/tax";

interface ReceiptModalProps {
  isOpen: boolean;
  sale: Sale | null;
  customerName: string;
  onClose: () => void;
  onNewSale: () => void;
}

export default function ReceiptModal({ isOpen, sale, customerName, onClose, onNewSale }: ReceiptModalProps) {
  if (!sale) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
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

  const paymentLabels: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    tarjeta: "Tarjeta",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-success-50 dark:bg-success-500/15 text-success-500 mb-4">
          <CheckCircleIcon className="size-7" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Venta Registrada Exitosamente
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Venta #{sale.id}
        </p>

        {/* Sale info */}
        <div className="w-full grid grid-cols-2 gap-3 text-sm mb-6">
          <div className="text-gray-500 dark:text-gray-400">Fecha</div>
          <div className="text-right font-medium text-gray-800 dark:text-white/90">
            {formatDate(sale.sale_date)}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Cliente</div>
          <div className="text-right font-medium text-gray-800 dark:text-white/90">
            {customerName}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Método de pago</div>
          <div className="text-right font-medium text-gray-800 dark:text-white/90">
            {paymentLabels[sale.payment_method] ?? sale.payment_method}
          </div>
        </div>

        {/* Items table */}
        <div className="w-full mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Producto</th>
                <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Cant.</th>
                <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">P.Unit.</th>
                <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => {
                const price = typeof item.unit_price === "string" ? parseFloat(item.unit_price) : item.unit_price;
                const totalPrice = typeof item.total_price === "string" ? parseFloat(item.total_price) : item.total_price;
                return (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-800 dark:text-white/90">
                      <span className="truncate block max-w-[120px]">
                        {item.product_name}
                      </span>
                    </td>
                    <td className="py-2 text-center text-gray-800 dark:text-white/90">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-800 dark:text-white/90">Bs{price.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium text-gray-800 dark:text-white/90">Bs{totalPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>Bs{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{formatTaxLabel()}</span>
            <span>Bs{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white/90 pt-2">
            <span>Total</span>
            <span>Bs{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={onNewSale}>
            Nueva Venta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
