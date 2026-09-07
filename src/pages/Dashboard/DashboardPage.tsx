import { useCallback, useEffect, useState, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import WarehouseMultiSelect from "../../components/common/WarehouseMultiSelect";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";
import { warehouseService } from "../../services/warehouse.service";
import { dashboardService } from "../../services/dashboard.service";
import type {
  DashboardSummary,
  InventoryStatusSummary,
  PaymentMethodRow,
  SalesTrendPoint,
  TopProductRow,
  Warehouse,
} from "../../types";
import { AlertIcon, DollarLineIcon } from "../../icons";
import SalesTrendChart from "./components/SalesTrendChart";
import PaymentMethodsChart from "./components/PaymentMethodsChart";
import TopProductsChart from "./components/TopProductsChart";

function formatCurrency(value: number | null | undefined): string {
  const num =
    value === null || value === undefined
      ? 0
      : typeof value === "string"
        ? parseFloat(value as unknown as string)
        : value;
  return `Bs ${Number(num).toFixed(2)}`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("es-MX");
}

function KpiTile({
  label,
  value,
  hint,
  icon,
  accent = "text-brand-500",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {hint}
            </p>
          )}
        </div>
        {icon && <span className={accent}>{icon}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([]);
  const [inventoryStatus, setInventoryStatus] =
    useState<InventoryStatusSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);
  const warehousesLoadedRef = useRef(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;
    const warehouseParams = { warehouse_ids: selectedWarehouseIds };

    try {
      setLoading(true);
      setError(false);
      const [summaryData, trendData, paymentData, productsData, inventoryData] =
        await Promise.all([
          dashboardService.getSummary({ warehouse_ids: selectedWarehouseIds, signal }),
          dashboardService.getSalesTrend("daily", warehouseParams, signal),
          dashboardService.getPaymentMethods(warehouseParams, signal),
          dashboardService.getTopProducts(warehouseParams, 10, signal),
          dashboardService.getInventoryStatus(signal),
        ]);
      setSummary(summaryData);
      setTrend(trendData);
      setPaymentMethods(paymentData);
      setTopProducts(productsData);
      setInventoryStatus(inventoryData);
    } catch (err) {
      if (signal.aborted) return;
      const message = getErrorMessage(
        err,
        "Error al cargar el panel analítico.",
      );
      showToast({ type: "error", message });
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouseIds, showToast]);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const all = await warehouseService.getAll(0, 100);
        const userWarehouseIds = user?.warehouse_ids;
        const filtered =
          userWarehouseIds && userWarehouseIds.length > 0
            ? all.filter((w) => userWarehouseIds.includes(w.id))
            : all;
        setWarehouses(filtered);
        setSelectedWarehouseIds(filtered.map((w) => w.id));
        warehousesLoadedRef.current = true;
      } catch {
        // If fetch fails, leave empty — dashboard will still load
      }
    };
    loadWarehouses();
  }, [user]);

  useEffect(() => {
    if (!warehousesLoadedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAll();
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchAll]);

  const handleRefresh = () => fetchAll();

  return (
    <>
      <PageMeta
        title="Analíticas | Paraiso Biker"
        description="Panel analítico - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Analíticas" />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:max-w-[180px]">
            <WarehouseMultiSelect
              warehouses={warehouses}
              selectedIds={selectedWarehouseIds}
              onChange={setSelectedWarehouseIds}
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error && !loading && !summary ? (
        <ComponentCard title="Error" desc="No se pudo cargar el panel.">
          <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Hubo un problema al obtener los datos. Verifica tu conexión e
            intenta nuevamente con el botón Actualizar.
          </div>
        </ComponentCard>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label="Ingresos (hoy)"
              value={loading ? "—" : formatCurrency(summary?.revenue_today)}
              hint={`${summary?.sales_count_today ?? 0} ventas`}
              icon={<DollarLineIcon className="size-6" />}
            />
            <KpiTile
              label="Ingresos (mes)"
              value={loading ? "—" : formatCurrency(summary?.revenue_month)}
              hint={`Semana: ${formatCurrency(summary?.revenue_week)}`}
            />
            <KpiTile
              label="Ticket promedio"
              value={loading ? "—" : formatCurrency(summary?.avg_ticket)}
              hint={`${summary?.sales_count_month ?? 0} ventas este mes`}
            />
            <KpiTile
              label="IVA (mes)"
              value={loading ? "—" : formatCurrency(summary?.tax_collected_month)}
              hint="Impuesto cobrado"
            />
          </div>

          {/* Gross profit tiles */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <KpiTile
              label="Ganancia (hoy)"
              value={loading ? "—" : formatCurrency(summary?.gross_profit_today)}
              hint={summary?.margin_pct_month != null && summary?.gross_profit_today != null
                ? `Margen mes: ${Number(summary.margin_pct_month).toFixed(1)}%`
                : ""}
              accent={
                (summary?.gross_profit_today ?? 0) < 0
                  ? "text-error-500"
                  : "text-success-500"
              }
            />
            <KpiTile
              label="Ganancia (mes)"
              value={loading ? "—" : formatCurrency(summary?.gross_profit_month)}
              hint={summary?.cogs_month != null
                ? `COGS: ${formatCurrency(summary.cogs_month)}`
                : ""}
              accent={
                (summary?.gross_profit_month ?? 0) < 0
                  ? "text-error-500"
                  : "text-success-500"
              }
            />
          </div>

          {/* Operational tiles */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label="Productos activos"
              value={loading ? "—" : formatNumber(summary?.active_products)}
            />
            <KpiTile
              label="Clientes activos"
              value={loading ? "—" : formatNumber(summary?.active_customers)}
            />
            <KpiTile
              label="Compras pendientes"
              value={loading ? "—" : formatNumber(summary?.pending_po_count)}
            />
            <KpiTile
              label="Alertas de stock bajo"
              value={loading ? "—" : formatNumber(summary?.low_stock_count)}
              icon={<AlertIcon className="size-6" />}
              accent={
                (summary?.low_stock_count ?? 0) > 0
                  ? "text-warning-500"
                  : "text-brand-500"
              }
            />
          </div>

          {/* Charts row 1 */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ComponentCard
                title="Tendencia de ingresos"
                desc="Agrupación: diaria"
              >
                {loading ? (
                  <div className="flex h-[310px] items-center justify-center text-sm text-gray-400">
                    Cargando...
                  </div>
                ) : (
                  <SalesTrendChart data={trend} />
                )}
              </ComponentCard>
            </div>
            <div className="lg:col-span-4">
              <ComponentCard
                title="Métodos de pago"
                desc="Distribución de ventas"
              >
                {loading ? (
                  <div className="flex h-[310px] items-center justify-center text-sm text-gray-400">
                    Cargando...
                  </div>
                ) : (
                  <PaymentMethodsChart data={paymentMethods} />
                )}
              </ComponentCard>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ComponentCard
                title="Top productos"
                desc="Top 10 productos por ingresos"
              >
                {loading ? (
                  <div className="flex h-[360px] items-center justify-center text-sm text-gray-400">
                    Cargando...
                  </div>
                ) : (
                  <TopProductsChart data={topProducts} />
                )}
              </ComponentCard>
            </div>

            <div className="lg:col-span-5">
              <ComponentCard
                title="Stock bajo"
                desc={
                  inventoryStatus
                    ? `${inventoryStatus.low_stock_count} productos en alerta`
                    : ""
                }
              >
                {loading ? (
                  <div className="flex h-[320px] items-center justify-center text-sm text-gray-400">
                    Cargando...
                  </div>
                ) : (inventoryStatus?.low_stock_items ?? []).length === 0 ? (
                  <div className="flex h-[320px] items-center justify-center text-sm text-gray-400">
                    No hay alertas de stock bajo.
                  </div>
                ) : (
                  <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {(inventoryStatus?.low_stock_items ?? []).map((item) => (
                      <li
                        key={`${item.product_id}-${item.warehouse_id}`}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.warehouse_name} · SKU: {item.sku ?? "—"}
                          </p>
                        </div>
                        <div className="ml-2 shrink-0 text-right">
                          <p
                            className={`text-sm font-semibold ${
                              item.is_out_of_stock
                                ? "text-error-500"
                                : "text-warning-500"
                            }`}
                          >
                            {item.quantity} u.
                          </p>
                          <p className="text-xs text-gray-400">
                            min: {item.min_stock_level}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ComponentCard>
            </div>
          </div>
        </>
      )}
    </>
  );
}