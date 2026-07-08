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
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { roleService } from "../../services/role.service";
import { getErrorMessage } from "../../utils/error";
import type {
  Role,
  RoleCreate,
  RoleUpdate,
  PermissionResource,
  PermissionAction,
} from "../../types";
import {
  VALID_RESOURCES,
  VALID_ACTIONS,
  RESOURCE_LABELS,
  ACTION_LABELS,
} from "../../types";

export default function RoleIndex() {
  const { showToast } = useToast();
  const { can } = usePermissions();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<
    Record<string, string[]>
  >({});

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar los roles.");
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
    setDescription("");
    setPermissions({});
    setSelectedRole(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setName(role.name);
    setDescription(role.description ?? "");
    setPermissions(role.permissions ? { ...role.permissions } : {});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const togglePermission = (
    resource: PermissionResource,
    action: PermissionAction,
  ) => {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: next };
    });
  };

  const toggleRowAll = (resource: PermissionResource) => {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const allSelected = VALID_ACTIONS.every((a) => current.includes(a));
      return {
        ...prev,
        [resource]: allSelected ? [] : [...VALID_ACTIONS],
      };
    });
  };

  const isRowChecked = (
    resource: PermissionResource,
    action: PermissionAction,
  ) => (permissions[resource] ?? []).includes(action);

  const isRowAllChecked = (resource: PermissionResource) =>
    VALID_ACTIONS.every((a) => (permissions[resource] ?? []).includes(a));

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const cleanPermissions: Record<string, string[]> = {};
      Object.entries(permissions).forEach(([res, actions]) => {
        if (actions.length > 0) cleanPermissions[res] = actions;
      });

      if (selectedRole) {
        const payload: RoleUpdate = {
          name,
          description: description || undefined,
          permissions: cleanPermissions,
        };
        await roleService.update(selectedRole.id, payload);
        showToast({
          type: "success",
          message: "Rol actualizado exitosamente.",
        });
      } else {
        const payload: RoleCreate = {
          name,
          description: description || undefined,
          permissions: cleanPermissions,
        };
        await roleService.create(payload);
        showToast({
          type: "success",
          message: "Rol creado exitosamente.",
        });
      }
      handleCloseForm();
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al guardar el rol.");
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await roleService.delete(deleteTarget.id);
      showToast({
        type: "success",
        message: "Rol eliminado exitosamente.",
      });
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al eliminar el rol.");
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRoles = searchQuery
    ? roles.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false),
      )
    : roles;

  const countPermissions = (role: Role) =>
    Object.values(role.permissions ?? {}).reduce(
      (sum, actions) => sum + actions.length,
      0,
    );

  const columns = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (item: Role) => (
        <span className="font-medium text-gray-800 dark:text-white/90 capitalize">
          {item.name}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripcion",
      render: (item: Role) => item.description || "—",
    },
    {
      key: "is_system",
      header: "Sistema",
      render: (item: Role) =>
        item.is_system ? (
          <Badge size="sm" color="info">
            Sistema
          </Badge>
        ) : (
          <Badge size="sm" color="light">
            Personalizado
          </Badge>
        ),
    },
    {
      key: "permissions",
      header: "Permisos",
      render: (item: Role) => `${countPermissions(item)} permisos`,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Role) => (
        <div className="flex items-center gap-1">
          {can("roles", "update") && (
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
          )}
          {can("roles", "delete") && !item.is_system && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(item);
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/15 dark:hover:text-error-400"
              title="Eliminar"
            >
              <TrashBinIcon className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Roles | Paraiso Biker"
        description="Gestion de roles y permisos - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Roles" />

      <DataTable<Role>
        columns={columns}
        data={filteredRoles}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o descripcion..."
        emptyMessage="No se encontraron roles."
        serverSide={false}
        totalItems={filteredRoles.length}
        actions={
          can("roles", "create") && (
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon />}
              onClick={handleOpenCreate}
            >
              Agregar Rol
            </Button>
          )
        }
      />

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        className="max-w-4xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedRole ? "Editar Rol" : "Nuevo Rol"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedRole
              ? "Actualiza la informacion y permisos del rol."
              : "Completa los campos y asigna permisos al nuevo rol."}
          </p>
        </div>

        <form onSubmit={handleSubmitForm}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>
                  Nombre <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Ej: cajero"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={formLoading || (selectedRole?.is_system ?? false)}
                />
              </div>
              <div>
                <Label>Descripcion</Label>
                <Input
                  type="text"
                  placeholder="Descripcion del rol"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>

            <div>
              <Label>Matriz de Permisos</Label>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="max-h-[360px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-theme-xs dark:text-gray-300">
                          Recurso
                        </th>
                        {VALID_ACTIONS.map((action) => (
                          <th
                            key={action}
                            className="px-3 py-3 text-center font-medium text-gray-600 capitalize text-theme-xs dark:text-gray-300"
                          >
                            {ACTION_LABELS[action] ?? action}
                          </th>
                        ))}
                        <th className="px-3 py-3 text-center font-medium text-gray-600 text-theme-xs dark:text-gray-300">
                          Todos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {VALID_RESOURCES.map((resource) => (
                        <tr
                          key={resource}
                          className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-2.5 capitalize text-gray-700 dark:text-gray-300">
                            {RESOURCE_LABELS[resource] ?? resource}
                          </td>
                          {VALID_ACTIONS.map((action) => (
                            <td
                              key={action}
                              className="px-3 py-2.5 text-center"
                            >
                              <input
                                type="checkbox"
                                checked={isRowChecked(resource, action)}
                                onChange={() =>
                                  togglePermission(resource, action)
                                }
                                disabled={formLoading}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isRowAllChecked(resource)}
                              onChange={() => toggleRowAll(resource)}
                              disabled={formLoading}
                              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {selectedRole?.is_system && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Los roles de sistema no pueden renombrarse, pero sus permisos
                  si pueden ajustarse.
                </p>
              )}
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
              ) : selectedRole ? (
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
        title="Eliminar Rol"
        message={`Esta seguro de eliminar el rol "${deleteTarget?.name}"? Los usuarios asignados perderan sus permisos.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
