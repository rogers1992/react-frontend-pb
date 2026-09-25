import type { Column } from "../../../components/common/DataTable";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { EyeIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import type { Customer } from "../../../types";

function tierColor(tier: string): "primary" | "success" | "warning" | "info" | "light" {
  switch (tier.toLowerCase()) {
    case "gold":
      return "warning";
    case "silver":
      return "info";
    case "bronze":
      return "light";
    default:
      return "primary";
  }
}

function tierLabel(tier: string): string {
  switch (tier.toLowerCase()) {
    case "gold":
      return "Oro";
    case "silver":
      return "Plata";
    case "bronze":
      return "Bronce";
    default:
      return tier;
  }
}

interface CustomerTableProps {
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleActive: (customer: Customer) => void;
}

export function getCustomerColumns({
  onEdit,
  onView,
  onDelete,
  onToggleActive,
}: CustomerTableProps): Column<Customer>[] {
  return [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (item: Customer) => (
        <div className={`flex items-center gap-3 ${item.is_active === 0 ? "opacity-50" : ""}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
            {item.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <span className="block font-medium text-gray-800 dark:text-white/90">
              {item.first_name} {item.last_name}
            </span>
            {item.email ? (
              <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {item.email}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telefono",
      render: (item: Customer) => item.phone || "—",
    },
    {
      key: "loyalty",
      header: "Lealtad",
      sortable: true,
      render: (item: Customer) => {
        if (!item.loyalty) return "—";
        return (
          <div className="flex items-center gap-2">
            <Badge size="sm" color={tierColor(item.loyalty.tier)}>
              {tierLabel(item.loyalty.tier)}
            </Badge>
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              {item.loyalty.points} pts
            </span>
          </div>
        );
      },
    },
    {
      key: "is_active",
      header: "Estado",
      sortable: true,
      render: (item: Customer) => (
        <Badge size="sm" color={item.is_active === 1 ? "success" : "error"}>
          {item.is_active === 1 ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Creado",
      sortable: true,
      // ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone
      render: (item: Customer) =>
        new Date(item.created_at).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      header: "",
      className: "w-32",
      render: (item: Customer) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="!p-1.5"
            onClick={() => onView(item)}
          >
            <EyeIcon />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!p-1.5"
            onClick={() => onEdit(item)}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!p-1.5"
            onClick={() => onToggleActive(item)}
          >
            {item.is_active === 1 ? (
              <svg className="size-4 text-error-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            ) : (
              <svg className="size-4 text-success-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!p-1.5"
            onClick={() => onDelete(item)}
          >
            <TrashBinIcon />
          </Button>
        </div>
      ),
    },
  ];
}
