import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { inventoryService } from "../../services/inventory.service";
import { productService } from "../../services/product.service";
import { warehouseService } from "../../services/warehouse.service";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/error";
import type {
  InventoryItem,
  InventoryItemCreate,
  InventoryItemUpdate,
  Product,
  Warehouse,
  InventoryTransferRequest,
} from "../../types";
import InventoryForm from "./components/InventoryForm";
import { getInventoryColumns } from "./components/InventoryTable";
import TransferModal from "./components/TransferModal";
import SearchInput from "../../components/common/SearchInput";

type StatusFilter = "all" | "stock_bajo" | "normal";

function getInventoryStatus(item: InventoryItem): "stock_bajo" | "normal" {
  return item.quantity <= (item.min_stock_level ?? 0) ? "stock_bajo" : "normal";
}

export default function InventoryIndex() {
  const { showToast } = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [summary, setSummary] = useState({
    total_items: 0,
    total_warehouses: 0,
    low_stock_count: 0,
    total_quantity: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [inventoryData, productsData, warehousesData] = await Promise.all([
        inventoryService.getAll(0, 1000),
        productService.getAll(0, 1000),
        warehouseService.getAll(0, 100),
      ]);
      setInventory(inventoryData);
      setProducts(productsData.items);
      setWarehouses(warehousesData);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar los datos.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get("/inventory/summary");
      setSummary(response.data);
    } catch {
      // Summary is non-critical, silently fail
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, [fetchData, fetchSummary]);

  const refreshData = async () => {
    await fetchData();
    fetchSummary();
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleOpenTransfer = (item: InventoryItem) => {
    setTransferItem(item);
    setIsTransferOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleCloseTransfer = () => {
    setIsTransferOpen(false);
    setTransferItem(null);
  };

  const handleSubmitForm = async (
    data: InventoryItemCreate | InventoryItemUpdate,
  ) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        await inventoryService.update(selectedItem.id, data as InventoryItemUpdate);
        showToast({
          type: "success",
          message: "Inventario actualizado exitosamente.",
        });
      } else {
        await inventoryService.create(data as InventoryItemCreate);
        showToast({
          type: "success",
          message: "Registro de inventario creado exitosamente.",
        });
      }
      handleCloseForm();
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al guardar el inventario.");
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleTransfer = async (data: InventoryTransferRequest) => {
    try {
      setTransferLoading(true);
      await inventoryService.transfer(data);
      showToast({
        type: "success",
        message: "Transferencia completada exitosamente.",
      });
      handleCloseTransfer();
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al transferir el inventario.");
      showToast({ type: "error", message });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleOpenDelete = (item: InventoryItem) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await inventoryService.update(deleteTarget.id, { quantity: 0 });
      showToast({
        type: "success",
        message: "Registro de inventario eliminado exitosamente.",
      });
      setDeleteTarget(null);
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al eliminar el registro de inventario.");
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const productMap = new Map(
    products.map((p) => [p.id, { name: p.name, sku: p.sku }]),
  );
  const warehouseMap = new Map(warehouses.map((w) => [w.id, w.name]));

  const columns = getInventoryColumns(
    productMap,
    warehouseMap,
    handleOpenEdit,
    handleOpenTransfer,
    handleOpenDelete,
  );

  const filteredInventory = inventory.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || getInventoryStatus(item) === statusFilter;

    if (!matchesStatus) return false;
    if (!searchQuery) return true;

    const product = productMap.get(item.product_id);
    const search = searchQuery.toLowerCase();
    return (
      product?.name.toLowerCase().includes(search) ||
      product?.sku?.toLowerCase().includes(search) ||
      warehouseMap.get(item.warehouse_id)?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <PageMeta
        title="Inventario | Paraiso Biker"
        description="Gestion de inventario - Paraiso Biker"
      />

      <PageBreadcrumb pageTitle="Inventario" />

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Registros
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {summary.total_items}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Almacenes Activos
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {summary.total_warehouses}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stock Bajo
          </p>
          <p className="mt-1 text-2xl font-semibold text-error-500">
            {summary.low_stock_count}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cantidad Total
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {summary.total_quantity}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6 mb-4">
        <div className="flex w-full items-center gap-3 sm:max-w-md">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(0);
            }}
            className="h-11 shrink-0 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="all">Todos</option>
            <option value="stock_bajo">Stock Bajo</option>
            <option value="normal">Normal</option>
          </select>
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por producto, SKU o almacen..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            startIcon={
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            }
            onClick={() => {
              setTransferItem(null);
              setIsTransferOpen(true);
            }}
          >
            Transferir
          </Button>
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={handleOpenCreate}
          >
            Agregar Inventario
          </Button>
        </div>
      </div>

      <DataTable<InventoryItem>
        columns={columns}
        data={filteredInventory}
        loading={loading}
        emptyMessage="No se encontraron registros de inventario."
        serverSide={false}
        totalItems={filteredInventory.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(0);
        }}
      />

      <InventoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        item={selectedItem}
        products={products}
        warehouses={warehouses}
        loading={formLoading}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={handleCloseTransfer}
        onTransfer={handleTransfer}
        item={transferItem}
        products={products}
        warehouses={warehouses}
        inventory={inventory}
        loading={transferLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Registro de Inventario"
        message={`Esta seguro de eliminar el registro de "${productMap.get(deleteTarget?.product_id ?? 0)?.name || "producto"}" en "${warehouseMap.get(deleteTarget?.warehouse_id ?? 0) || "almacen"}"? Esta accion establecera la cantidad a cero.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
