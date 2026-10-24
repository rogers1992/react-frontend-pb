import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { CheckCircleIcon, ChatIcon, DownloadIcon } from "../../../icons";
import { generateReceiptPdf } from "../../../utils/receiptPdf";
import type { Sale } from "../../../types";

interface ReceiptModalProps {
  isOpen: boolean;
  sales: Sale[];
  customerName: string;
  sellerName: string;
  onClose: () => void;
  onNewSale: () => void;
}

export default function ReceiptModal({
  isOpen,
  sales,
  customerName,
  sellerName,
  onClose,
  onNewSale,
}: ReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || sales.length === 0) return null;

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

  const getSaleTotal = (sale: Sale) =>
    typeof sale.total_amount === "string" ? parseFloat(sale.total_amount) : sale.total_amount;

  const grandTotal = sales.reduce((sum, sale) => sum + getSaleTotal(sale), 0);

  const paymentLabels: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    tarjeta: "Tarjeta",
  };

  const handleDownloadPdf = async () => {
    if (sales.length === 0) return;
    setDownloading(true);
    try {
      for (const sale of sales) {
        const blob = await generateReceiptPdf(sale, customerName, sellerName);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `nota_venta_${sale.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 1000));
      }
    } finally {
      setDownloading(false);
    }
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
          {sales.length === 1 ? "Venta registrada" : `${sales.length} Ventas registradas`}
        </h3>

        {/* Big total */}
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Bs {grandTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {sales.length > 1 && (
          <p className="text-xs text-gray-400 mb-4">(Total combinado)</p>
        )}

        {/* Per-sale cards */}
        <div className="w-full space-y-2 mb-6">
          {sales.map((sale) => {
            const total = getSaleTotal(sale);
            return (
              <div
                key={sale.id}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    #{sale.id} — {paymentLabels[sale.payment_method] ?? sale.payment_method}
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                    Bs {total.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {formatDate(sale.sale_date)} &middot; {sale.warehouse_name || "Tienda Principal"} &middot; {sale.items.length} producto{sale.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>

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
            disabled={downloading}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            <DownloadIcon className="size-5" />
            <span className="text-xs font-medium">{downloading ? "Generando..." : "PDF"}</span>
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
