import { useState, useEffect, type FormEvent, useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Checkbox from "../../../components/form/input/Checkbox";
import { resolveImageUrl } from "../../../services/api";
import type { Product, ProductCreate, ProductUpdate, Category, Supplier } from "../../../types";

interface ProductFormSubmitPayload {
  data: ProductCreate | ProductUpdate;
  imageFile: File | null;
  removeExistingImage: boolean;
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

  // Image state:
  // - pendingImageFile: a File the user just selected (preview shown locally)
  // - previewUrl: object URL for the pending file (cleaned up on change)
  // - showExisting: whether to display the product's existing image_url
  // - removeExistingImage: user clicked "Quitar" on an existing image
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showExisting, setShowExisting] = useState(true);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku ?? "");
      setBarcode(product.barcode ?? "");
      setDescription(product.description ?? "");
      setUnitPrice(String(product.unit_price));
      setWeight(product.weight ? String(product.weight) : "");
      setCategoryId(String(product.category_id));
      setSupplierId(product.supplier_id ? String(product.supplier_id) : "");
      setIsActive(product.is_active);
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
    }
    // Reset image state whenever the form opens/changes target product.
    setPendingImageFile(null);
    setPreviewUrl(null);
    setShowExisting(true);
    setRemoveExistingImage(false);
  }, [product, isOpen]);

  // Clean up object URL when file changes or modal closes.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPendingImageFile(file);
    setPreviewUrl(url);
    setShowExisting(false); // preview overrides existing display
    setRemoveExistingImage(false); // selecting a new file isn't a removal
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingImageFile(null);
    setPreviewUrl(null);
    setShowExisting(false);
    if (product?.image_url) {
      // There's an existing server image the user wants gone.
      setRemoveExistingImage(true);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name,
      sku: sku || "",
      barcode: barcode || undefined,
      description: description || undefined,
      unit_price: parseFloat(unitPrice),
      weight: weight ? parseFloat(weight) : undefined,
      category_id: parseInt(categoryId),
      supplier_id: supplierId ? parseInt(supplierId) : null,
    };

    if (isEditing) {
      onSubmit({
        data: { ...payload, is_active: isActive } as ProductUpdate,
        imageFile: pendingImageFile,
        removeExistingImage,
      });
    } else {
      onSubmit({
        data: payload as ProductCreate,
        imageFile: pendingImageFile,
        removeExistingImage,
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

  // What should the preview slot show?
  const existingResolved = resolveImageUrl(product?.image_url);
  const displayImageUrl =
    previewUrl ?? (showExisting ? existingResolved : null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
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
          {/* Image upload zone */}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              {displayImageUrl ? (
                <img
                  src={displayImageUrl}
                  alt={name || "Producto"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <svg
                    className="size-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <Label>Imagen del producto</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {pendingImageFile ? "Cambiar imagen" : "Subir imagen"}
                </Button>
                {displayImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="text-error-500 hover:border-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                  >
                    Quitar
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleSelectFile}
                className="hidden"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Toca para subir una foto o tomarla con la camara. JPG, PNG, WebP o GIF (max 5 MB).
              </p>
            </div>
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
              <Label>SKU</Label>
              <Input
                type="text"
                placeholder="Ej: HELM-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={loading}
              />
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
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading || !name || !unitPrice || !categoryId}
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