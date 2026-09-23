import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { customerService } from "../../services/customer.service";
import { warehouseService } from "../../services/warehouse.service";
import { inventoryService } from "../../services/inventory.service";
import { salesService } from "../../services/sales.service";
import { cajaService } from "../../services/caja.service";
import { getErrorMessage } from "../../utils/error";
import type { Product, Category, Customer, Warehouse, Sale, SaleCreate } from "../../types";
import { TAX_RATE } from "../../utils/tax";
import ProductGrid from "./components/ProductGrid";
import OrderSummary from "./components/OrderSummary";
import CartDrawer from "../../components/common/CartDrawer";
import ReceiptModal from "./components/ReceiptModal";
import SaleReviewModal from "./components/SaleReviewModal";
import ProductDetailModal from "./components/ProductDetailModal";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export default function SalesIndex() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [warehouseInventory, setWarehouseInventory] = useState<Map<number, number>>(new Map());
  const [showReview, setShowReview] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [hasOpenSession, setHasOpenSession] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const invAbortRef = useRef<AbortController | null>(null);
  const prevWarehouseIdRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    try {
      const [productsData, categoriesData, customersData, warehousesData] = await Promise.all([
        productService.getAll(0, 1000, undefined, undefined, signal),
        categoryService.getAll(signal),
        customerService.getAll(0, 100, undefined, undefined, undefined, signal),
        warehouseService.getAll(0, 100, signal),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData);
      setCustomers(customersData.items);

      // Filter warehouses by user's assigned warehouses
      const userWarehouseIds = user?.warehouse_ids;
      const userWarehouses = userWarehouseIds && userWarehouseIds.length > 0
        ? warehousesData.filter((w) => userWarehouseIds.includes(w.id))
        : [];
      setWarehouses(userWarehouses);
    } catch (error) {
      if (axios.isCancel(error)) return;
      const message = getErrorMessage(error, "Error al cargar los datos.");
      showToast({ type: "error", message });
    }
  }, [showToast, user]);

  useEffect(() => {
    fetchData();
    return () => { abortRef.current?.abort(); };
  }, [fetchData]);

  // Fetch inventory for selected warehouse
  const fetchInventory = useCallback(async (signal?: AbortSignal) => {
    if (!selectedWarehouse) return;
    try {
      const items = await inventoryService.getByWarehouse(selectedWarehouse.id, signal);
      const map = new Map<number, number>();
      items.forEach((item) => map.set(item.product_id, item.quantity));
      setWarehouseInventory(map);
    } catch {
      if (signal?.aborted) return;
      setWarehouseInventory(new Map());
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    if (!selectedWarehouse) return;
    invAbortRef.current?.abort();
    const controller = new AbortController();
    invAbortRef.current = controller;
    fetchInventory(controller.signal);
    return () => { controller.abort(); };
  }, [selectedWarehouse, fetchInventory]);

  // Check for open cash session when warehouse is selected
  useEffect(() => {
    if (!selectedWarehouse) {
      setHasOpenSession(true);
      return;
    }
    const checkSession = async () => {
      try {
        await cajaService.getCurrentSession();
        setHasOpenSession(true);
      } catch {
        setHasOpenSession(false);
      }
    };
    checkSession();
  }, [selectedWarehouse]);

  // Clear cart when switching warehouses (not on initial selection)
  useEffect(() => {
    if (prevWarehouseIdRef.current !== null && prevWarehouseIdRef.current !== selectedWarehouse?.id) {
      setCart([]);
      setSelectedCustomer(null);
      setPaymentMethod("");
      setNotes("");
      setShowValidation(false);
    }
    prevWarehouseIdRef.current = selectedWarehouse?.id ?? null;
  }, [selectedWarehouse]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity, discount: 0 }];
    });
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  }, []);

  const handleAddToCartFromModal = useCallback((product: Product, quantity: number) => {
    const currentInCart = cart.find((i) => i.product.id === product.id)?.quantity ?? 0;
    const stock = warehouseInventory.get(product.id) ?? 0;
    const available = Math.max(0, stock - currentInCart);

    if (quantity > available) {
      showToast({ type: "error", message: `Stock insuficiente. Disponible: ${available}` });
      return;
    }

    addToCart(product, quantity);
    showToast({ type: "success", message: `${quantity} x ${product.name} agregado al carrito.` });
  }, [addToCart, showToast, cart, warehouseInventory]);

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
    setPaymentMethod("");
    setNotes("");
    setShowValidation(false);
  }, []);

  const openReview = useCallback(() => {
    if (cart.length === 0) return;
    setShowValidation(true);
    if (!selectedWarehouse) {
      showToast({ type: "error", message: "Selecciona un almacén." });
      return;
    }
    if (!paymentMethod) {
      showToast({ type: "error", message: "Selecciona un método de pago." });
      return;
    }
    setShowReview(true);
  }, [cart.length, selectedWarehouse, paymentMethod, showToast]);

  const confirmSale = useCallback(async () => {
    setShowReview(false);
    if (!selectedWarehouse) {
      showToast({ type: "error", message: "Selecciona un almacen antes de confirmar la venta." });
      return;
    }
    if (paymentMethod === "efectivo" && !hasOpenSession) {
      showToast({ type: "error", message: "Debes abrir caja antes de registrar ventas en efectivo." });
      return;
    }
    try {
      setSubmitting(true);
      const saleData: SaleCreate = {
        customer_id: selectedCustomer?.id ?? 1,
        warehouse_id: selectedWarehouse.id,
        payment_method: paymentMethod,
        notes: notes || undefined,
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
      fetchInventory();
    } catch (error) {
      const message = getErrorMessage(error, "Error al registrar la venta.");
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }, [cart, selectedCustomer, selectedWarehouse, paymentMethod, notes, showToast, hasOpenSession, fetchInventory]);

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

  const cartTotal = useMemo(() =>
    cart.reduce((sum, item) => {
      const price = typeof item.product.unit_price === "string"
        ? parseFloat(item.product.unit_price)
        : item.product.unit_price;
      const discount = item.discount || 0;
      const subtotal = price * item.quantity - discount;
      return sum + subtotal + subtotal * TAX_RATE;
    }, 0),
    [cart]
  );

  const customerName = useMemo(() => {
    if (selectedCustomer) return `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
    return "Cliente General";
  }, [selectedCustomer]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

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
            warehouseSelected={selectedWarehouse !== null}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
            cart={cart}
          />
        </div>
        <div className="xl:col-span-1">
          <CartDrawer
            itemCount={cart.reduce((s, i) => s + i.quantity, 0)}
            total={cartTotal}
          >
            <OrderSummary
              cart={cart}
              customers={customers}
              selectedCustomer={selectedCustomer}
              selectedWarehouse={selectedWarehouse}
              warehouses={warehouses}
              paymentMethod={paymentMethod}
              submitting={submitting}
              warehouseInventory={warehouseInventory}
              showValidation={showValidation}
              notes={notes}
              hasNoWarehouses={warehouses.length === 0}
              hasOpenSession={hasOpenSession}
              onSelectCustomer={setSelectedCustomer}
              onSelectWarehouse={setSelectedWarehouse}
              onUpdateCart={updateCartItem}
              onRemoveFromCart={removeFromCart}
              onPaymentMethodChange={setPaymentMethod}
              onNotesChange={setNotes}
              onConfirm={openReview}
              onCancel={handleCancel}
            />
          </CartDrawer>
        </div>
      </div>

      <SaleReviewModal
        isOpen={showReview}
        cart={cart}
        selectedCustomer={selectedCustomer}
        selectedWarehouse={selectedWarehouse}
        paymentMethod={paymentMethod}
        notes={notes}
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

      <ProductDetailModal
        isOpen={showProductDetail}
        product={selectedProduct}
        category={selectedProduct ? categoryMap.get(selectedProduct.category_id) : undefined}
        stockQuantity={selectedProduct ? (warehouseInventory.get(selectedProduct.id) ?? 0) : 0}
        availableStock={selectedProduct
          ? Math.max(0, (warehouseInventory.get(selectedProduct.id) ?? 0) - (cart.find((i) => i.product.id === selectedProduct.id)?.quantity ?? 0))
          : 0}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={handleAddToCartFromModal}
      />
    </>
  );
}
