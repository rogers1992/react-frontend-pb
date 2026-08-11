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
import Select from "../../components/form/Select";
import MultiSelect from "../../components/form/MultiSelect";
import { PlusIcon, PencilIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { userService } from "../../services/user.service";
import { roleService } from "../../services/role.service";
import { warehouseService } from "../../services/warehouse.service";
import { getErrorMessage } from "../../utils/error";
import type { UserWithRole, UserCreate, UserUpdate, Role, Warehouse } from "../../types";

export default function UserIndex() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const { can } = usePermissions();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);

  const [toggleTarget, setToggleTarget] = useState<UserWithRole | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [resetTarget, setResetTarget] = useState<UserWithRole | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const roleHasSalesPermission = (rId: string): boolean => {
    const role = roles.find((r) => r.id === parseInt(rId));
    return !!(role?.permissions?.sales?.length);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, warehousesRes] = await Promise.allSettled([
        userService.getAll(0, 500, searchQuery || undefined),
        roleService.getAll(),
        warehouseService.getAll(0, 500),
      ]);
      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value);
      } else {
        showToast({
          type: "error",
          message: getErrorMessage(
            usersRes.reason,
            "Error al cargar los usuarios.",
          ),
        });
      }
      if (rolesRes.status === "fulfilled") {
        setRoles(rolesRes.value);
      }
      if (warehousesRes.status === "fulfilled") {
        setWarehouses(warehousesRes.value.filter((w) => w.is_active));
      }
    } finally {
      setLoading(false);
    }
  }, [showToast, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setPassword("");
    setRoleId("");
    setSelectedWarehouseIds([]);
    setSelectedUser(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (u: UserWithRole) => {
    setSelectedUser(u);
    setUsername(u.username);
    setEmail(u.email);
    setFirstName(u.first_name);
    setLastName(u.last_name);
    setPhone(u.phone ?? "");
    setPassword("");
    setRoleId(String(u.role_id));
    setSelectedWarehouseIds(u.warehouse_ids || []);
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

      if (selectedUser) {
        const payload: UserUpdate = {
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
          role_id: parseInt(roleId),
        };
        if (roleHasSalesPermission(roleId)) {
          payload.warehouse_ids = selectedWarehouseIds;
        }
        await userService.update(selectedUser.id, payload);
        showToast({
          type: "success",
          message: "Usuario actualizado exitosamente.",
        });
      } else {
        const payload: UserCreate = {
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
          password,
          role_id: parseInt(roleId),
        };
        if (roleHasSalesPermission(roleId) && selectedWarehouseIds.length > 0) {
          payload.warehouse_ids = selectedWarehouseIds;
        }
        await userService.create(payload);
        showToast({
          type: "success",
          message: "Usuario creado exitosamente.",
        });
      }
      handleCloseForm();
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al guardar el usuario.");
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    try {
      setToggleLoading(true);
      await userService.toggleActive(toggleTarget.id, !toggleTarget.is_active);
      showToast({
        type: "success",
        message: toggleTarget.is_active
          ? "Usuario desactivado exitosamente."
          : "Usuario activado exitosamente.",
      });
      setToggleTarget(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al cambiar el estado.");
      showToast({ type: "error", message });
    } finally {
      setToggleLoading(false);
    }
  };

  const handleOpenReset = (u: UserWithRole) => {
    setResetTarget(u);
    setNewPassword("");
  };

  const handleConfirmReset = async () => {
    if (!resetTarget || !newPassword) return;
    try {
      setResetLoading(true);
      await userService.resetPassword(resetTarget.id, newPassword);
      showToast({
        type: "success",
        message: "Contraseña restablecida exitosamente.",
      });
      setResetTarget(null);
      setNewPassword("");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Error al restablecer la contraseña.",
      );
      showToast({ type: "error", message });
    } finally {
      setResetLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role_id !== parseInt(roleFilter)) return false;
    if (activeFilter === "active" && !u.is_active) return false;
    if (activeFilter === "inactive" && u.is_active) return false;
    return true;
  });

  const roleSource: Role[] =
    roles.length > 0
      ? roles
      : Array.from(
          new Map(
            users
              .filter((u) => u.role != null)
              .map((u) => [u.role.id, u.role] as [number, Role]),
          ).values(),
        );
  const roleMap = new Map(roleSource.map((r) => [r.id, r.name]));
  const roleOptions = roleSource.map((r) => ({
    value: String(r.id),
    label: r.name,
  }));

  const warehouseOptions = warehouses.map((w) => ({
    value: String(w.id),
    text: w.name,
  }));

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const isSelf = (u: UserWithRole) => currentUser?.id === u.id;

  const columns = [
    {
      key: "username",
      header: "Usuario",
      sortable: true,
      render: (item: UserWithRole) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {item.username}
        </span>
      ),
    },
    {
      key: "first_name",
      header: "Nombre",
      sortable: true,
      render: (item: UserWithRole) =>
        `${item.first_name} ${item.last_name}`,
    },
    {
      key: "email",
      header: "Email",
      render: (item: UserWithRole) => item.email,
    },
    {
      key: "role_id",
      header: "Rol",
      render: (item: UserWithRole) => (
        <Badge size="sm" color="primary">
          {roleMap.get(item.role_id) || "—"}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      render: (item: UserWithRole) => (
        <Badge size="sm" color={item.is_active ? "success" : "error"}>
          {item.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "last_login",
      header: "Ultimo ingreso",
      render: (item: UserWithRole) => formatDate(item.last_login),
    },
    {
      key: "actions",
      header: "",
      className: "w-28",
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-1">
          {can("users", "update") && (
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
          {can("users", "update") && !isSelf(item) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToggleTarget(item);
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-warning-50 hover:text-warning-500 dark:text-gray-400 dark:hover:bg-warning-500/15 dark:hover:text-warning-400"
              title={item.is_active ? "Desactivar" : "Activar"}
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
              </svg>
            </button>
          )}
          {can("users", "update") && !isSelf(item) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReset(item);
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
              title="Restablecer contraseña"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 12l4-4 4 4" />
                <path d="M6 8v8" />
                <path d="M16 12a4 4 0 0 1 8 0v3a2 2 0 0 1-2 2h-4" />
                <circle cx="16" cy="16" r="1" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Usuarios | Paraiso Biker"
        description="Gestion de usuarios - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Usuarios" />

      <DataTable<UserWithRole>
        columns={columns}
        data={filteredUsers}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por usuario, nombre o email..."
        emptyMessage="No se encontraron usuarios."
        serverSide={false}
        totalItems={filteredUsers.length}
        actions={
          <div className="flex items-center gap-2">
            <Select
              options={roleOptions}
              placeholder="Todos los roles"
              onChange={(v) => setRoleFilter(v)}
              defaultValue={roleFilter}
              className="h-9 w-40 text-xs"
            />
            <Select
              options={[
                { value: "active", label: "Activos" },
                { value: "inactive", label: "Inactivos" },
              ]}
              placeholder="Todos"
              onChange={(v) => setActiveFilter(v)}
              defaultValue={activeFilter}
              className="h-9 w-32 text-xs"
            />
            {can("users", "create") && (
              <Button
                size="sm"
                variant="primary"
                startIcon={<PlusIcon />}
                onClick={handleOpenCreate}
              >
                Agregar Usuario
              </Button>
            )}
          </div>
        }
      />

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        className="max-w-2xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedUser
              ? "Actualiza la informacion del usuario."
              : "Completa los campos para crear un nuevo usuario."}
          </p>
        </div>

        <form onSubmit={handleSubmitForm}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>
                  Usuario <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={formLoading || !!selectedUser}
                />
              </div>
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>
                  Nombre <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label>
                  Apellido <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Telefono</Label>
                <Input
                  type="text"
                  placeholder="Telefono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label>
                  Rol <span className="text-error-500">*</span>
                </Label>
                <Select
                  options={roleOptions}
                  placeholder="Seleccionar rol"
                  onChange={setRoleId}
                  defaultValue={roleId}
                />
              </div>
            </div>

            {roleHasSalesPermission(roleId) && (
              <div>
                <MultiSelect
                  label="Almacenes"
                  options={warehouseOptions}
                  value={selectedWarehouseIds.map((id) => String(id))}
                  onChange={(values) =>
                    setSelectedWarehouseIds(values.map((v) => parseInt(v)))
                  }
                  placeholder="Seleccionar almacenes"
                />
              </div>
            )}

            {!selectedUser && (
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              disabled={formLoading || !email || !firstName || !lastName || !roleId || (!selectedUser && (!username || !password))}
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
              ) : selectedUser ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleConfirmToggle}
        title={toggleTarget?.is_active ? "Desactivar Usuario" : "Activar Usuario"}
        message={
          toggleTarget?.is_active
            ? `Esta seguro de desactivar a "${toggleTarget.username}"? No podra iniciar sesion hasta que se reactive.`
            : `Esta seguro de activar a "${toggleTarget?.username}"?`
        }
        confirmText={toggleTarget?.is_active ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant="warning"
        loading={toggleLoading}
      />

      <Modal
        isOpen={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          setNewPassword("");
        }}
        className="max-w-md p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Restablecer Contraseña
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Asigna una nueva contraseña para{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {resetTarget?.username}
            </span>
            .
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmReset();
          }}
        >
          <div className="space-y-5">
            <div>
              <Label>
                Nueva contraseña <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Minimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={resetLoading}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResetTarget(null);
                setNewPassword("");
              }}
              disabled={resetLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={resetLoading || newPassword.length < 6}
            >
              {resetLoading ? (
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
                  Procesando...
                </span>
              ) : (
                "Restablecer"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
