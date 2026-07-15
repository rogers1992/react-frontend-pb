import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { customerService } from "../../services/customer.service";
import { getErrorMessage } from "../../utils/error";
import type { Customer, CustomerCreate, CustomerUpdate } from "../../types";
import CustomerForm from "./components/CustomerForm";
import CustomerDetailModal from "./components/CustomerDetailModal";
import { getCustomerColumns } from "./components/CustomerTable";

export default function CustomerIndex() {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showInactive, setShowInactive] = useState(false);

  const fetchData = useCallback(
    async (currentPage = 0, currentPageSize = 10) => {
      try {
        setLoading(true);
        const skip = currentPage * currentPageSize;
        const data = await customerService.getAll(
          skip,
          currentPageSize,
          searchQuery || undefined,
          undefined,
          showInactive ? undefined : true,
        );
        setCustomers(data.items);
        setTotalItems(data.total_items);
      } catch (error) {
        const message = getErrorMessage(error, "Error al cargar los datos.");
        showToast({ type: "error", message });
      } finally {
        setLoading(false);
      }
    },
    [showToast, searchQuery, showInactive],
  );

  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize, fetchData]);

  const refreshData = async () => {
    const maxPage = Math.max(0, Math.ceil((totalItems - 1) / pageSize) - 1);
    const newPage = Math.min(page, maxPage);
    if (newPage !== page) {
      setPage(newPage);
    } else {
      await fetchData(page, pageSize);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (customer: Customer) => {
    setDetailCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
  };

  const handleSubmitForm = async (data: CustomerCreate | CustomerUpdate) => {
    try {
      setFormLoading(true);
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, data as CustomerUpdate);
        showToast({ type: "success", message: "Cliente actualizado exitosamente." });
      } else {
        await customerService.create(data as CustomerCreate);
        showToast({ type: "success", message: "Cliente creado exitosamente." });
      }
      handleCloseForm();
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al guardar el cliente.");
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    try {
      const updated = await customerService.toggleActive(customer.id);
      const action = updated.is_active === 1 ? "activado" : "desactivado";
      showToast({ type: "success", message: `Cliente ${action} exitosamente.` });
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al cambiar el estado del cliente.");
      showToast({ type: "error", message });
    }
  };

  const handleOpenDelete = (customer: Customer) => {
    setDeleteTarget(customer);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await customerService.delete(deleteTarget.id);
      showToast({ type: "success", message: "Cliente eliminado exitosamente." });
      setDeleteTarget(null);
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al eliminar el cliente.");
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = getCustomerColumns({
    onEdit: handleOpenEdit,
    onView: handleOpenDetail,
    onDelete: handleOpenDelete,
    onToggleActive: handleToggleActive,
  });

  return (
    <>
      <PageMeta
        title="Clientes | Paraiso Biker"
        description="Gestion de clientes - Paraiso Biker"
      />

      <PageBreadcrumb pageTitle="Clientes" />

      <div className="mb-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => {
              setShowInactive(e.target.checked);
              setPage(0);
            }}
            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
          />
          Mostrar clientes inactivos
        </label>
      </div>

      <DataTable<Customer>
        columns={columns}
        data={customers}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, email o telefono..."
        emptyMessage="No se encontraron clientes."
        serverSide
        totalItems={totalItems}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(0);
        }}
        actions={
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={handleOpenCreate}
          >
            Agregar Cliente
          </Button>
        }
      />

      <CustomerForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        customer={selectedCustomer}
        loading={formLoading}
      />

      <CustomerDetailModal
        isOpen={isDetailOpen}
        customer={detailCustomer}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailCustomer(null);
        }}
        onEdit={(c) => {
          setIsDetailOpen(false);
          setDetailCustomer(null);
          handleOpenEdit(c);
        }}
        onRefresh={refreshData}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message={`Esta seguro de eliminar a "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
