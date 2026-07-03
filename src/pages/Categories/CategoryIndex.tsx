import { useState, useEffect, useCallback, type FormEvent } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { categoryService } from "../../services/category.service";
import { getErrorMessage } from "../../utils/error";
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
} from "../../types";

export default function CategoryIndex() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar las categorias.");
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
    setSelectedCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setName(category.name);
    setDescription(category.description ?? "");
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

      if (selectedCategory) {
        const payload: CategoryUpdate = {
          name,
          description: description || undefined,
        };
        await categoryService.update(selectedCategory.id, payload);
        showToast({
          type: "success",
          message: "Categoria actualizada exitosamente.",
        });
      } else {
        const payload: CategoryCreate = {
          name,
          description: description || undefined,
        };
        await categoryService.create(payload);
        showToast({
          type: "success",
          message: "Categoria creada exitosamente.",
        });
      }
      handleCloseForm();
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Error al guardar la categoria.",
      );
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (category: Category) => {
    setDeleteTarget(category);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await categoryService.delete(deleteTarget.id);
      showToast({
        type: "success",
        message: "Categoria eliminada exitosamente.",
      });
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Error al eliminar la categoria.",
      );
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategories = searchQuery
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false),
      )
    : categories;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const columns = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (item: Category) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {item.name}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripcion",
      render: (item: Category) => item.description || "—",
    },
    {
      key: "created_at",
      header: "Fecha de creacion",
      sortable: true,
      render: (item: Category) => formatDate(item.created_at),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: Category) => (
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
        title="Categorias | Paraiso Biker"
        description="Gestion de categorias - Paraiso Biker"
      />

      <PageBreadcrumb pageTitle="Categorias" />

      <DataTable<Category>
        columns={columns}
        data={filteredCategories}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o descripcion..."
        emptyMessage="No se encontraron categorias."
        serverSide={false}
        totalItems={filteredCategories.length}
        actions={
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={handleOpenCreate}
          >
            Agregar Categoria
          </Button>
        }
      />

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        className="max-w-xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedCategory ? "Editar Categoria" : "Nueva Categoria"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCategory
              ? "Actualiza la informacion de la categoria."
              : "Completa los campos para crear una nueva categoria."}
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
                placeholder="Nombre de la categoria"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formLoading}
              />
            </div>

            <div>
              <Label>Descripcion</Label>
              <TextArea
                placeholder="Descripcion de la categoria"
                rows={3}
                value={description}
                onChange={setDescription}
                disabled={formLoading}
              />
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
              ) : selectedCategory ? (
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
        title="Eliminar Categoria"
        message={`Esta seguro de eliminar "${deleteTarget?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
