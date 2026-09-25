import { useState, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import type { CashRegister, Warehouse } from "../../../types";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (data: { register_id: number; opening_amount: number; notes?: string }) => void;
  registers: CashRegister[];
  warehouses: Warehouse[];
  loading: boolean;
}

export default function OpenSessionModal({ isOpen, onClose, onOpen, registers, warehouses, loading }: OpenSessionModalProps) {
  const [registerId, setRegisterId] = useState<number>(registers[0]?.id ?? 0);
  const [openingAmount, setOpeningAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onOpen({
      register_id: registerId,
      opening_amount: parseFloat(openingAmount),
      notes: notes || undefined,
    });
    setOpeningAmount("");
    setNotes("");
  };

  const handleClose = () => {
    setRegisterId(registers[0]?.id ?? 0);
    setOpeningAmount("");
    setNotes("");
    onClose();
  };

  const getWarehouseName = (warehouseId: number | null) => {
    if (!warehouseId) return "General";
    const w = warehouses.find((wh) => wh.id === warehouseId);
    return w?.name ?? "General";
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Abrir Caja
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registra el monto inicial para iniciar la sesion de caja.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {registers.length > 1 && (
            <div>
              <Label>
                Caja <span className="text-error-500">*</span>
              </Label>
              <Select
                options={registers.map((reg) => ({
                  value: reg.id.toString(),
                  label: `${reg.name} - ${getWarehouseName(reg.warehouse_id)}`,
                }))}
                defaultValue={registerId > 0 ? registerId.toString() : ""}
                onChange={(value) => setRegisterId(Number(value))}
                placeholder="Seleccionar caja..."
              />
            </div>
          )}

          <div>
            <Label>
              Fondo Inicial (Bs) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              step={0.01}
              min="0"
              placeholder="0.00"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Efectivo con el que inicias la jornada.
            </p>
          </div>

          <div>
            <Label>Observaciones</Label>
            <textarea
              className="w-full rounded-md border border-stroke bg-gray-50 p-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-strokedark dark:bg-meta-4 dark:text-white/90"
              rows={3}
              placeholder="Ej: Turno manana - Cajero Juan"
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
            disabled={loading || !openingAmount}
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
                Abriendo...
              </span>
            ) : (
              "Abrir Caja"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
