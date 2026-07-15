import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useToast } from "../../context/ToastContext";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { supplierService } from "../../services/supplier.service";
import { warehouseService } from "../../services/warehouse.service";
import { purchaseService } from "../../services/purchase.service";
import { getErrorMessage } from "../../utils/error";
import type { Product, Category, Supplier, Warehouse, OrderCreate } from "../../types";
import PurchaseProductGrid from "./components/PurchaseProductGrid";
import PurchaseCartSummary from "./components/PurchaseCartSummary";
import PurchaseReviewModal from "./components/PurchaseReviewModal";

interface CartItem {
  product: Product;
  quantity: number;
  unit_cost: number;
}

export default function PurchasePOS() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [expectedDate, setExpectedDate] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  const fetchData = useCallback(async () => {
    try {
      const [productsData, categoriesData, suppliersData, warehousesData] = await Promise.all([
        productService.getAll(0, 1000),
        categoryService.getAll(),
        supplierService.getAll(),
        warehouseService.getAll(0, 100),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);

      if (warehousesData.length > 0) {
        setSelectedWarehouse(warehousesData[0]);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar los datos.");
      showToast({ type: "error", message });
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const inCartIds = useMemo(() => new Set(cart.map((i) => i.product.id)), [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      const defaultCost =
        typeof product.unit_price === "string"
          ? parseFloat(product.unit_price)
          : product.unit_price;
      return [...prev, { product, quantity: 1, unit_cost: defaultCost }];
    });
  }, []);

  const updateCartItem = useCallback(
    (productId: number, quantity: number, unitCost: number) => {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity, unit_cost: unitCost } : i,
        ),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedSupplier(null);
    setExpectedDate("");
  }, []);

  const openReview = useCallback(() => {
    if (cart.length === 0) return;
    if (!selectedWarehouse) {
      showToast({ type: "error", message: "Selecciona un almacén." });
      return;
    }
    setShowReview(true);
  }, [cart.length, selectedWarehouse, showToast]);

  const confirmPurchase = useCallback(async () => {
    setShowReview(false);
    try {
      setSubmitting(true);
      const orderData: OrderCreate = {
        supplier_id: selectedSupplier?.id ?? 0,
        warehouse_id: selectedWarehouse!.id,
        expected_date: expectedDate || undefined,
        notes: undefined,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_cost:
            typeof item.unit_cost === "number"
              ? item.unit_cost
              : parseFloat(item.unit_cost as unknown as string),
        })),
      };
      await purchaseService.create(orderData);
      showToast({
        type: "success",
        message: "Orden de compra registrada. Estado: Pendiente.",
      });
      clearCart();
      navigate("/purchases");
    } catch (error) {
      const message = getErrorMessage(error, "Error al registrar la compra.");
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }, [cart, selectedSupplier, selectedWarehouse, expectedDate, showToast, clearCart, navigate]);

  const handleCancel = useCallback(() => {
    if (cart.length > 0) {
      if (
        window.confirm(
          "¿Está seguro de cancelar la compra? Se perderán los productos agregados.",
        )
      ) {
        clearCart();
      }
    } else {
      navigate("/purchases");
    }
  }, [cart.length, clearCart, navigate]);

  return (
    <>
      <PageMeta
        title="Nueva Compra | Paraiso Biker"
        description="Registro de compra - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Nueva Compra" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PurchaseProductGrid
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
            inCartIds={inCartIds}
          />
        </div>
        <div className="xl:col-span-1">
          <PurchaseCartSummary
            cart={cart}
            suppliers={suppliers}
            warehouses={warehouses}
            selectedSupplier={selectedSupplier}
            selectedWarehouse={selectedWarehouse}
            expectedDate={expectedDate}
            submitting={submitting}
            onSelectSupplier={setSelectedSupplier}
            onSelectWarehouse={setSelectedWarehouse}
            onExpectedDateChange={setExpectedDate}
            onUpdateCart={updateCartItem}
            onRemoveFromCart={removeFromCart}
            onConfirm={openReview}
            onCancel={handleCancel}
          />
        </div>
      </div>

      <PurchaseReviewModal
        isOpen={showReview}
        cart={cart}
        selectedSupplier={selectedSupplier}
        selectedWarehouse={selectedWarehouse}
        expectedDate={expectedDate}
        onConfirm={confirmPurchase}
        onBack={() => setShowReview(false)}
      />
    </>
  );
}