import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import { useToast } from "../../../context/ToastContext";
import { expenseService } from "../../../services/expense.service";
import { getErrorMessage } from "../../../utils/error";
import type { Expense, ExpenseCreate, ExpenseCategory, Warehouse } from "../../../types";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  expense?: Expense | null;
  categories: ExpenseCategory[];
  warehouses: Warehouse[];
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSaved,
  expense,
  categories,
  warehouses,
}: ExpenseFormProps) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState("");

  const isEditing = !!expense;

  useEffect(() => {
    if (expense) {
      setCategoryId(String(expense.category_id));
      setWarehouseId(expense.warehouse_id ? String(expense.warehouse_id) : "");
      setAmount(String(expense.amount));
      setDescription(expense.description ?? "");
      setExpenseDate(expense.expense_date ? expense.expense_date.slice(0, 10) : "");
      setPaymentMethod(expense.payment_method);
      setIsRecurring(expense.is_recurring);
      setNotes(expense.notes ?? "");
    } else {
      setCategoryId("");
      setWarehouseId("");
      setAmount("");
      setDescription("");
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod("efectivo");
      setIsRecurring(false);
      setNotes("");
    }
  }, [expense, isOpen]);

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const warehouseOptions = [
    { value: "", label: "Global (todos los almacenes)" },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
  ];

  const paymentOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) {
      showToast({ type: "error", message: "Completa los campos obligatorios." });
      return;
    }

    try {
      setSubmitting(true);
      const payload: ExpenseCreate = {
        category_id: parseInt(categoryId),
        warehouse_id: warehouseId ? parseInt(warehouseId) : null,
        amount: parseFloat(amount),
        description: description || null,
        expense_date: expenseDate ? `${expenseDate}T00:00:00` : null,
        payment_method: paymentMethod,
        is_recurring: isRecurring,
        notes: notes || null,
      };

      if (isEditing) {
        await expenseService.updateExpense(expense.id, payload);
        showToast({ type: "success", message: "Gasto actualizado exitosamente." });
      } else {
        await expenseService.createExpense(payload);
        showToast({ type: "success", message: "Gasto registrado exitosamente." });
      }
      onSaved();
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error, "Error al guardar el gasto.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing ? "Modifica los datos del gasto." : "Registra un gasto operacional."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label>
              Categoria <span className="text-error-500">*</span>
            </Label>
            <Select
              options={categoryOptions}
              placeholder="Seleccionar categoria"
              onChange={setCategoryId}
              defaultValue={categoryId}
            />
          </div>

          <div>
            <Label>Almacen</Label>
            <Select
              options={warehouseOptions}
              placeholder="Seleccionar almacen"
              onChange={setWarehouseId}
              defaultValue={warehouseId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Monto (Bs) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Fecha</Label>
              <DatePicker
                mode="single"
                value={expenseDate}
                onChange={(val) => setExpenseDate(val || "")}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          <div>
            <Label>Descripcion</Label>
            <Input
              type="text"
              placeholder="Ej: Pago de alquiler septiembre"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Metodo de pago</Label>
              <Select
                options={paymentOptions}
                onChange={setPaymentMethod}
                defaultValue={paymentMethod}
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                disabled={submitting}
              />
              <Label htmlFor="isRecurring" className="mb-0 cursor-pointer">
                Gasto recurrente (mensual)
              </Label>
            </div>
          </div>

          <div>
            <Label>Notas</Label>
            <textarea
              className="w-full rounded-md border border-stroke bg-gray-50 p-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-strokedark dark:bg-meta-4 dark:text-white/90"
              rows={2}
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? "Guardando..." : isEditing ? "Actualizar" : "Registrar Gasto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
