import { EyeIcon } from "../../../icons";
import type { Column } from "../../../components/common/DataTable";
import type { Sale } from "../../../types";
import Button from "../../../components/ui/button/Button";

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

const statusLabels: Record<string, string> = {
  completed: "Completada",
  pending: "Pendiente",
  cancelled: "Cancelada",
};

const statusClasses: Record<string, string> = {
  completed:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  pending:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  cancelled:
    "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `Bs${num.toFixed(2)}`;
}

export function getSaleColumns(
  customerMap: Map<number, string>,
  userMap: Map<number, string>,
  onViewDetail: (sale: Sale) => void,
): Column<Sale>[] {
  return [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (sale) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{sale.id}
        </span>
      ),
    },
    {
      key: "sale_date",
      header: "Fecha",
      sortable: true,
      render: (sale) => <span>{formatDate(sale.sale_date)}</span>,
    },
    {
      key: "customer_id",
      header: "Cliente",
      sortable: false,
      render: (sale) => (
        <span>{customerMap.get(sale.customer_id) ?? "Cliente General"}</span>
      ),
    },
    {
      key: "user_id",
      header: "Vendedor",
      sortable: true,
      render: (sale) => (
        <span>{userMap.get(sale.user_id) ?? "Desconocido"}</span>
      ),
    },
    {
      key: "payment_method",
      header: "Método de pago",
      sortable: false,
      render: (sale) => (
        <span>{paymentLabels[sale.payment_method] ?? sale.payment_method}</span>
      ),
    },
    {
      key: "total_amount",
      header: "Total",
      sortable: true,
      render: (sale) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatCurrency(sale.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (sale) => {
        const label = statusLabels[sale.status] ?? sale.status;
        const cls =
          statusClasses[sale.status] ??
          "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Acciones",
      sortable: false,
      render: (sale) => (
        <Button
          variant="outline"
          size="sm"
          startIcon={<EyeIcon />}
          onClick={() => onViewDetail(sale)}
        >
          Ver
        </Button>
      ),
    },
  ];
}
