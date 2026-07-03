import { useState, useEffect, useCallback, type FormEvent } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { supplierService } from "../../services/supplier.service";
import { getErrorMessage } from "../../utils/error";
import type {
  Supplier,
  SupplierCreate,
  SupplierUpdate,
} from "../../types";

export default function SupplierIndex() {
  const { showToast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar los proveedores.");
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
    setContactName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setSelectedSupplier(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setName(supplier.name);
    setContactName(supplier.contact_name ?? "");
    setEmail(supplier.email ?? "");
    setPhone(supplier.phone ?? "");
    setAddress(supplier.address ?? "");
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

      if (selectedSupplier) {
        const payload: SupplierUpdate = {
          name,
          contact_name: contactName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
        };
        await supplierService.update(selectedSupplier.id, payload);
        showToast({
          type: "success",
          message: "Proveedor actualizado exitosamente.",
        });
      } else {
        const payload: SupplierCreate = {
          name,
          contact_name: contactName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
        };
        await supplierService.create(payload);
        showToast({
          type: "success",
          message: "Proveedor creado exitosamente.",
        });
      }
      handleCloseForm();
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Error al guardar el proveedor.",
      );
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (supplier: Supplier) => {
    setDeleteTarget(supplier);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await supplierService.delete(deleteTarget.id);
      showToast({
        type: "success",
        message: "Proveedor eliminado exitosamente.",
      });
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Error al eliminar el proveedor.",
      );
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredSuppliers = searchQuery
    ? suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false) ||
          (s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false) ||
          (s.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false),
      )
    : suppliers;

  const columns = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (item: Supplier) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {item.name}
        </span>
      ),
    },
    {
      key: "contact_name",
      header: "Contacto",
      render: (item: Supplier) => item.contact_name || "—",
    },
    {
      key: "email",
      header: "Email",
      render: (item: Supplier) => item.email || "—",
    },
    {
      key: "phone",
      header: "Telefono",
      render: (item: Supplier) => item.phone || "—",
    },
    {
      key: "address",
      header: "Direccion",
      render: (item: Supplier) => item.address || "—",
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Supplier) => (
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
        title="Proveedores | Paraiso Biker"
        description="Gestion de proveedores - Paraiso Biker"
      />

      <PageBreadcrumb pageTitle="Proveedores" />

      <DataTable<Supplier>
        columns={columns}
        data={filteredSuppliers}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, contacto, email o telefono..."
        emptyMessage="No se encontraron proveedores."
        serverSide={false}
        totalItems={filteredSuppliers.length}
        actions={
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={handleOpenCreate}
          >
            Agregar Proveedor
          </Button>
        }
      />

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        className="max-w-2xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedSupplier
              ? "Actualiza la informacion del proveedor."
              : "Completa los campos para crear un nuevo proveedor."}
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
                placeholder="Nombre del proveedor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Nombre de contacto</Label>
                <Input
                  type="text"
                  placeholder="Persona de contacto"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Telefono</Label>
                <Input
                  type="text"
                  placeholder="Telefono de contacto"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label>Direccion</Label>
                <Input
                  type="text"
                  placeholder="Direccion del proveedor"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
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
              ) : selectedSupplier ? (
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
        title="Eliminar Proveedor"
        message={`Esta seguro de eliminar "${deleteTarget?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
