import type { Column } from "../../../components/common/DataTable";
import Badge from "../../../components/ui/badge/Badge";
import InventoryActions from "./InventoryActions";
import { resolveImageUrl } from "../../../services/api";
import type { InventoryItem, Product } from "../../../types";

function ProductThumbnail({ product }: { product: Product }) {
  const url = resolveImageUrl(product.image_url);
  if (url) {
    return (
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          src={url}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  const initial = product.name?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
      {initial}
    </div>
  );
}

export function getInventoryColumns(
  products: Product[],
  warehouseMap: Map<number, string>,
  onEdit: (item: InventoryItem) => void,
  onTransfer: (item: InventoryItem) => void,
  onDelete: (item: InventoryItem) => void,
): Column<InventoryItem>[] {
  const productMap = new Map(products.map((p) => [p.id, p]));

  return [
    {
      key: "product",
      header: "Producto",
      sortable: true,
      render: (item: InventoryItem) => {
        const product = productMap.get(item.product_id);
        if (!product) {
          return (
            <span className="font-medium text-gray-800 dark:text-white/90">
              Producto #{item.product_id}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-3">
            <ProductThumbnail product={product} />
            <span className="font-medium text-gray-800 dark:text-white/90">
              {product.name}
            </span>
          </div>
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
