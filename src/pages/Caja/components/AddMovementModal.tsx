import { useState, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import type { CashMovementCreate } from "../../../types";

interface AddMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CashMovementCreate) => void;
  loading: boolean;
  sessionId?: number;
}

export default function AddMovementModal({ isOpen, onClose, onAdd, loading, sessionId }: AddMovementModalProps) {
  const [type, setType] = useState<"ingreso" | "egreso">("ingreso");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAdd({
      type,
      amount: parseFloat(amount),
      reason,
      notes: notes || undefined,
      session_id: sessionId,
    });
    setAmount("");
    setReason("");
    setNotes("");
  };

  const handleClose = () => {
    setType("ingreso");
    setAmount("");
    setReason("");
    setNotes("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Nuevo Movimiento de Caja
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registra un ingreso o egreso de efectivo.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label>Tipo de Movimiento</Label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="movement-type"
                  value="ingreso"
                  checked={type === "ingreso"}
                  onChange={() => setType("ingreso")}
                  className="h-4 w-4 text-brand-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ingreso</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="movement-type"
                  value="egreso"
                  checked={type === "egreso"}
                  onChange={() => setType("egreso")}
                  className="h-4 w-4 text-brand-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Egreso</span>
              </label>
            </div>
          </div>

          <div>
            <Label>
              Monto (Bs) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              step={0.01}
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>
              Motivo <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Ej: Retiro para cambio, Pago de servicio..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Observaciones</Label>
            <textarea
              className="w-full rounded-md border border-stroke bg-gray-50 p-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-strokedark dark:bg-meta-4 dark:text-white/90"
              rows={3}
              placeholder="Detalles adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
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
            disabled={loading || !amount || !reason}
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
                Guardando...
              </span>
            ) : (
              "Registrar Movimiento"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
