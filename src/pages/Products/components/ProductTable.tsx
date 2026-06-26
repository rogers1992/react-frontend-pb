import type { Column } from "../../../components/common/DataTable";
import Badge from "../../../components/ui/badge/Badge";
import ProductActions from "./ProductActions";
import type { Product, Category } from "../../../types";

export function getProductColumns(
  categories: Category[],
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
): Column<Product>[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (item: Product) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {item.name}
        </span>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (item: Product) => item.sku || "—",
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
        const price = typeof item.unit_price === "string" ? parseFloat(item.unit_price) : item.unit_price;
        return `$${price.toFixed(2)}`;
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
        <ProductActions product={item} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}
