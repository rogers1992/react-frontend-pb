export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Record<string, string[]>; // {"products": ["read", "create"], "sales": ["read"]}
  is_system: boolean;
  created_at: string;
}

/**
 * Constants used by the permission matrix editor.
 * Must stay in sync with backend VALID_RESOURCES / VALID_ACTIONS
 * (backend/app/schemas/role.py)
 */
export const VALID_RESOURCES = [
  "products",
  "inventory",
  "sales",
  "customers",
  "users",
  "roles",
  "reports",
  "categories",
  "suppliers",
] as const;

export const VALID_ACTIONS = ["read", "create", "update", "delete"] as const;

export const RESOURCE_LABELS: Record<string, string> = {
  products: "Productos",
  inventory: "Inventario",
  sales: "Ventas",
  customers: "Clientes",
  users: "Usuarios",
  roles: "Roles",
  reports: "Reportes",
  categories: "Categorías",
  suppliers: "Proveedores",
};

export const ACTION_LABELS: Record<string, string> = {
  read: "Lectura",
  create: "Crear",
  update: "Actualizar",
  delete: "Eliminar",
};

export type PermissionResource = (typeof VALID_RESOURCES)[number];
export type PermissionAction = (typeof VALID_ACTIONS)[number];

/**
 * Data needed to create a role (sent to API)
 */
export interface RoleCreate {
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
}

/**
 * Partial update for an existing Role (sent to API)
 * All fields are optional, only include the ones you want to update
 */
export interface RoleUpdate {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
}

// USER TYPES
/**
 * Basic user information(shared across user types)
 */
export interface UserBase {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}
/**
 * User with full role information (returned after login)
 * thsi is what we store in AuthContext
 */
export interface User extends UserBase {
  id: number;
  role_id: number;
  role?: Role;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Login Request payload
 */

export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response from backend API
 */

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// =========================
// USER MANAGEMENT TYPES
// =========================

/**
 * User with role always populated (returned from /api/users endpoints)
 */
export interface UserWithRole extends User {
  role: Role;
}

/**
 * Data needed to create a user (sent to API)
 * Username is immutable after creation; password is set at creation only.
 */
export interface UserCreate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  role_id: number;
}

/**
 * Partial update for an existing User (sent to API)
 * Username and password are NOT editable here.
 * Use resetPassword for password changes.
 */
export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id?: number;
}

export interface UserPasswordReset {
  new_password: string;
}

export interface UserToggleActive {
  is_active: boolean;
}

//=========================
// PRODUCT TYPES
//=========================

/**
 * Product with all fields (returned from API)
 */

export interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  unit_price: number;
  weight?: number;
  image_url?: string;
  category_id: number;
  supplier_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Data need to create a product (sent to API)
 */

export interface ProductCreate {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  unit_price: number;
  weight?: number;
  category_id: number;
  supplier_id?: number | null;
}

/**
 * Partial update for existing Product (sent to API)
 * All fields are optional, only include the ones you want to update
 */

export interface ProductUpdate {
  name?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  unit_price: number;
  weight?: number;
  image_url?: string | null;
  category_id?: number;
  supplier_id?: number;
  is_active?: boolean;
}

// =========================
// CATEGORY TYPES
// =========================

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
}

/**
 * Partial update for an existing Category (sent to API)
 * All fields are optional, only include the ones you want to update
 */

export interface CategoryUpdate {
  name?: string;
  description?: string;
}

// =========================
// SUPPLIER TYPES
// =========================

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface SupplierCreate {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Partial update for an existing Supplier (sent to API)
 * All fields are optional, only include the ones you want to update
 */

export interface SupplierUpdate {
  name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// =========================
// CUSTOMER TYPES
// =========================

/**
 * Customer with all fields (returned from API)
 */

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  created_at: string;
}

/**
 * Data needed to create a customer (sent to API)
 */

export interface CustomerCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

/**
 * Partial update for existing Customer (sent to API)
 * All fields are optional, only include the ones you want to update
 */

export interface CustomerUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

// =========================
// WAREHOUSE TYPES
// =========================

export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export interface WarehouseCreate {
  name: string;
  location?: string;
}

export interface WarehouseUpdate {
  name?: string;
  location?: string;
  is_active?: boolean;
}

// =========================
// INVENTORY TYPES
// =========================

export interface InventoryItem {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  reserved_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  location?: string;
  last_updated: string;
}

export interface InventoryItemCreate {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  location?: string;
}

export interface InventoryItemUpdate {
  quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  location?: string;
}

export interface InventoryTransferRequest {
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  quantity: number;
}

// =========================
// SALES TYPES
// =========================

/**
 * Sale Item record with all fields (returned from API)
 */

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

/**
 * Data need to create a sale record (sent to API)
 */

export interface SaleItemCreate {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount?: number;
}

/**
 * Sale record with all fields (returned from API)
 */

export interface Sale {
  id: number;
  customer_id: number;
  user_id: number;
  payment_method: string;
  notes?: string;
  total_amount: number;
  tax_amount?: number;
  sale_date: string;
  status: string;
  items: SaleItem[];
}

/**
 * Data needed to create a sale record (sent to API)
 */

export interface SaleCreate {
  customer_id: number;
  payment_method: string;
  notes?: string;
  items: SaleItemCreate[];
}

// =========================
// NOTIFICATION TYPES
// =========================

export type NotificationType = "low_stock" | "new_sale" | string;

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

//=========================
// GENERIC API RESPONSE TYPES
//=========================

/**
 * standard error response form backend API
 */

export interface ApiError {
  detail: string;
}

/**
 * Pagination metadata if backend  adds it later
 */

export interface PaginationMeta<T> {
  items: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}
