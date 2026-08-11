import { useState, useEffect, useCallback, type FormEvent, useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Checkbox from "../../../components/form/input/Checkbox";
import { generateSku } from "../../../utils/sku";
import { productService } from "../../../services/product.service";
import type { Product, ProductCreate, ProductUpdate, Category, Supplier } from "../../../types";

const MAX_IMAGES = 10;

interface ImageItem {
  id: number | null;
  url: string;
  file: File | null;
  isPrimary: boolean;
  sortOrder: number;
  isPending: boolean;
}

interface ProductFormSubmitPayload {
  data: ProductCreate | ProductUpdate;
  pendingFiles: File[];
  removedImageIds: number[];
  primaryImageId: number | null;
  reorderedImages: { id: number; sort_order: number }[];
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductFormSubmitPayload) => void;
  product?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  loading?: boolean;
}

export default function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  suppliers,
  loading = false,
}: ProductFormProps) {
  const isEditing = !!product;

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setBarcode(product.barcode ?? "");
      setDescription(product.description ?? "");
      setUnitPrice(String(product.unit_price));
      setWeight(product.weight ? String(product.weight) : "");
      setCategoryId(String(product.category_id));
      setSupplierId(product.supplier_id ? String(product.supplier_id) : "");
      setIsActive(product.is_active);
      setSkuManuallyEdited(true);
    } else {
      setName("");
      setSku("");
      setBarcode("");
      setDescription("");
      setUnitPrice("");
      setWeight("");
      setCategoryId("");
      setSupplierId("");
      setIsActive(true);
      setSkuManuallyEdited(false);
    }
    setImages([]);
  }, [product, isOpen]);

  useEffect(() => {
    if (!isEditing || !product) return;
    setLoadingImages(true);
    productService
      .getImages(product.id)
      .then((imgs) => {
        const sorted = [...imgs].sort((a, b) => a.sort_order - b.sort_order);
        setImages(
          sorted.map((img) => ({
            id: img.id,
            url: img.image_url,
            file: null,
            isPrimary: img.is_primary,
            sortOrder: img.sort_order,
            isPending: false,
          })),
        );
      })
      .catch(() => {
        setImages([]);
      })
      .finally(() => setLoadingImages(false));
  }, [isEditing, product]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
      });
    };
  }, []);

  const getCategoryName = useCallback(
    (catId: string) => categories.find((c) => String(c.id) === catId)?.name ?? "",
    [categories],
  );

  useEffect(() => {
    if (skuManuallyEdited || isEditing) return;
    if (!name || !categoryId) return;
    const catName = getCategoryName(categoryId);
    if (!catName) return;
    setSku(generateSku(catName, name));
  }, [name, categoryId, skuManuallyEdited, isEditing, getCategoryName]);

  const totalCount = images.length;
  const canAddMore = totalCount < MAX_IMAGES;

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const slotsAvailable = MAX_IMAGES - totalCount;
    const filesToAdd = Array.from(files).slice(0, slotsAvailable);

    const newImages: ImageItem[] = filesToAdd.map((file, i) => ({
      id: null,
      url: URL.createObjectURL(file),
      file,
      isPrimary: totalCount === 0 && i === 0,
      sortOrder: totalCount + i,
      isPending: true,
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  };

  const handleReorder = (index: number, direction: "up" | "down") => {
    setImages((prev) => {
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const hasChanges = images.some((img) => img.isPending) ||
    images.length !== (isEditing ? product?.images?.length ?? 0 : 0);

  const handleClose = useCallback(() => {
    if (hasChanges && !loading) {
      if (!window.confirm("Tienes cambios sin guardar. ¿Estás seguro de cerrar?")) {
        return;
      }
    }
    onClose();
  }, [hasChanges, loading, onClose]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name,
      sku,
      barcode: barcode || undefined,
      description: description || undefined,
      unit_price: parseFloat(unitPrice),
      weight: weight ? parseFloat(weight) : undefined,
      category_id: parseInt(categoryId),
      supplier_id: supplierId ? parseInt(supplierId) : null,
    };

    const pendingFiles = images.filter((img) => img.isPending && img.file).map((img) => img.file!);
    const removedImageIds = isEditing
      ? (product?.images ?? [])
          .filter((origImg) => !images.some((img) => img.id === origImg.id))
          .map((img) => img.id)
      : [];
    const primaryImage = images.find((img) => img.isPrimary);
    const primaryImageId = primaryImage?.id ?? null;
    const reorderedImages = images
      .filter((img) => !img.isPending && img.id !== null)
      .map((img) => ({ id: img.id!, sort_order: img.sortOrder }));

    if (isEditing) {
      onSubmit({
        data: { ...payload, is_active: isActive } as ProductUpdate,
        pendingFiles,
        removedImageIds,
        primaryImageId,
        reorderedImages,
      });
    } else {
      onSubmit({
        data: payload as ProductCreate,
        pendingFiles,
        removedImageIds,
        primaryImageId,
        reorderedImages,
      });
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const supplierOptions = suppliers.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing
            ? "Actualiza la informacion del producto."
            : "Completa los campos para crear un nuevo producto."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Image Grid Section */}
          <div>
            <Label>
              Imágenes del producto ({totalCount}/{MAX_IMAGES})
            </Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div key={`${img.id ?? "pending"}-${index}`} className="relative group">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <img
                      src={img.url}
                      alt={`${name || "Producto"} - ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Primary star */}
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="absolute top-0.5 left-0.5 p-0.5"
                      title={img.isPrimary ? "Imagen principal" : "Marcar como principal"}
                    >
                      <svg
                        className={`w-5 h-5 ${img.isPrimary ? "text-yellow-400" : "text-gray-400 opacity-0 group-hover:opacity-100"}`}
                        fill={img.isPrimary ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                        />
                      </svg>
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar imagen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Reorder arrows */}
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleReorder(index, "up")}
                          className="p-0.5 rounded bg-black/50 text-white hover:bg-black/70"
                          title="Mover atrás"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      )}
                      {index < totalCount - 1 && (
                        <button
                          type="button"
                          onClick={() => handleReorder(index, "down")}
                          className="p-0.5 rounded bg-black/50 text-white hover:bg-black/70"
                          title="Mover adelante"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Pending badge */}
                    {img.isPending && (
                      <div className="absolute bottom-0.5 left-0.5">
                        <span className="text-[10px] font-medium bg-green-500 text-white px-1 rounded">
                          Nueva
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add button */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || loadingImages}
                  className="h-20 w-20 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-500 transition-colors text-gray-400 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleAddFiles}
              className="hidden"
            />

            {!canAddMore && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Máximo {MAX_IMAGES} imágenes alcanzado.
              </p>
            )}

            {totalCount > 0 && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Toca la estrella para marcar como imagen principal. JPG, PNG, WebP o GIF (max 5 MB c/u).
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                Nombre <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label>
                SKU <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder={sku && !skuManuallyEdited ? sku : "Ej: HELM-001"}
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  setSkuManuallyEdited(true);
                }}
                required
                disabled={loading}
              />
              {sku && !skuManuallyEdited && !isEditing && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Auto-generado. Haz clic para editar.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Codigo de Barras</Label>
              <Input
                type="text"
                placeholder="Codigo de barras"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label>
                Precio Unitario <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                step={0.01}
                min="0"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Descripcion</Label>
            <TextArea
              placeholder="Descripcion del producto"
              rows={3}
              value={description}
              onChange={setDescription}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step={0.01}
                min="0"
                disabled={loading}
              />
            </div>
            <div>
              <Label>
                Categoria <span className="text-error-500">*</span>
              </Label>
              <Select
                options={categoryOptions}
                placeholder="Seleccionar categoria"
                onChange={setCategoryId}
                defaultValue={categoryId}
              />
            </div>
            <div>
              <Label>Proveedor</Label>
              <Select
                options={supplierOptions}
                placeholder="Seleccionar proveedor"
                onChange={setSupplierId}
                defaultValue={supplierId}
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <Checkbox
                label="Producto activo"
                checked={isActive}
                onChange={setIsActive}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading || !name || !unitPrice || !categoryId || !sku}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
