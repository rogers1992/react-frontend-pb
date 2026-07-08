import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import SearchableSelect from "./SearchableSelect";
import type {
  InventoryItem,
  InventoryItemCreate,
  InventoryItemUpdate,
  Product,
  Warehouse,
} from "../../../types";

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryItemCreate | InventoryItemUpdate) => void;
  item?: InventoryItem | null;
  products: Product[];
  warehouses: Warehouse[];
  loading?: boolean;
}

export default function InventoryForm({
  isOpen,
  onClose,
  onSubmit,
  item,
  products,
  warehouses,
  loading = false,
}: InventoryFormProps) {
  const isEditing = !!item;

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minStockLevel, setMinStockLevel] = useState("");
  const [maxStockLevel, setMaxStockLevel] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (item) {
      setProductId(String(item.product_id));
      setWarehouseId(String(item.warehouse_id));
      setQuantity(String(item.quantity));
      setMinStockLevel(item.min_stock_level ? String(item.min_stock_level) : "");
      setMaxStockLevel(item.max_stock_level ? String(item.max_stock_level) : "");
      setLocation(item.location ?? "");
    } else {
      setProductId("");
      setWarehouseId("");
      setQuantity("0");
      setMinStockLevel("");
      setMaxStockLevel("");
      setLocation("");
    }
  }, [item, isOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: InventoryItemCreate = {
      product_id: parseInt(productId),
      warehouse_id: parseInt(warehouseId),
      quantity: parseInt(quantity) || 0,
      min_stock_level: minStockLevel ? parseInt(minStockLevel) : undefined,
      max_stock_level: maxStockLevel ? parseInt(maxStockLevel) : undefined,
      location: location || undefined,
    };

    if (isEditing) {
      const updatePayload: InventoryItemUpdate = {
        quantity: parseInt(quantity) || 0,
        min_stock_level: minStockLevel ? parseInt(minStockLevel) : undefined,
        max_stock_level: maxStockLevel ? parseInt(maxStockLevel) : undefined,
        location: location || undefined,
      };
      onSubmit(updatePayload);
    } else {
      onSubmit(payload);
    }
  };

  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: p.name,
    searchText: `${p.name} ${p.sku ?? ""} ${p.barcode ?? ""}`.trim(),
  }));

  const warehouseOptions = warehouses.map((w) => ({
    value: String(w.id),
    label: w.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? "Editar Inventario" : "Nuevo Registro de Inventario"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing
            ? "Actualiza la informacion del inventario."
            : "Completa los campos para crear un nuevo registro de inventario."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                Producto <span className="text-error-500">*</span>
              </Label>
              <SearchableSelect
                options={productOptions}
                value={productId}
                onChange={setProductId}
                placeholder="Seleccionar producto"
                searchPlaceholder="Buscar por nombre, SKU o código..."
                noResultsText="Sin productos coincidentes"
                disabled={loading}
              />
            </div>
            <div>
              <Label>
                Almacén <span className="text-error-500">*</span>
              </Label>
              <Select
                options={warehouseOptions}
                placeholder="Seleccionar almacén"
                onChange={setWarehouseId}
                defaultValue={warehouseId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <Label>
                Cantidad <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label>Stock Mínimo</Label>
              <Input
                type="number"
                placeholder="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                min="0"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Stock Máximo</Label>
              <Input
                type="number"
                placeholder="Sin límite"
                value={maxStockLevel}
                onChange={(e) => setMaxStockLevel(e.target.value)}
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Ubicación</Label>
            <Input
              type="text"
              placeholder="Ej: Estante A-3, Pasillo 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={
              loading ||
              !productId ||
              !warehouseId ||
              (isEditing ? false : !quantity)
            }
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </span>
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
