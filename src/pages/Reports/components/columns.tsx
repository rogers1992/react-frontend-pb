import type { Column } from "../../../components/common/DataTable";
import type {
  ABCReportRow,
  CustomerReportRow,
  InventoryReportRow,
  ProductReportRow,
  ProfitReportRow,
  PurchaseReportRow,
  SalesReportRow,
  SellerReportRow,
  SlowMovingReportRow,
} from "../../../types";

// --- Local formatters (matching the SalesTable / PurchaseHistory idiom) ---

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `Bs ${Number(num).toFixed(2)}`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("es-MX");
}

// --- Status badge maps (shared across reports) ---

const saleStatusLabels: Record<string, string> = {
  completed: "Completada",
  pending: "Pendiente",
  cancelled: "Cancelada",
};

const saleStatusClasses: Record<string, string> = {
  completed:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  pending:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  cancelled:
    "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
};

const purchaseStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  received: "Recibida",
  cancelled: "Cancelada",
};

const purchaseStatusClasses: Record<string, string> = {
  pending:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  received:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  cancelled:
    "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
};

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

function StatusBadge({
  status,
  labels,
  classes,
}: {
  status: string;
  labels: Record<string, string>;
  classes: Record<string, string>;
}) {
  const label = labels[status] ?? status;
  const cls =
    classes[status] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// --- Column factories ---

export function getSalesReportColumns(): Column<SalesReportRow>[] {
  return [
    {
      key: "sale_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.sale_id}
        </span>
      ),
    },
    {
      key: "sale_date",
      header: "Fecha",
      sortable: true,
      render: (r) => <span>{formatDate(r.sale_date)}</span>,
    },
    {
      key: "customer_name",
      header: "Cliente",
      sortable: true,
      render: (r) => <span>{r.customer_name ?? "Cliente General"}</span>,
    },
    {
      key: "seller_name",
      header: "Vendedor",
      sortable: false,
      render: (r) => <span>{r.seller_name ?? "Desconocido"}</span>,
    },
    {
      key: "payment_method",
      header: "Pago",
      sortable: false,
      render: (r) => (
        <span>{paymentLabels[r.payment_method] ?? r.payment_method}</span>
      ),
    },
    {
      key: "units_sold",
      header: "Unidades",
      sortable: true,
      render: (r) => <span>{formatNumber(r.units_sold)}</span>,
    },
    {
      key: "subtotal",
      header: "Subtotal",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.subtotal)}</span>,
    },
    {
      key: "tax_amount",
      header: "IVA",
      sortable: false,
      render: (r) => <span>{formatCurrency(r.tax_amount)}</span>,
    },
    {
      key: "total_amount",
      header: "Total",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (r) => (
        <StatusBadge
          status={r.status}
          labels={saleStatusLabels}
          classes={saleStatusClasses}
        />
      ),
    },
  ];
}

export function getInventoryReportColumns(): Column<InventoryReportRow>[] {
  return [
    {
      key: "product_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.product_id}
        </span>
      ),
    },
    {
      key: "name",
      header: "Producto",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {r.name}
        </span>
      ),
    },
    { key: "sku", header: "SKU", sortable: true, render: (r) => r.sku ?? "—" },
    {
      key: "category_name",
      header: "Categoría",
      sortable: true,
      render: (r) => r.category_name ?? "—",
    },
    {
      key: "warehouse_name",
      header: "Almacén",
      sortable: true,
      render: (r) => r.warehouse_name,
    },
    {
      key: "quantity",
      header: "Cantidad",
      sortable: true,
      render: (r) => <span>{formatNumber(r.quantity)}</span>,
    },
    {
      key: "min_stock_level",
      header: "Mín.",
      sortable: true,
      render: (r) => <span>{formatNumber(r.min_stock_level)}</span>,
    },
    {
      key: "unit_price",
      header: "Precio",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.unit_price)}</span>,
    },
    {
      key: "stock_value",
      header: "Valor",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.stock_value)}
        </span>
      ),
    },
    {
      key: "unit_cost",
      header: "Costo Unit.",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.unit_cost)}</span>,
    },
    {
      key: "stock_value_at_cost",
      header: "Valor al Costo",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.stock_value_at_cost)}
        </span>
      ),
    },
    {
      key: "is_low_stock",
      header: "Estado",
      sortable: false,
      render: (r) => {
        if (r.is_out_of_stock) {
          return (
            <span className="inline-flex items-center rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
              Agotado
            </span>
          );
        }
        if (r.is_low_stock) {
          return (
            <span className="inline-flex items-center rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">
              Bajo
            </span>
          );
        }
        return (
          <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            OK
          </span>
        );
      },
    },
  ];
}

export function getPurchasesReportColumns(): Column<PurchaseReportRow>[] {
  return [
    {
      key: "order_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.order_id}
        </span>
      ),
    },
    {
      key: "order_date",
      header: "Fecha",
      sortable: true,
      render: (r) => <span>{formatDate(r.order_date)}</span>,
    },
    {
      key: "supplier_name",
      header: "Proveedor",
      sortable: true,
      render: (r) => r.supplier_name ?? "—",
    },
    {
      key: "warehouse_name",
      header: "Almacén",
      sortable: false,
      render: (r) => r.warehouse_name ?? "—",
    },
    {
      key: "items_count",
      header: "Items",
      sortable: true,
      render: (r) => <span>{formatNumber(r.items_count)}</span>,
    },
    {
      key: "units_ordered",
      header: "Unidades",
      sortable: true,
      render: (r) => <span>{formatNumber(r.units_ordered)}</span>,
    },
    {
      key: "total_amount",
      header: "Total",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (r) => (
        <StatusBadge
          status={r.status}
          labels={purchaseStatusLabels}
          classes={purchaseStatusClasses}
        />
      ),
    },
  ];
}

export function getCustomersReportColumns(): Column<CustomerReportRow>[] {
  return [
    {
      key: "customer_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.customer_id}
        </span>
      ),
    },
    { key: "name", header: "Nombre", sortable: true, render: (r) => r.name },
    { key: "email", header: "Email", sortable: false, render: (r) => r.email ?? "—" },
    { key: "phone", header: "Teléfono", sortable: false, render: (r) => r.phone ?? "—" },
    {
      key: "loyalty_tier",
      header: "Nivel",
      sortable: false,
      render: (r) =>
        r.loyalty_tier ? (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 capitalize dark:bg-brand-500/15 dark:text-brand-500">
            {r.loyalty_tier}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "orders",
      header: "Pedidos",
      sortable: true,
      render: (r) => <span>{formatNumber(r.orders)}</span>,
    },
    {
      key: "total_spent",
      header: "Gastado",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.total_spent)}
        </span>
      ),
    },
    {
      key: "last_sale_date",
      header: "Última compra",
      sortable: true,
      render: (r) => <span>{formatDateOnly(r.last_sale_date)}</span>,
    },
  ];
}

export function getProductsReportColumns(): Column<ProductReportRow>[] {
  return [
    {
      key: "product_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.product_id}
        </span>
      ),
    },
    {
      key: "name",
      header: "Producto",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {r.name}
        </span>
      ),
    },
    { key: "sku", header: "SKU", sortable: true, render: (r) => r.sku ?? "—" },
    {
      key: "category_name",
      header: "Categoría",
      sortable: true,
      render: (r) => r.category_name ?? "—",
    },
    {
      key: "unit_price",
      header: "Precio",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.unit_price)}</span>,
    },
    {
      key: "is_active",
      header: "Activo",
      sortable: false,
      render: (r) =>
        r.is_active ? (
          <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            No
          </span>
        ),
    },
    {
      key: "units_sold",
      header: "Vendido",
      sortable: true,
      render: (r) => <span>{formatNumber(r.units_sold)}</span>,
    },
    {
      key: "revenue",
      header: "Ingresos",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.revenue)}
        </span>
      ),
    },
    {
      key: "stock_quantity",
      header: "Stock",
      sortable: true,
      render: (r) => <span>{formatNumber(r.stock_quantity)}</span>,
    },
  ];
}

export function getProfitReportColumns(): Column<ProfitReportRow>[] {
  return [
    {
      key: "product_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.product_id}
        </span>
      ),
    },
    {
      key: "name",
      header: "Producto",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {r.name}
        </span>
      ),
    },
    { key: "sku", header: "SKU", sortable: true, render: (r) => r.sku ?? "—" },
    {
      key: "units_sold",
      header: "Unidades",
      sortable: true,
      render: (r) => <span>{formatNumber(r.units_sold)}</span>,
    },
    {
      key: "revenue",
      header: "Ingresos",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.revenue)}</span>,
    },
    {
      key: "cogs",
      header: "Costo (COGS)",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.cogs)}</span>,
    },
    {
      key: "gross_profit",
      header: "Ganancia Bruta",
      sortable: true,
      render: (r) => (
        <span
          className={
            r.gross_profit < 0
              ? "text-error-600 dark:text-error-500"
              : "text-success-600 dark:text-success-500"
          }
        >
          {formatCurrency(r.gross_profit)}
        </span>
      ),
    },
    {
      key: "margin_pct",
      header: "Margen %",
      sortable: true,
      render: (r) => {
        const cls =
          r.margin_pct < 0
            ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
            : r.margin_pct >= 30
              ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
          >
            {Number(r.margin_pct).toFixed(1)}%
          </span>
        );
      },
    },
  ];
}

export function getABCReportColumns(): Column<ABCReportRow>[] {
  const classStyles: Record<"A" | "B" | "C", string> = {
    A: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    B: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
    C: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };
  return [
    {
      key: "product_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.product_id}
        </span>
      ),
    },
    {
      key: "name",
      header: "Producto",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {r.name}
        </span>
      ),
    },
    { key: "sku", header: "SKU", sortable: true, render: (r) => r.sku ?? "—" },
    {
      key: "revenue",
      header: "Ingresos",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.revenue)}
        </span>
      ),
    },
    {
      key: "revenue_pct",
      header: "% Ingresos",
      sortable: true,
      render: (r) => <span>{Number(r.revenue_pct).toFixed(1)}%</span>,
    },
    {
      key: "cumulative_pct",
      header: "% Acumulado",
      sortable: true,
      render: (r) => <span>{Number(r.cumulative_pct).toFixed(1)}%</span>,
    },
    {
      key: "abc_class",
      header: "Clase",
      sortable: true,
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classStyles[r.abc_class]}`}
        >
          {r.abc_class}
        </span>
      ),
    },
    {
      key: "units_sold",
      header: "Unidades",
      sortable: true,
      render: (r) => <span>{formatNumber(r.units_sold)}</span>,
    },
  ];
}

export function getSlowMovingReportColumns(): Column<SlowMovingReportRow>[] {
  return [
    {
      key: "product_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.product_id}
        </span>
      ),
    },
    {
      key: "name",
      header: "Producto",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {r.name}
        </span>
      ),
    },
    { key: "sku", header: "SKU", sortable: true, render: (r) => r.sku ?? "—" },
    {
      key: "category_name",
      header: "Categoría",
      sortable: true,
      render: (r) => r.category_name ?? "—",
    },
    {
      key: "warehouse_name",
      header: "Almacén",
      sortable: true,
      render: (r) => r.warehouse_name,
    },
    {
      key: "quantity",
      header: "Cantidad",
      sortable: true,
      render: (r) => <span>{formatNumber(r.quantity)}</span>,
    },
    {
      key: "last_sale_date",
      header: "Última Venta",
      sortable: true,
      render: (r) => <span>{formatDateOnly(r.last_sale_date)}</span>,
    },
    {
      key: "days_since_last_sale",
      header: "Días Sin Vender",
      sortable: true,
      render: (r) => {
        if (r.days_since_last_sale === null || r.days_since_last_sale === undefined) {
          return (
            <span className="inline-flex items-center rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
              Sin ventas
            </span>
          );
        }
        const cls =
          r.days_since_last_sale >= 180
            ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
            : "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
          >
            {formatNumber(r.days_since_last_sale)}
          </span>
        );
      },
    },
    {
      key: "stock_value",
      header: "Valor",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.stock_value)}
        </span>
      ),
    },
  ];
}

export function getSellersReportColumns(): Column<SellerReportRow>[] {
  return [
    {
      key: "seller_id",
      header: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{r.seller_id}
        </span>
      ),
    },
    {
      key: "seller_name",
      header: "Vendedor",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {r.seller_name}
        </span>
      ),
    },
    {
      key: "role_name",
      header: "Rol",
      sortable: false,
      render: (r) => r.role_name ?? "—",
    },
    {
      key: "sales_count",
      header: "# Ventas",
      sortable: true,
      render: (r) => <span>{formatNumber(r.sales_count)}</span>,
    },
    {
      key: "units_sold",
      header: "Unidades",
      sortable: true,
      render: (r) => <span>{formatNumber(r.units_sold)}</span>,
    },
    {
      key: "revenue",
      header: "Ingresos",
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(r.revenue)}
        </span>
      ),
    },
    {
      key: "avg_ticket",
      header: "Ticket Prom.",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.avg_ticket)}</span>,
    },
    {
      key: "tax_collected",
      header: "IVA Recaudado",
      sortable: true,
      render: (r) => <span>{formatCurrency(r.tax_collected)}</span>,
    },
  ];
}