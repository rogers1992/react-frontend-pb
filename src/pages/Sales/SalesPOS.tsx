import { useState, useEffect, useCallback, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useToast } from "../../context/ToastContext";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { customerService } from "../../services/customer.service";
import { warehouseService } from "../../services/warehouse.service";
import { inventoryService } from "../../services/inventory.service";
import { salesService } from "../../services/sales.service";
import { getErrorMessage } from "../../utils/error";
import type { Product, Category, Customer, Warehouse, Sale, SaleCreate } from "../../types";
import ProductGrid from "./components/ProductGrid";
import OrderSummary from "./components/OrderSummary";
import ReceiptModal from "./components/ReceiptModal";
import SaleReviewModal from "./components/SaleReviewModal";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export default function SalesIndex() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [warehouseInventory, setWarehouseInventory] = useState<Map<number, number>>(new Map());
  const [showReview, setShowReview] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  const fetchData = useCallback(async () => {
    try {
      const [productsData, categoriesData, customersData, warehousesData] = await Promise.all([
        productService.getAll(0, 1000),
        categoryService.getAll(),
        customerService.getAll(0, 100),
        warehouseService.getAll(0, 100),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData);
      setCustomers(customersData.items);
      setWarehouses(warehousesData);

      // Auto-select first warehouse
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

  // Fetch inventory for selected warehouse
  useEffect(() => {
    if (!selectedWarehouse) return;
    const fetchInventory = async () => {
      try {
        const items = await inventoryService.getByWarehouse(selectedWarehouse.id);
        const map = new Map<number, number>();
        items.forEach((item) => map.set(item.product_id, item.quantity));
        setWarehouseInventory(map);
      } catch {
        setWarehouseInventory(new Map());
      }
    };
    fetchInventory();
  }, [selectedWarehouse]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  }, []);

  const updateCartItem = useCallback((productId: number, quantity: number, discount: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity, discount } : i))
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod("efectivo");
  }, []);

  const openReview = useCallback(() => {
    if (cart.length === 0) return;
    setShowReview(true);
  }, [cart.length]);

  const confirmSale = useCallback(async () => {
    setShowReview(false);
    try {
      setSubmitting(true);
      const saleData: SaleCreate = {
        customer_id: selectedCustomer?.id ?? 1,
        payment_method: paymentMethod,
        notes: undefined,
        items: cart.map((item) => {
          const price = typeof item.product.unit_price === "string" ? parseFloat(item.product.unit_price) : item.product.unit_price;
          return {
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: price,
            discount: item.discount || 0,
          };
        }),
      };
      const sale = await salesService.create(saleData);
      setLastSale(sale);
      setShowReceipt(true);
      showToast({ type: "success", message: "Venta registrada exitosamente." });
    } catch (error) {
      const message = getErrorMessage(error, "Error al registrar la venta.");
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }, [cart, selectedCustomer, paymentMethod, showToast]);

  const handleNewSale = useCallback(() => {
    setShowReceipt(false);
    setLastSale(null);
    clearCart();
  }, [clearCart]);

  const handleCancel = useCallback(() => {
    if (cart.length > 0) {
      if (window.confirm("¿Está seguro de cancelar la venta? Se perderán los productos agregados.")) {
        clearCart();
      }
    }
  }, [cart.length, clearCart]);

  const customerName = useMemo(() => {
    if (selectedCustomer) return `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
    return "Cliente General";
  }, [selectedCustomer]);

  return (
    <>
      <PageMeta title="Ventas | Paraiso Biker" description="Punto de venta - Paraiso Biker" />
      <PageBreadcrumb pageTitle="Ventas" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProductGrid
            products={products}
            categories={categories}
            warehouseInventory={warehouseInventory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
          />
        </div>
        <div className="xl:col-span-1">
          <OrderSummary
            cart={cart}
            customers={customers}
            selectedCustomer={selectedCustomer}
            selectedWarehouse={selectedWarehouse}
            warehouses={warehouses}
            paymentMethod={paymentMethod}
            submitting={submitting}
            warehouseInventory={warehouseInventory}
            onSelectCustomer={setSelectedCustomer}
            onSelectWarehouse={setSelectedWarehouse}
            onUpdateCart={updateCartItem}
            onRemoveFromCart={removeFromCart}
            onPaymentMethodChange={setPaymentMethod}
            onConfirm={openReview}
            onCancel={handleCancel}
          />
        </div>
      </div>

      <SaleReviewModal
        isOpen={showReview}
        cart={cart}
        selectedCustomer={selectedCustomer}
        selectedWarehouse={selectedWarehouse}
        paymentMethod={paymentMethod}
        onConfirm={confirmSale}
        onBack={() => setShowReview(false)}
      />

      <ReceiptModal
        isOpen={showReceipt}
        sale={lastSale}
        customerName={customerName}
        onClose={() => setShowReceipt(false)}
        onNewSale={handleNewSale}
      />
    </>
  );
}
