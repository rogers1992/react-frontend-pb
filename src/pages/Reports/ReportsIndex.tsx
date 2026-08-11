import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { DownloadIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/error";
import { reportsService } from "../../services/reports.service";
import { downloadBlob } from "../../utils/download";
import type {
  Column,
} from "../../components/common/DataTable";
import type {
  ABCReportRow,
  CustomerReportRow,
  InventoryReportRow,
  ProductReportRow,
  ProfitReportRow,
  PurchaseReportRow,
  ReportType,
  SalesReportRow,
  SellerReportRow,
  SlowMovingReportRow,
} from "../../types";
import {
  getABCReportColumns,
  getCustomersReportColumns,
  getInventoryReportColumns,
  getProductsReportColumns,
  getProfitReportColumns,
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
  | ABCReportRow
  | SlowMovingReportRow
  | SellerReportRow;

export default function ReportsIndex() {
  const { showToast } = useToast();
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

  const setTab = (key: ReportType) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    setSearchParams(next, { replace: true });
  };

  const columns: Column<AnyRow>[] = getColumnsFor(activeTab);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let rows: AnyRow[];
      switch (activeTab) {
        case "sales":
          rows = await reportsService.getSales({
            from,
            to,
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
          rows = await reportsService.getProfit({ from, to });
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
      }
      setData(rows);
    } catch (err) {
      const message = getErrorMessage(err, "Error al cargar el reporte.");
      showToast({ type: "error", message });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to, statusFilter, thresholdDays, showToast]);

  useEffect(() => {
    setStatusFilter("");
  }, [activeTab]);

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
      } = { from, to };
      if (activeTab === "purchases" && statusFilter) {
        params.status = statusFilter;
      }
      if (activeTab === "slow-moving") {
        params.threshold_days = thresholdDays;
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
    "abc",
    "sellers",
  ].includes(activeTab);
  const showStatusFilter = ["purchases"].includes(activeTab);
  const showThresholdFilter = ["slow-moving"].includes(activeTab);

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
      {(showDateFilters || showStatusFilter || showThresholdFilter) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
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
  }
}