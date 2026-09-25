import { useState, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import type { CashSession } from "../../../types";

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseSession: (data: { closing_amount: number; notes?: string }) => void;
  session: CashSession;
  loading: boolean;
}

export default function CloseSessionModal({ isOpen, onClose, onCloseSession, session, loading }: CloseSessionModalProps) {
  const [closingAmount, setClosingAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setClosingAmount("");
    setNotes("");
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCloseSession({
      closing_amount: parseFloat(closingAmount),
      notes: notes || undefined,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(amount);
  };

  const expectedAmount = session.expected_amount ?? 0;
  const actualAmount = closingAmount ? parseFloat(closingAmount) : 0;
  const discrepancy = actualAmount - expectedAmount;

  const getDiscrepancyColor = () => {
    if (discrepancy === 0) return "text-green-600";
    if (discrepancy > 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getDiscrepancyLabel = () => {
    if (discrepancy === 0) return "Todo cuadra";
    if (discrepancy > 0) return `Sobrante: +${formatCurrency(discrepancy)}`;
    return `Faltante: ${formatCurrency(discrepancy)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Cerrar Caja
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa el dinero real en caja para realizar el arqueo.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Resumen de la sesion
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fondo inicial:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {formatCurrency(session.opening_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ventas en efectivo:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {formatCurrency(session.cash_sales_total)}
                </span>
              </div>
              <div className="flex justify-between border-t border-stroke pt-2 dark:border-strokedark">
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  Efectivo esperado:
                </span>
                <span className="font-bold text-brand-500">
                  {formatCurrency(expectedAmount)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>
              Dinero real en caja (Bs) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              step={0.01}
              min="0"
              placeholder="0.00"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {closingAmount && (
            <div className="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Diferencia:
                </span>
                <span className={`text-lg font-bold ${getDiscrepancyColor()}`}>
                  {getDiscrepancyLabel()}
                </span>
              </div>
            </div>
          )}

          <div>
            <Label>Observaciones</Label>
            <textarea
              className="w-full rounded-md border border-stroke bg-gray-50 p-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-strokedark dark:bg-meta-4 dark:text-white/90"
              rows={3}
              placeholder="Notas adicionales sobre el cierre..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="rounded-sm border border-warning-200 bg-warning-50 p-3 dark:border-warning-800 dark:bg-warning-900/20">
            <p className="text-sm text-warning-700 dark:text-warning-400">
              <strong>Atencion:</strong> Esta accion no se puede deshacer. Una vez cerrada la caja, no se podran registrar mas movimientos.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading || !closingAmount}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cerrando...
              </span>
            ) : (
              "Cerrar Caja"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
