import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable, { type Column } from "../../components/common/DataTable";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import DatePicker from "../../components/form/date-picker";
import ExpenseForm from "./components/ExpenseForm";
import { PlusIcon, TrashBinIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { expenseService } from "../../services/expense.service";
import { warehouseService } from "../../services/warehouse.service";
import { getErrorMessage } from "../../utils/error";
import type { Expense, ExpenseCategory, Warehouse } from "../../types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExpenseIndex() {
  const { showToast } = useToast();
  const { hasRole } = usePermissions();
  const canCreate = hasRole("admin") || hasRole("gerente");
  const canDelete = hasRole("admin");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<number | "">("");
  const [filterWarehouse, setFilterWarehouse] = useState<number | "">("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = { limit: 500 };
      if (filterCategory !== "") params.category_id = filterCategory;
      if (filterWarehouse !== "") params.warehouse_id = filterWarehouse;
      if (filterFrom) params.from_date = filterFrom;
      if (filterTo) params.to_date = filterTo;

      const [expenseData, catData, whData] = await Promise.all([
        expenseService.getExpenses(params),
        expenseService.getCategories(),
        warehouseService.getAll(),
      ]);
      setExpenses(expenseData);
      setCategories(catData);
      setWarehouses(whData);
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error, "Error al cargar gastos.") });
    } finally {
      setLoading(false);
    }
  }, [showToast, filterCategory, filterWarehouse, filterFrom, filterTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await expenseService.deleteExpense(deleteTarget.id);
      showToast({ type: "success", message: "Gasto eliminado exitosamente." });
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error, "Error al eliminar el gasto.") });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Expense>[] = [
    { key: "expense_date", header: "Fecha", sortable: true, render: (r) => formatDate(r.expense_date) },
    { key: "category_name", header: "Categoría", sortable: true, render: (r) => r.category_name ?? "—" },
    { key: "warehouse_name", header: "Almacén", render: (r) => r.warehouse_name ?? "Global" },
    { key: "description", header: "Descripción", render: (r) => r.description ?? "—" },
    { key: "amount", header: "Monto", sortable: true, className: "text-right", render: (r) => formatCurrency(r.amount) },
    { key: "payment_method", header: "Método Pago", render: (r) => (
      <Badge variant="light" color={r.payment_method === "efectivo" ? "success" : "info"}>
        {r.payment_method === "efectivo" ? "Efectivo" : "Transferencia"}
      </Badge>
    )},
    { key: "recorded_by_name", header: "Registrado por", render: (r) => r.recorded_by_name ?? "—" },
  ];

  if (canDelete) {
    columns.push({
      key: "actions",
      header: "",
      className: "w-12",
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          title="Eliminar"
          aria-label="Eliminar gasto"
        >
          <TrashBinIcon className="h-5 w-5" />
        </button>
      ),
    });
  }

  return (
    <>
      <PageMeta title="Gastos Operacionales - Paraiso Biker" description="Gestión de gastos operacionales del negocio" />
      <PageBreadcrumb pageTitle="Gastos Operacionales" />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : "")}
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value ? Number(e.target.value) : "")}
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20"
          >
            <option value="">Todos los almacenes</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <DatePicker
            mode="single"
            value={filterFrom}
            onChange={(val) => setFilterFrom(val || "")}
            label="Desde"
            placeholder="YYYY-MM-DD"
          />
          <DatePicker
            mode="single"
            value={filterTo}
            onChange={(val) => setFilterTo(val || "")}
            label="Hasta"
            placeholder="YYYY-MM-DD"
          />
        </div>

        <DataTable
          columns={columns}
          data={expenses}
          loading={loading}
          emptyMessage="No se encontraron gastos."
          actions={
            canCreate ? (
              <Button
                size="sm"
                onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Nuevo Gasto
              </Button>
            ) : undefined
          }
          onRowClick={canCreate ? (r) => { setEditingExpense(r); setIsFormOpen(true); } : undefined}
          renderFooter={(filteredData) => (
            <tr>
              <td colSpan={4} className="px-5 py-3 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                Total:
              </td>
              <td className="px-5 py-3 text-right text-sm font-bold text-gray-800 dark:text-white/90">
                {formatCurrency(filteredData.reduce((sum, r) => sum + (Number(r.amount) || 0), 0))}
              </td>
              <td colSpan={columns.length - 5} />
            </tr>
          )}
        />
      </div>

      {/* Create/Edit Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingExpense(null); }}
        onSaved={async () => { setIsFormOpen(false); setEditingExpense(null); await fetchData(); }}
        expense={editingExpense}
        categories={categories}
        warehouses={warehouses}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Eliminar Gasto
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          ¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
