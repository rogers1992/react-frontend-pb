import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";
import { warehouseService } from "../../services/warehouse.service";
import { dashboardService } from "../../services/dashboard.service";
import { cajaService } from "../../services/caja.service";
import type {
  DashboardSummary,
  PaymentMethodRow,
  SalesTrendPoint,
  TopProductRow,
  Warehouse,
} from "../../types";
import { AlertIcon, BoxIcon, CashRegisterIcon } from "../../icons";
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
  return `Bs ${Number(num).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasOpenSession, setHasOpenSession] = useState(false);

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
      const [summaryData, trendData, paymentData, productsData] =
        await Promise.all([
          dashboardService.getSummary({ warehouse_ids: selectedWarehouseIds, signal }),
          dashboardService.getSalesTrend("daily", warehouseParams, signal),
          dashboardService.getPaymentMethods(warehouseParams, signal),
          dashboardService.getTopProducts(warehouseParams, 10, signal),
        ]);
      setSummary(summaryData);
      setTrend(trendData);
      setPaymentMethods(paymentData);
      setTopProducts(productsData);
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
        setSelectedWarehouseIds([]);
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

  // Check for open cash session
  useEffect(() => {
    const checkSession = async () => {
      try {
        await cajaService.getCurrentSession();
        setHasOpenSession(true);
      } catch {
        setHasOpenSession(false);
      }
    };
    checkSession();
  }, []);

  const pendingPoCount = summary?.pending_po_count ?? 0;
  const lowStockCount = summary?.low_stock_count ?? 0;

  return (
    <>
      <PageMeta
        title="Analíticas | Paraiso Biker"
        description="Panel analítico - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Analíticas" />

      {/* Header with warehouse pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedWarehouseIds([])}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border-2 transition ${
              selectedWarehouseIds.length === 0
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
            }`}
          >
            Todos
          </button>
          {warehouses.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                if (selectedWarehouseIds.includes(w.id)) {
                  setSelectedWarehouseIds(selectedWarehouseIds.filter((id) => id !== w.id));
                } else {
                  setSelectedWarehouseIds([...selectedWarehouseIds, w.id]);
                }
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border-2 transition ${
                selectedWarehouseIds.includes(w.id)
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>

      {error && !loading && !summary ? (
        <ComponentCard title="Error" desc="No se pudo cargar el panel.">
          <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Hubo un problema al obtener los datos. Verifica tu conexión e
            intenta nuevamente.
          </div>
        </ComponentCard>
      ) : (
        <>
          {/* KPI Row: 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            {/* Hero card */}
            <div className="rounded-2xl bg-brand-500 p-6 text-white lg:col-span-5">
              <p className="text-sm opacity-90">
                Ventas de hoy · {summary?.sales_count_today ?? 0} ventas
              </p>
              <p className="text-4xl font-bold mt-2">
                {loading ? "—" : formatCurrency(summary?.revenue_today)}
              </p>
              <p className="text-sm opacity-90 mt-3">
                Ganancia {loading ? "—" : formatCurrency(summary?.gross_profit_today)}
              </p>
            </div>

            {/* Ventas del mes */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ventas del mes</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">
                {loading ? "—" : formatCurrency(summary?.revenue_month)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {summary?.sales_count_month ?? 0} ventas · Ticket {loading ? "—" : formatCurrency(summary?.avg_ticket)}
              </p>
            </div>

            {/* Ganancia del mes */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ganancia del mes</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">
                {loading ? "—" : formatCurrency(summary?.gross_profit_month)}
              </p>
              <p className={`text-xs mt-2 ${
                (summary?.margin_pct_month ?? 0) >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                Margen {summary?.margin_pct_month != null ? Number(summary.margin_pct_month).toFixed(1) : "0"}%
              </p>
            </div>
          </div>

          {/* Requiere atención - full width */}
          {(lowStockCount > 0 || pendingPoCount > 0 || hasOpenSession) && (
            <div className="mb-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Requiere atención
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockCount > 0 && (
                    <button
                      onClick={() => navigate("/inventory?status=stock_bajo")}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 transition text-left"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                        <AlertIcon className="size-5 text-red-500" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white/90 truncate">
                          {lowStockCount} con stock bajo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Revisa antes de reponer
                        </p>
                      </div>
                      <span className="text-sm font-medium text-brand-500 shrink-0">Ver →</span>
                    </button>
                  )}

                  {pendingPoCount > 0 && (
                    <button
                      onClick={() => navigate("/purchases")}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 transition text-left"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                        <BoxIcon className="size-5 text-blue-500" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white/90 truncate">
                          {pendingPoCount} compra{pendingPoCount !== 1 ? "s" : ""} pendiente{pendingPoCount !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Órdenes por recibir
                        </p>
                      </div>
                      <span className="text-sm font-medium text-brand-500 shrink-0">Ver →</span>
                    </button>
                  )}

                  {hasOpenSession && (
                    <button
                      onClick={() => navigate("/caja")}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 transition text-left"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                        <CashRegisterIcon className="size-5 text-amber-500" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white/90 truncate">
                          Caja abierta
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Cierra al terminar el turno
                        </p>
                      </div>
                      <span className="text-sm font-medium text-brand-500 shrink-0">Cerrar →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-7">
              <ComponentCard
                title="Ventas, últimos 14 días"
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
            <div className="lg:col-span-5">
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

          {/* Top Products Chart */}
          <div className="mb-6">
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
        </>
      )}
    </>
  );
}
