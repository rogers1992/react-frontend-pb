import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable, { type Column } from "../../components/common/DataTable";
import { TableRow, TableCell } from "../../components/ui/table";
import DatePicker from "../../components/form/date-picker";
import WarehouseMultiSelect from "../../components/common/WarehouseMultiSelect";
import Button from "../../components/ui/button/Button";
import { DownloadIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";
import { reportsService } from "../../services/reports.service";
import { warehouseService } from "../../services/warehouse.service";
import { downloadBlob } from "../../utils/download";
import type {
  ABCReportRow,
  CustomerReportRow,
  InventoryReportRow,
  ProductReportRow,
  ProfitReportRow,
  ProfitSummaryRow,
  PurchaseReportRow,
  ReportType,
  SalesReportRow,
  SellerReportRow,
  SlowMovingReportRow,
  Warehouse,
} from "../../types";
import {
  getABCReportColumns,
  getCustomersReportColumns,
  getInventoryReportColumns,
  getProductsReportColumns,
  getProfitReportColumns,
  getProfitSummaryColumns,
  getPurchasesReportColumns,
  getSalesReportColumns,
  getSellersReportColumns,
  getSlowMovingReportColumns,
} from "./components/columns";
import ABCInfoPanel from "./components/ABCInfoPanel";

const TABS: { key: ReportType; label: string }[] = [
  { key: "sales", label: "Ventas" },
  { key: "inventory", label: "Inventario" },
  { key: "purchases", label: "Compras" },
  { key: "customers", label: "Clientes" },
  { key: "products", label: "Productos" },
  { key: "profit", label: "Rentabilidad" },
  { key: "profit-summary", label: "Ganancia" },
  { key: "abc", label: "ABC" },
  { key: "slow-moving", label: "Lento" },
  { key: "sellers", label: "Vendedores" },
];

const VALID_TABS = TABS.map((t) => t.key);

const downloadableFilenames: Record<ReportType, string> = {
  sales: "reporte_ventas.csv",
  inventory: "reporte_inventario.csv",
  purchases: "reporte_compras.csv",
  customers: "reporte_clientes.csv",
  products: "reporte_productos.csv",
  profit: "reporte_rentabilidad.csv",
  "profit-summary": "reporte_resumen_ganancia.csv",
  abc: "reporte_abc.csv",
  "slow-moving": "reporte_lento.csv",
  sellers: "reporte_vendedores.csv",
};

type AnyRow =
  | SalesReportRow
  | InventoryReportRow
  | PurchaseReportRow
  | CustomerReportRow
  | ProductReportRow
  | ProfitReportRow
  | ProfitSummaryRow
  | ABCReportRow
  | SlowMovingReportRow
  | SellerReportRow;

type ReportTotals =
  | {
      type: "sales";
      units_sold: number;
      subtotal: number;
      tax_amount: number;
      total_amount: number;
    }
  | {
      type: "purchases";
      items_count: number;
      units_ordered: number;
      total_amount: number;
    }
  | {
      type: "profit";
      units_sold: number;
      revenue: number;
      cogs: number;
      gross_profit: number;
      margin_pct: number;
    }
  | {
      type: "sellers";
      sales_count: number;
      units_sold: number;
      revenue: number;
      tax_collected: number;
    }
  | {
      type: "profit-summary";
      sales_count: number;
      revenue: number;
      cogs: number;
      gross_profit: number;
      margin_pct: number;
    }
  | null;

export default function ReportsIndex() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get("tab") ?? "sales") as ReportType;
  const activeTab: ReportType = VALID_TABS.includes(initialTab)
    ? initialTab
    : "sales";

  const [data, setData] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Shared date range filters (only applies to sales / purchases / products / profit / abc / sellers)
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  // Optional extra filters for sales/purchases tabs
  const [statusFilter, setStatusFilter] = useState<string>("");
  // Slow-moving inventory threshold (days)
  const [thresholdDays, setThresholdDays] = useState<number>(90);
  // Profit summary period
  const [summaryPeriod, setSummaryPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  // Warehouse filter
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);

  const setTab = (key: ReportType) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    setSearchParams(next, { replace: true });
  };

  const columns: Column<AnyRow>[] = getColumnsFor(activeTab);

  // Compute totals from the full dataset (not paginated)
  const totals = useMemo((): ReportTotals => {
    if (!data.length) return null;

    switch (activeTab) {
      case "sales": {
        const rows = data as SalesReportRow[];
        return {
          type: "sales",
          units_sold: rows.reduce((s, r) => s + r.units_sold, 0),
          subtotal: rows.reduce((s, r) => s + Number(r.subtotal), 0),
          tax_amount: rows.reduce((s, r) => s + Number(r.tax_amount), 0),
          total_amount: rows.reduce((s, r) => s + Number(r.total_amount), 0),
        };
      }
      case "purchases": {
        const rows = data as PurchaseReportRow[];
        return {
          type: "purchases",
          items_count: rows.reduce((s, r) => s + r.items_count, 0),
          units_ordered: rows.reduce((s, r) => s + r.units_ordered, 0),
          total_amount: rows.reduce((s, r) => s + Number(r.total_amount), 0),
        };
      }
      case "profit": {
        const rows = data as ProfitReportRow[];
        const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
        const totalCogs = rows.reduce((s, r) => s + Number(r.cogs), 0);
        const totalProfit = totalRevenue - totalCogs;
        return {
          type: "profit",
          units_sold: rows.reduce((s, r) => s + r.units_sold, 0),
          revenue: totalRevenue,
          cogs: totalCogs,
          gross_profit: totalProfit,
          margin_pct: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        };
      }
      case "sellers": {
        const rows = data as SellerReportRow[];
        return {
          type: "sellers",
          sales_count: rows.reduce((s, r) => s + r.sales_count, 0),
          units_sold: rows.reduce((s, r) => s + r.units_sold, 0),
          revenue: rows.reduce((s, r) => s + Number(r.revenue), 0),
          tax_collected: rows.reduce((s, r) => s + Number(r.tax_collected), 0),
        };
      }
      case "profit-summary": {
        const rows = data as ProfitSummaryRow[];
        const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
        const totalCogs = rows.reduce((s, r) => s + Number(r.cogs), 0);
        const totalProfit = totalRevenue - totalCogs;
        return {
          type: "profit-summary",
          sales_count: rows.reduce((s, r) => s + r.sales_count, 0),
          revenue: totalRevenue,
          cogs: totalCogs,
          gross_profit: totalProfit,
          margin_pct: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        };
      }
      default:
        return null;
    }
  }, [activeTab, data]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let rows: AnyRow[];
      switch (activeTab) {
        case "sales":
          rows = await reportsService.getSales({
            from,
            to,
            ...(selectedWarehouseIds.length > 0 && selectedWarehouseIds.length < warehouses.length
              ? { warehouse_id: selectedWarehouseIds }
              : {}),
          });
          break;
        case "inventory":
          rows = await reportsService.getInventory();
          break;
        case "purchases":
          rows = await reportsService.getPurchases({
            from,
            to,
            ...(statusFilter ? { status: statusFilter } : {}),
          });
          break;
        case "customers":
          rows = await reportsService.getCustomers();
          break;
        case "products":
          rows = await reportsService.getProducts({ from, to });
          break;
        case "profit":
          rows = await reportsService.getProfit({
            from,
            to,
            ...(selectedWarehouseIds.length > 0 && selectedWarehouseIds.length < warehouses.length
              ? { warehouse_id: selectedWarehouseIds }
              : {}),
          });
          break;
        case "abc":
          rows = await reportsService.getABC({ from, to });
          break;
        case "slow-moving":
          rows = await reportsService.getSlowMoving(thresholdDays);
          break;
        case "sellers":
          rows = await reportsService.getSellers({ from, to });
          break;
        case "profit-summary":
          rows = await reportsService.getProfitSummary({
            period: summaryPeriod,
            from,
            to,
            ...(selectedWarehouseIds.length > 0 && selectedWarehouseIds.length < warehouses.length
              ? { warehouse_id: selectedWarehouseIds }
              : {}),
          });
          break;
      }
      setData(rows);
    } catch (err) {
      const message = getErrorMessage(err, "Error al cargar el reporte.");
      showToast({ type: "error", message });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    from,
    to,
    statusFilter,
    thresholdDays,
    summaryPeriod,
    selectedWarehouseIds,
    warehouses.length,
    showToast,
  ]);

  useEffect(() => {
    setStatusFilter("");
  }, [activeTab]);

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
      } catch {
        // If fetch fails, leave empty — reports will still load
      }
    };
    loadWarehouses();
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: {
        from?: string;
        to?: string;
        status?: string;
        threshold_days?: number;
        warehouse_id?: number[];
      } = { from, to };
      if (activeTab === "purchases" && statusFilter) {
        params.status = statusFilter;
      }
      if (activeTab === "slow-moving") {
        params.threshold_days = thresholdDays;
      }
      if (
        ["sales", "profit", "profit-summary"].includes(activeTab) &&
        selectedWarehouseIds.length > 0 &&
        selectedWarehouseIds.length < warehouses.length
      ) {
        params.warehouse_id = selectedWarehouseIds;
      }
      const blob = await reportsService.exportCsv(activeTab, params);
      downloadBlob(blob, downloadableFilenames[activeTab]);
      showToast({
        type: "success",
        message: "Reporte exportado correctamente.",
      });
    } catch (err) {
      const message = getErrorMessage(err, "Error al exportar el reporte.");
      showToast({ type: "error", message });
    } finally {
      setExporting(false);
    }
  };

  const showDateFilters = [
    "sales",
    "purchases",
    "products",
    "profit",
    "profit-summary",
    "abc",
    "sellers",
  ].includes(activeTab);
  const showWarehouseFilter = ["sales", "profit", "profit-summary"].includes(activeTab);
  const showStatusFilter = ["purchases"].includes(activeTab);
  const showThresholdFilter = ["slow-moving"].includes(activeTab);
  const showSummaryPeriodFilter = ["profit-summary"].includes(activeTab);

  return (
    <>
      <PageMeta
        title="Reportes | Paraiso Biker"
        description="Reportes - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Reportes" />

      {/* Tab bar */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters row */}
      {(showDateFilters ||
        showWarehouseFilter ||
        showStatusFilter ||
        showThresholdFilter ||
        showSummaryPeriodFilter) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            {showWarehouseFilter && (
              <div className="sm:max-w-[180px]">
                <WarehouseMultiSelect
                  warehouses={warehouses}
                  selectedIds={selectedWarehouseIds}
                  onChange={setSelectedWarehouseIds}
                />
              </div>
            )}
            {showDateFilters && (
              <>
                <div className="sm:max-w-[200px]">
                  <DatePicker
                    mode="single"
                    value={from}
                    onChange={(val) => setFrom(val || undefined)}
                    label="Desde"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="sm:max-w-[200px]">
                  <DatePicker
                    mode="single"
                    value={to}
                    onChange={(val) => setTo(val || undefined)}
                    label="Hasta"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </>
            )}
            {showThresholdFilter && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Días sin ventas
                </label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={thresholdDays}
                  onChange={(e) =>
                    setThresholdDays(
                      Math.max(1, Math.min(3650, Number(e.target.value) || 90)),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:w-[180px]"
                />
              </div>
            )}
            {showStatusFilter && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:w-[180px]"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="received">Recibida</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            )}
            {showSummaryPeriodFilter && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Período
                </label>
                <div className="flex rounded-lg border border-gray-300 p-1 dark:border-gray-700">
                  {(["daily", "weekly", "monthly"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSummaryPeriod(p)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        summaryPeriod === p
                          ? "bg-brand-500 text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      {p === "daily"
                        ? "Diario"
                        : p === "weekly"
                          ? "Semanal"
                          : "Mensual"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "abc" && <ABCInfoPanel />}

      <DataTable<AnyRow>
        columns={columns}
        data={data}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar..."
        emptyMessage="No se encontraron registros."
        actions={
          <Button
            size="sm"
            variant="outline"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={exporting || loading || data.length === 0}
          >
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
        }
        footer={
          totals ? (
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-bold text-gray-800 dark:text-white/90"
              >
                Total
              </TableCell>
              {renderTotalCells(activeTab, totals, columns.length)}
            </TableRow>
          ) : undefined
        }
      />
    </>
  );
}

function getColumnsFor(tab: ReportType): Column<AnyRow>[] {
  switch (tab) {
    case "sales":
      return getSalesReportColumns() as Column<AnyRow>[];
    case "inventory":
      return getInventoryReportColumns() as Column<AnyRow>[];
    case "purchases":
      return getPurchasesReportColumns() as Column<AnyRow>[];
    case "customers":
      return getCustomersReportColumns() as Column<AnyRow>[];
    case "products":
      return getProductsReportColumns() as Column<AnyRow>[];
    case "profit":
      return getProfitReportColumns() as Column<AnyRow>[];
    case "abc":
      return getABCReportColumns() as Column<AnyRow>[];
    case "slow-moving":
      return getSlowMovingReportColumns() as Column<AnyRow>[];
    case "sellers":
      return getSellersReportColumns() as Column<AnyRow>[];
    case "profit-summary":
      return getProfitSummaryColumns() as Column<AnyRow>[];
  }
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `Bs ${Number(value).toFixed(2)}`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("es-MX");
}

function renderTotalCells(
  tab: ReportType,
  totals: ReportTotals,
  _colCount: number,
): ReactNode[] {
  const cells: ReactNode[] = [];

  switch (tab) {
    case "sales": {
      if (totals?.type !== "sales") return [];
      // Columns: ID(1), Fecha(2), Cliente(3), Vendedor(4), Pago(5), Unidades(6), Subtotal(7), IVA(8), Total(9), Estado(10)
      cells.push(
        <TableCell key="empty" colSpan={5}>
          <span />
        </TableCell>,
      ); // skip Fecha, Cliente, Vendedor, Almacén, Pago
      cells.push(
        <TableCell
          key="units"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.units_sold)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="subtotal"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.subtotal)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="tax"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.tax_amount)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell key="total" className="px-5 py-3 font-bold text-brand-500">
          <span>{formatCurrency(totals.total_amount)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell key="status">
          <span />
        </TableCell>,
      );
      break;
    }
    case "purchases": {
      if (totals?.type !== "purchases") return [];
      // Columns: ID(1), Fecha(2), Proveedor(3), Almacén(4), Items(5), Unidades(6), Total(7), Estado(8)
      cells.push(
        <TableCell key="empty" colSpan={3}>
          <span />
        </TableCell>,
      ); // skip Fecha, Proveedor, Almacén
      cells.push(
        <TableCell
          key="items"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.items_count)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="units"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.units_ordered)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell key="total" className="px-5 py-3 font-bold text-brand-500">
          <span>{formatCurrency(totals.total_amount)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell key="status">
          <span />
        </TableCell>,
      );
      break;
    }
    case "profit": {
      if (totals?.type !== "profit") return [];
      // Columns: ID(1), Producto(2), SKU(3), Unidades(4), Ingresos(5), Costo(6), Ganancia(7), Margen%(8)
      cells.push(
        <TableCell key="empty" colSpan={2}>
          <span />
        </TableCell>,
      ); // skip Producto, SKU
      cells.push(
        <TableCell
          key="units"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.units_sold)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="revenue"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.revenue)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="cogs"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.cogs)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="profit"
          className={`px-5 py-3 font-bold ${
            totals.gross_profit < 0
              ? "text-error-600 dark:text-error-500"
              : "text-success-600 dark:text-success-500"
          }`}
        >
          <span>{formatCurrency(totals.gross_profit)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="margin"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{totals.margin_pct.toFixed(1)}%</span>
        </TableCell>,
      );
      break;
    }
    case "sellers": {
      if (totals?.type !== "sellers") return [];
      // Columns: ID(1), Vendedor(2), Rol(3), # Ventas(4), Unidades(5), Ingresos(6), Ticket Prom.(7), IVA Recaudado(8)
      cells.push(
        <TableCell key="empty" colSpan={2}>
          <span />
        </TableCell>,
      ); // skip Vendedor, Rol
      cells.push(
        <TableCell
          key="sales_count"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.sales_count)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="units"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.units_sold)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell key="revenue" className="px-5 py-3 font-bold text-brand-500">
          <span>{formatCurrency(totals.revenue)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell key="empty2">
          <span />
        </TableCell>,
      ); // skip Ticket Prom.
      cells.push(
        <TableCell
          key="tax"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.tax_collected)}</span>
        </TableCell>,
      );
      break;
    }
    case "profit-summary": {
      if (totals?.type !== "profit-summary") return [];
      // Columns: Periodo(1), # Ventas(2), Ingresos(3), Costo(4), Ganancia(5), Margen%(6)
      cells.push(
        <TableCell
          key="sales_count"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatNumber(totals.sales_count)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="revenue"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.revenue)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="cogs"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{formatCurrency(totals.cogs)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="profit"
          className={`px-5 py-3 font-bold ${
            totals.gross_profit < 0
              ? "text-error-600 dark:text-error-500"
              : "text-success-600 dark:text-success-500"
          }`}
        >
          <span>{formatCurrency(totals.gross_profit)}</span>
        </TableCell>,
      );
      cells.push(
        <TableCell
          key="margin"
          className="px-5 py-3 font-semibold text-gray-800 dark:text-white/90"
        >
          <span>{totals.margin_pct.toFixed(1)}%</span>
        </TableCell>,
      );
      break;
    }
    default:
      cells.push(
        <TableCell key="empty" colSpan={_colCount - 1}>
          <span />
        </TableCell>,
      );
  }

  return cells;
}
