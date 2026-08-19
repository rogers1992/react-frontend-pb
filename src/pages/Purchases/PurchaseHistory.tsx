import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import type { Column } from "../../components/common/DataTable";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { PlusIcon, EyeIcon, CheckLineIcon, CloseLineIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { purchaseService } from "../../services/purchase.service";
import { supplierService } from "../../services/supplier.service";
import { warehouseService } from "../../services/warehouse.service";
import { userService } from "../../services/user.service";
import { getErrorMessage } from "../../utils/error";
import type { Order, Supplier, Warehouse, UserWithRole } from "../../types";
import PurchaseDetailModal from "./components/PurchaseDetailModal";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  received: "Recibido",
  cancelled: "Cancelado",
};

// ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone
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

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { can } = usePermissions();

  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params =
        statusFilter !== "all" ? { status: statusFilter, limit: 500 } : { limit: 500 };
      const [ordersData, suppliersData, warehousesData, usersData] = await Promise.all([
        purchaseService.getAll(params),
        supplierService.getAll(),
        warehouseService.getAll(0, 100),
        userService.getAll(0, 1000),
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
      setUsers(usersData);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar las compras.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const supplierMap = useMemo(() => {
    const map = new Map<number, string>();
    suppliers.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [suppliers]);

  const warehouseMap = useMemo(() => {
    const map = new Map<number, string>();
    warehouses.forEach((w) => map.set(w.id, w.name));
    return map;
  }, [warehouses]);

  const userMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((u) => {
      map.set(u.id, `${u.first_name} ${u.last_name}`);
    });
    return map;
  }, [users]);

  const filteredOrders = useMemo(() => {
    if (!searchInput.trim()) return orders;
    const query = searchInput.toLowerCase();
    return orders.filter((order) => {
      const supplierName = (supplierMap.get(order.supplier_id) ?? "").toLowerCase();
      const orderId = String(order.id);
      return supplierName.includes(query) || orderId.includes(query);
    });
  }, [orders, searchInput, supplierMap]);

  const handleViewDetail = useCallback((order: Order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedOrder(null);
  }, []);

  const handleReceive = useCallback(
    async (order: Order) => {
      if (!window.confirm(`¿Confirmar recepción de la orden #${order.id}? Esto actualizará el inventario.`)) {
        return;
      }
      try {
        setActionLoading(order.id);
        await purchaseService.receive(order.id);
        showToast({ type: "success", message: `Orden #${order.id} recibida. Inventario actualizado.` });
        fetchData();
      } catch (error) {
        const message = getErrorMessage(error, "Error al recibir la orden.");
        showToast({ type: "error", message });
      } finally {
        setActionLoading(null);
      }
    },
    [showToast, fetchData],
  );

  const handleCancel = useCallback(
    async (order: Order) => {
      if (!window.confirm(`¿Cancelar la orden #${order.id}?`)) return;
      try {
        setActionLoading(order.id);
        await purchaseService.cancel(order.id);
        showToast({ type: "success", message: `Orden #${order.id} cancelada.` });
        fetchData();
      } catch (error) {
        const message = getErrorMessage(error, "Error al cancelar la orden.");
        showToast({ type: "error", message });
      } finally {
        setActionLoading(null);
      }
    },
    [showToast, fetchData],
  );

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        sortable: true,
        render: (order) => (
          <span className="font-medium text-gray-800 dark:text-white/90">#{order.id}</span>
        ),
      },
      {
        key: "order_date",
        header: "Fecha",
        sortable: true,
        render: (order) => <span>{formatDate(order.order_date)}</span>,
      },
      {
        key: "supplier_id",
        header: "Proveedor",
        sortable: false,
        render: (order) => (
          <span>{supplierMap.get(order.supplier_id) ?? "Sin proveedor"}</span>
        ),
      },
      {
        key: "warehouse_id",
        header: "Almacén",
        sortable: false,
        render: (order) => (
          <span>{warehouseMap.get(order.warehouse_id) ?? "Desconocido"}</span>
        ),
      },
      {
        key: "total_amount",
        header: "Total",
        sortable: true,
        render: (order) => (
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {formatCurrency(order.total_amount)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Estado",
        sortable: true,
        render: (order) => {
          const label = statusLabels[order.status] ?? order.status;
          const color =
            order.status === "received"
              ? "success"
              : order.status === "pending"
                ? "warning"
                : "error";
          return (
            <Badge size="sm" color={color as "success" | "warning" | "error"}>
              {label}
            </Badge>
          );
        },
      },
      {
        key: "actions",
        header: "Acciones",
        sortable: false,
        render: (order) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              startIcon={<EyeIcon />}
              onClick={() => handleViewDetail(order)}
            >
              Ver
            </Button>
            {order.status === "pending" && can("purchases", "update") && (
              <Button
                variant="primary"
                size="sm"
                startIcon={<CheckLineIcon />}
                onClick={() => handleReceive(order)}
                disabled={actionLoading === order.id}
              >
                {actionLoading === order.id ? "..." : "Recibir"}
              </Button>
            )}
            {order.status === "pending" && can("purchases", "update") && (
              <button
                onClick={() => handleCancel(order)}
                disabled={actionLoading === order.id}
                className="text-error-500 hover:text-error-600 disabled:opacity-40 transition p-1.5"
                title="Cancelar orden"
              >
                <CloseLineIcon className="size-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [supplierMap, warehouseMap, handleViewDetail, handleReceive, handleCancel, can, actionLoading],
  );

  const selectedSupplierName = selectedOrder
    ? supplierMap.get(selectedOrder.supplier_id) ?? "Sin proveedor"
    : "";
  const selectedWarehouseName = selectedOrder
    ? warehouseMap.get(selectedOrder.warehouse_id) ?? "Desconocido"
    : "";
  const selectedCreatedBy = selectedOrder
    ? userMap.get(selectedOrder.created_by) ?? "Desconocido"
    : "";

  return (
    <>
      <PageMeta
        title="Historial de Compras | Paraiso Biker"
        description="Historial de compras - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Historial de Compras" />

      <DataTable<Order>
        columns={columns}
        data={filteredOrders}
        loading={loading}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por proveedor o ID..."
        emptyMessage="No se encontraron compras."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="received">Recibidas</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon />}
              onClick={() => navigate("/purchases/new")}
            >
              Nueva Compra
            </Button>
          </div>
        }
      />

      <PurchaseDetailModal
        isOpen={showDetail}
        order={selectedOrder}
        supplierName={selectedSupplierName}
        warehouseName={selectedWarehouseName}
        createdByName={selectedCreatedBy}
        onClose={handleCloseDetail}
      />
    </>
  );
}