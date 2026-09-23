import { useState, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { useToast } from "../../context/ToastContext";
import { expenseService } from "../../services/expense.service";
import { warehouseService } from "../../services/warehouse.service";
import { getErrorMessage } from "../../utils/error";
import type { IncomeStatement, Warehouse } from "../../types";
import { useEffect } from "react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

export default function IncomeStatementPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statement, setStatement] = useState<IncomeStatement | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const monthRange = getMonthRange();
  const [fromDate, setFromDate] = useState(monthRange.from);
  const [toDate, setToDate] = useState(monthRange.to);
  const [warehouseId, setWarehouseId] = useState<number | "">("");

  useEffect(() => {
    warehouseService.getAll().then(setWarehouses).catch(() => {});
  }, []);

  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        from_date: fromDate,
        to_date: toDate,
      };
      if (warehouseId !== "") params.warehouse_id = warehouseId;
      const data = await expenseService.getIncomeStatement(params);
      setStatement(data);
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error, "Error al generar el estado de resultados.") });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, warehouseId, showToast]);

  return (
    <>
      <PageMeta title="Estado de Resultados - Paraiso Biker" description="Estado de resultados mensual y anual" />
      <PageBreadcrumb pageTitle="Estado de Resultados" />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <DatePicker
            mode="single"
            value={fromDate}
            onChange={(val) => setFromDate(val || "")}
            label="Desde"
            placeholder="YYYY-MM-DD"
          />
          <DatePicker
            mode="single"
            value={toDate}
            onChange={(val) => setToDate(val || "")}
            label="Hasta"
            placeholder="YYYY-MM-DD"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Almacen</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : "")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
            >
              <option value="">Todos (global)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={fetchStatement} disabled={loading}>
            {loading ? "Generando..." : "Generar"}
          </Button>
        </div>

        {/* Statement */}
        {statement ? (
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Estado de Resultados
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {statement.warehouse_name
                  ? `Almacen: ${statement.warehouse_name}`
                  : "Todos los almacenes (global)"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Periodo: {statement.period_start} al {statement.period_end}
              </p>
            </div>

            {/* INGRESOS */}
            <Section title="INGRESOS">
              <Row label="Ventas totales" value={statement.revenue} />
              <Row label="Costo de mercaderia vendida (CMV)" value={statement.cogs} />
              <Row
                label="UTILIDAD BRUTA"
                value={statement.gross_profit}
                bold
                highlight
                percent={statement.gross_margin_pct}
              />
            </Section>

            {/* GASTOS OPERACIONALES */}
            <Section title="GASTOS OPERACIONALES">
              {statement.expenses.length === 0 ? (
                <Row label="No hay gastos registrados en este periodo" value={0} muted />
              ) : (
                statement.expenses.map((exp) => (
                  <Row
                    key={exp.category_name}
                    label={exp.category_name}
                    value={exp.total}
                  />
                ))
              )}
              <Row
                label="Total gastos operacionales"
                value={statement.total_expenses}
                bold
              />
            </Section>

            {/* UTILIDAD NETA */}
            <div className="mt-4 border-t-2 border-gray-300 pt-4 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                  UTILIDAD NETA
                </span>
                <div className="text-right">
                  <span className={`text-lg font-bold ${statement.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(statement.net_profit)}
                  </span>
                  <span className={`ml-2 text-sm ${statement.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ({formatPercent(statement.net_margin_pct)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-stroke bg-white p-12 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Selecciona un período y haz clic en <strong>Generar</strong> para ver el estado de resultados.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
  percent,
  muted,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  percent?: number;
  muted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1 ${muted ? "text-gray-400" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold text-gray-800 dark:text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {percent !== undefined && (
          <span className={`text-sm ${highlight ? "font-semibold" : ""} ${value >= 0 ? "text-green-600" : "text-red-600"}`}>
            ({formatPercent(percent)})
          </span>
        )}
        <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${highlight ? "text-brand-500" : "text-gray-800 dark:text-white/90"}`}>
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
}
