import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import type { InventoryItem, Product, Warehouse, InventoryTransferRequest } from "../../../types";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (data: InventoryTransferRequest) => void;
  item?: InventoryItem | null;
  products: Product[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  loading?: boolean;
}

export default function TransferModal({
  isOpen,
  onClose,
  onTransfer,
  item,
  products,
  warehouses,
  inventory,
  loading = false,
}: TransferModalProps) {
  const [productId, setProductId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [availableQty, setAvailableQty] = useState(0);
  const [hasStockRecord, setHasStockRecord] = useState(true);

  useEffect(() => {
    if (item) {
      setProductId(String(item.product_id));
      setFromWarehouseId(String(item.warehouse_id));
    } else {
      setProductId("");
      setFromWarehouseId("");
    }
    setToWarehouseId("");
    setQuantity("");
  }, [item, isOpen]);

  useEffect(() => {
    if (productId && fromWarehouseId) {
      const found = inventory.find(
        (inv) =>
          String(inv.product_id) === productId &&
          String(inv.warehouse_id) === fromWarehouseId,
      );
      if (found) {
        setAvailableQty(found.quantity - found.reserved_quantity);
        setHasStockRecord(true);
      } else {
        setAvailableQty(0);
        setHasStockRecord(false);
      }
    } else {
      setAvailableQty(0);
      setHasStockRecord(true);
    }
  }, [productId, fromWarehouseId, inventory]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const qty = parseInt(quantity);
    if (qty > availableQty) {
      return;
    }

    const payload: InventoryTransferRequest = {
      product_id: parseInt(productId),
      from_warehouse_id: parseInt(fromWarehouseId),
      to_warehouse_id: parseInt(toWarehouseId),
      quantity: qty,
    };

    onTransfer(payload);
  };

  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  const warehouseOptions = warehouses
    .filter((w) => String(w.id) !== fromWarehouseId)
    .map((w) => ({
      value: String(w.id),
      label: w.name,
    }));

  const qtyNum = parseInt(quantity) || 0;
  const isQtyValid = qtyNum > 0 && qtyNum <= availableQty;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Transferir Inventario
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Transfiere stock de un almacén a otro.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label>
              Producto <span className="text-error-500">*</span>
            </Label>
            <Select
              options={productOptions}
              placeholder="Seleccionar producto"
              onChange={setProductId}
              defaultValue={productId}
            />
          </div>

          <div>
            <Label>
              Almacén Origen <span className="text-error-500">*</span>
            </Label>
            <Select
              options={warehouses.map((w) => ({
                value: String(w.id),
                label: w.name,
              }))}
              placeholder="Seleccionar almacén origen"
              onChange={setFromWarehouseId}
              defaultValue={fromWarehouseId}
            />
          </div>

          <div>
            <Label>
              Almacén Destino <span className="text-error-500">*</span>
            </Label>
            <Select
              options={warehouseOptions}
              placeholder="Seleccionar almacén destino"
              onChange={setToWarehouseId}
              defaultValue={toWarehouseId}
            />
          </div>

          <div>
            <Label>
              Cantidad a Transferir <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max={String(availableQty)}
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Disponible: {availableQty} unidades
            </p>
            {productId && fromWarehouseId && !hasStockRecord && (
              <p className="mt-1 text-xs text-warning-500">
                No hay inventario registrado para este producto en el almacén origen.
              </p>
            )}
            {quantity && !isQtyValid && (
              <p className="mt-1 text-xs text-error-500">
                La cantidad debe ser entre 1 y {availableQty}.
              </p>
            )}
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
              !fromWarehouseId ||
              !toWarehouseId ||
              !isQtyValid ||
              !hasStockRecord
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
                Transfiriendo...
              </span>
            ) : (
              "Transferir"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
