import type { Column } from "../../../components/common/DataTable";
import Badge from "../../../components/ui/badge/Badge";
import InventoryActions from "./InventoryActions";
import type { InventoryItem } from "../../../types";

export function getInventoryColumns(
  productMap: Map<number, { name: string; sku?: string }>,
  warehouseMap: Map<number, string>,
  onEdit: (item: InventoryItem) => void,
  onTransfer: (item: InventoryItem) => void,
  onDelete: (item: InventoryItem) => void,
): Column<InventoryItem>[] {
  return [
    {
      key: "product",
      header: "Producto",
      sortable: true,
      render: (item: InventoryItem) => {
        const product = productMap.get(item.product_id);
        return (
          <span className="font-medium text-gray-800 dark:text-white/90">
            {product?.name || `Producto #${item.product_id}`}
          </span>
        );
      },
    },
    {
      key: "sku",
      header: "SKU",
      render: (item: InventoryItem) => {
        const product = productMap.get(item.product_id);
        return product?.sku || "—";
      },
    },
    {
      key: "warehouse",
      header: "Almacén",
      sortable: true,
      render: (item: InventoryItem) =>
        warehouseMap.get(item.warehouse_id) || `Almacén #${item.warehouse_id}`,
    },
    {
      key: "quantity",
      header: "Cantidad",
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {item.quantity}
        </span>
      ),
    },
    {
      key: "reserved",
      header: "Reservado",
      render: (item: InventoryItem) => (
        <span className="text-gray-500 dark:text-gray-400">
          {item.reserved_quantity}
        </span>
      ),
    },
    {
      key: "available",
      header: "Disponible",
      sortable: true,
      render: (item: InventoryItem) => {
        const available = item.quantity - item.reserved_quantity;
        return (
          <span
            className={
              available <= 0
                ? "text-error-500 font-semibold"
                : "text-success-600 font-semibold"
            }
          >
            {available}
          </span>
        );
      },
    },
    {
      key: "stock_levels",
      header: "Stock Min/Max",
      render: (item: InventoryItem) => (
        <span className="text-gray-500 dark:text-gray-400">
          {item.min_stock_level ?? 0} / {item.max_stock_level ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (item: InventoryItem) => {
        const isLow = item.quantity <= (item.min_stock_level ?? 0);
        return (
          <Badge size="sm" color={isLow ? "error" : "success"}>
            {isLow ? "Stock Bajo" : "Normal"}
          </Badge>
        );
      },
    },
    {
      key: "location",
      header: "Ubicación",
      render: (item: InventoryItem) => item.location || "—",
    },
    {
      key: "actions",
      header: "",
      className: "w-28",
      render: (item: InventoryItem) => (
        <InventoryActions
          item={item}
          onEdit={onEdit}
          onTransfer={onTransfer}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
