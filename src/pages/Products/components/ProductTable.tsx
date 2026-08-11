import type { Column } from "../../../components/common/DataTable";
import Badge from "../../../components/ui/badge/Badge";
import ProductActions from "./ProductActions";
import { resolveImageUrl } from "../../../services/api";
import type { Product, Category } from "../../../types";

function ProductThumbnail({ product }: { product: Product }) {
  const url = resolveImageUrl(product.image_url);
  if (url) {
    return (
      <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-lg dark:border-gray-800">
        <img
          src={url}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  // Placeholder with the first initial (BasicTableOne-style avatar).
  const initial = product.name?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
      {initial}
    </div>
  );
}

export function getProductColumns(
  categories: Category[],
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
): Column<Product>[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return [
    {
      key: "name",
      header: "Producto",
      sortable: true,
      render: (item: Product) => (
        <div className="flex items-center gap-3">
          <ProductThumbnail product={item} />
          <div className="min-w-0">
            <span className="block font-medium text-gray-800 dark:text-white/90">
              {item.name}
            </span>
            {item.description ? (
              <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">
                {item.description}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (item: Product) => (
        <span className="font-mono text-xs">{item.sku}</span>
      ),
    },
    {
      key: "barcode",
      header: "Codigo de Barras",
      render: (item: Product) => item.barcode || "—",
    },
    {
      key: "category_id",
      header: "Categoria",
      render: (item: Product) => categoryMap.get(item.category_id) || "—",
    },
    {
      key: "unit_price",
      header: "Precio Unitario",
      sortable: true,
      render: (item: Product) => {
        const price =
          typeof item.unit_price === "string"
            ? parseFloat(item.unit_price)
            : item.unit_price;
        return `Bs${price.toFixed(2)}`;
      },
    },
    {
      key: "current_cost",
      header: "Costo Actual",
      sortable: true,
      render: (item: Product) => {
        if (item.current_cost === null || item.current_cost === undefined) return "—";
        const cost = typeof item.current_cost === "string" ? parseFloat(item.current_cost) : item.current_cost;
        return `Bs${cost.toFixed(2)}`;
      },
    },
    {
      key: "margin",
      header: "Margen %",
      sortable: true,
      render: (item: Product) => {
        if (item.current_cost === null || item.current_cost === undefined || item.current_cost === 0) return "—";
        const cost = typeof item.current_cost === "string" ? parseFloat(item.current_cost) : item.current_cost;
        const price = typeof item.unit_price === "string" ? parseFloat(item.unit_price) : item.unit_price;
        const margin = ((price - cost) / price) * 100;
        const cls =
          margin < 0
            ? "text-error-600 dark:text-error-500"
            : margin >= 30
              ? "text-success-600 dark:text-success-500"
              : "text-gray-600 dark:text-gray-400";
        return <span className={cls}>{margin.toFixed(1)}%</span>;
      },
    },
    {
      key: "is_active",
      header: "Estado",
      render: (item: Product) => (
        <Badge size="sm" color={item.is_active ? "success" : "error"}>
          {item.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Product) => (
        <ProductActions
          product={item}
          onEdit={onEdit}
          onDelete={onDelete}
          hideDelete={!item.is_active}
        />
      ),
    },
  ];
}
