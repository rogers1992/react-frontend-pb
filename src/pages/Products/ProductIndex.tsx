import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/ui/button/Button";
import Checkbox from "../../components/form/input/Checkbox";
import { PlusIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { supplierService } from "../../services/supplier.service";
import { getErrorMessage } from "../../utils/error";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  Category,
  Supplier,
} from "../../types";
import ProductForm from "./components/ProductForm";
import { getProductColumns } from "./components/ProductTable";

export default function ProductIndex() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(
    async (currentPage = 0, currentPageSize = 10) => {
      try {
        setLoading(true);
        const skip = currentPage * currentPageSize;
        const [productsData, categoriesData, suppliersData] = await Promise.all(
          [
            productService.getAll(
              skip,
              currentPageSize,
              searchQuery || undefined,
              showInactive,
            ),
            categoryService.getAll(),
            supplierService.getAll(),
          ],
        );
        setProducts(productsData.items);
        setTotalItems(productsData.total_items);
        setCategories(categoriesData);
        setSuppliers(suppliersData);
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

  useEffect(() => {
    setPage(0);
  }, [showInactive]);

  //- Translation: "When the user types in search, go back to page 1 and fetch"
  //- Why? Because search results might only be 1 page
  /*useEffect(() => {
    setPage(0);
    fetchData(0, pageSize);
  }, [searchQuery]);*/

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
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmitForm = async ({
    data,
    pendingFiles,
    removedImageIds,
    primaryImageId,
    reorderedImages,
  }: {
    data: ProductCreate | ProductUpdate;
    pendingFiles: File[];
    removedImageIds: number[];
    primaryImageId: number | null;
    reorderedImages: { id: number; sort_order: number }[];
  }) => {
    try {
      setFormLoading(true);
      let savedProduct: Product;
      if (selectedProduct) {
        const updated = await productService.update(
          selectedProduct.id,
          data as ProductUpdate,
        );
        showToast({
          type: "success",
          message: "Producto actualizado exitosamente.",
        });
        savedProduct = updated;
      } else {
        const created = await productService.create(data as ProductCreate);
        showToast({
          type: "success",
          message: "Producto creado exitosamente.",
        });
        savedProduct = created;
      }

      // Handle removed images
      for (const imageId of removedImageIds) {
        try {
          await productService.deleteImage(savedProduct.id, imageId);
        } catch (error) {
          const message = getErrorMessage(error, "No se pudo eliminar una imagen.");
          showToast({ type: "error", message });
        }
      }

      // Upload pending files
      for (let i = 0; i < pendingFiles.length; i++) {
        try {
          const isPrimary = primaryImageId === null && i === 0;
          await productService.addImage(savedProduct.id, pendingFiles[i], isPrimary, i);
        } catch (error) {
          const message = getErrorMessage(error, "El producto se guardo pero una imagen no pudo subirse.");
          showToast({ type: "error", message });
        }
      }

      // Reorder existing images and update primary
      for (const img of reorderedImages) {
        try {
          const isPrimary = primaryImageId === img.id;
          await productService.updateImage(savedProduct.id, img.id, {
            sortOrder: img.sort_order,
            isPrimary,
          });
        } catch (error) {
          const message = getErrorMessage(error, "No se pudo actualizar el orden de las imagenes.");
          showToast({ type: "error", message });
        }
      }

      handleCloseForm();
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al guardar el producto.");
      showToast({ type: "error", message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await productService.delete(deleteTarget.id);
      showToast({
        type: "success",
        message: "Producto archivado exitosamente.",
      });
      setDeleteTarget(null);
      await refreshData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al archivar el producto.");
      showToast({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = getProductColumns(
    categories,
    handleOpenEdit,
    handleOpenDelete,
  );

  return (
    <>
      <PageMeta
        title="Productos | Paraiso Biker"
        description="Gestion de productos - Paraiso Biker"
      />

      <PageBreadcrumb pageTitle="Productos" />

      <DataTable<Product>
        columns={columns}
        data={products}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, SKU o codigo de barras..."
        emptyMessage="No se encontraron productos."
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
          <div className="flex items-center gap-4">
            <Checkbox
              label="Mostrar inactivos"
              checked={showInactive}
              onChange={setShowInactive}
            />
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon />}
              onClick={handleOpenCreate}
            >
              Agregar Producto
            </Button>
          </div>
        }
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        product={selectedProduct}
        categories={categories}
        suppliers={suppliers}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Archivar Producto"
        message={`Esta seguro de archivar "${deleteTarget?.name}"? El producto se desactivara y no aparecera en la lista principal, pero sus ventas e historial se conservan. Puede reactivarlo mas tarde.`}
        confirmText="Archivar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}
