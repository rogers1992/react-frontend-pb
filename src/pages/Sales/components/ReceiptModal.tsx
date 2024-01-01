import { Modal } from "../../../components/ui/modal";
import { CheckCircleIcon, ChatIcon, DownloadIcon } from "../../../icons";
import { generateReceiptPdf } from "../../../utils/receiptPdf";
import type { Sale } from "../../../types";

interface ReceiptModalProps {
  isOpen: boolean;
  sale: Sale | null;
  customerName: string;
  sellerName: string;
  onClose: () => void;
  onNewSale: () => void;
}

export default function ReceiptModal({
  isOpen,
  sale,
  customerName,
  sellerName,
  onClose,
  onNewSale,
}: ReceiptModalProps) {
  if (!sale) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-BO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const total = typeof sale.total_amount === "string" ? parseFloat(sale.total_amount) : sale.total_amount;
  const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);

  const paymentLabels: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    tarjeta: "Tarjeta",
  };

  const handleDownloadPdf = async () => {
    await generateReceiptPdf(sale, customerName, sellerName);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-0 overflow-hidden" showCloseButton={false}>
      <div className="flex flex-col items-center px-6 pt-8 pb-6">
        {/* Green checkmark */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/15 text-green-500 mb-4">
          <CheckCircleIcon className="size-7" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
          Venta registrada
        </h3>

        {/* Big total */}
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bs {total.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        {/* Sale info line */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          #{sale.id} &middot; {formatDate(sale.sale_date)} &middot; {sale.warehouse_name || "Tienda Principal"}
        </p>

        {/* Info grid */}
        <div className="w-full space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Cliente</span>
            <span className="font-medium text-gray-800 dark:text-white/90">{customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Vendedor</span>
            <span className="font-medium text-gray-800 dark:text-white/90">{sellerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Pago</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {paymentLabels[sale.payment_method] ?? sale.payment_method}
            </span>
          </div>
        </div>

        {/* Products section */}
        <div className="w-full mb-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {totalItems} {totalItems === 1 ? "Producto" : "Productos"}
          </p>
          <div className="space-y-2">
            {sale.items.map((item) => {
              const price = typeof item.unit_price === "string" ? parseFloat(item.unit_price) : item.unit_price;
              const totalPrice = typeof item.total_price === "string" ? parseFloat(item.total_price) : item.total_price;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.quantity} &times; Bs {price.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90 flex-shrink-0">
                    Bs {totalPrice.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full flex gap-3 mb-4">
          <button
            disabled
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
            title="Próximamente"
          >
            <ChatIcon className="size-5" />
            <span className="text-xs font-medium">WhatsApp</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <DownloadIcon className="size-5" />
            <span className="text-xs font-medium">PDF</span>
          </button>
        </div>

        {/* Nueva venta button */}
        <button
          onClick={onNewSale}
          className="w-full py-3.5 px-6 rounded-lg bg-brand-500 text-white font-semibold text-base hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 mb-4"
        >
          Nueva venta
        </button>

        {/* Footer */}
        <button
          onClick={onClose}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
