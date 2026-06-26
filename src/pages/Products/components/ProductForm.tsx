import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Checkbox from "../../../components/form/input/Checkbox";
import type { Product, ProductCreate, ProductUpdate, Category, Supplier } from "../../../types";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreate | ProductUpdate) => void;
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
  }, [product, isOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name,
      sku: sku || undefined,
      barcode: barcode || undefined,
      description: description || undefined,
      unit_price: parseFloat(unitPrice),
      weight: weight ? parseFloat(weight) : undefined,
      category_id: parseInt(categoryId),
      supplier_id: supplierId ? parseInt(supplierId) : undefined,
    };

    if (isEditing) {
      onSubmit({ ...payload, is_active: isActive } as ProductUpdate);
    } else {
      onSubmit(payload as ProductCreate);
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
