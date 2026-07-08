import { useState, useEffect, useCallback, type FormEvent } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import Checkbox from "../../components/form/input/Checkbox";
import { useToast } from "../../context/ToastContext";
import { warehouseService } from "../../services/warehouse.service";
import { getErrorMessage } from "../../utils/error";
import type { Warehouse, WarehouseCreate, WarehouseUpdate } from "../../types";

export default function WarehouseIndex() {
  const { showToast } = useToast();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getAll(0, 100);
      setWarehouses(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar los almacenes.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setName("");
    setLocation("");
    setIsActive(true);
    setSelectedWarehouse(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setName(warehouse.name);
    setLocation(warehouse.location ?? "");
    setIsActive(warehouse.is_active);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const payload: WarehouseCreate = {
        name,
        location: location || undefined,
      };

      if (selectedWarehouse) {
        const updatePayload: WarehouseUpdate = {
          name: name || undefined,
          location: location || undefined,
          is_active: isActive,
        };
        await warehouseService.update(selectedWarehouse.id, updatePayload);
        showToast({
          type: "success",
          message: "Almacen actualizado exitosamente.",
        });
      } else {
        await warehouseService.create(payload);
        showToast({
          type: "success",
          message: "Almacen creado exitosamente.",
        });
      }
      handleCloseForm();
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al guardar el almacen.");
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (warehouse: Warehouse) => {
    setDeleteTarget(warehouse);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await warehouseService.delete(deleteTarget.id);
      showToast({
        type: "success",
        message: "Almacen eliminado exitosamente.",
      });
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al eliminar el almacen.");
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredWarehouses = searchQuery
    ? warehouses.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
      )
    : warehouses;

  const columns = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (item: Warehouse) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {item.name}
        </span>
      ),
    },
    {
      key: "location",
      header: "Ubicacion",
      render: (item: Warehouse) => item.location || "—",
    },
    {
      key: "is_active",
      header: "Estado",
      render: (item: Warehouse) => (
        <Badge size="sm" color={item.is_active ? "success" : "error"}>
          {item.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Warehouse) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(item);
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
            title="Editar"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDelete(item);
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/15 dark:hover:text-error-400"
            title="Eliminar"
          >
            <TrashBinIcon className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Almacenes | Paraiso Biker"
        description="Gestion de almacenes - Paraiso Biker"
      />

      <PageBreadcrumb pageTitle="Almacenes" />

      <DataTable<Warehouse>
        columns={columns}
        data={filteredWarehouses}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o ubicacion..."
        emptyMessage="No se encontraron almacenes."
        serverSide={false}
        totalItems={filteredWarehouses.length}
        actions={
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={handleOpenCreate}
          >
            Agregar Almacen
          </Button>
        }
      />

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} className="max-w-xl p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedWarehouse ? "Editar Almacen" : "Nuevo Almacen"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedWarehouse
              ? "Actualiza la informacion del almacen."
              : "Completa los campos para crear un nuevo almacen."}
          </p>
        </div>

        <form onSubmit={handleSubmitForm}>
          <div className="space-y-5">
            <div>
              <Label>
                Nombre <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Nombre del almacen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formLoading}
              />
            </div>

            <div>
              <Label>Ubicacion</Label>
              <Input
                type="text"
                placeholder="Direccion o ubicacion fisica"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {selectedWarehouse && (
              <div>
                <Checkbox
                  label="Almacen activo"
                  checked={isActive}
                  onChange={setIsActive}
                  disabled={formLoading}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseForm}
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={formLoading || !name}
            >
              {formLoading ? (
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
              ) : selectedWarehouse ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Almacen"
        message={`Esta seguro de eliminar "${deleteTarget?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
