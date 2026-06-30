import api from "./api";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  PaginationMeta,
} from "../types";

/**
 * Product service
 *
 * Handles all product-related API calls.
 * Follows REST conventions:
 * - GET for reading
 * - POST for creating
 * - PUT for updating
 * - DELETE for removing
 */
export const productService = {
  /**
   * Get all products (with optional pagination)
   *
   * @param skip - Number of records to skip (for pagination)
   * @param limit - Maximum number of records to return
   * @returns Array of products
   *
   * Example:
   * const products = await productService.getAll(0, 50);
   * // Gets first 50 products
   */
  getAll: async (skip = 0, limit = 10, search?: string): Promise<PaginationMeta<Product>> => {
    const response = await api.get<PaginationMeta<Product>>("/products", {
      params: { skip, limit, search },
    });
    return response.data;
  },

  /**
   * Get a single product by ID
   *
   * @param id - Product ID
   * @returns Product details
   *
   * Example:
   * const product = await productService.getById(123);
   */
  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Get product by barcode
   *
   * Useful for POS (Point of Sale) barcode scanning
   *
   * @param barcode - Product barcode
   * @returns Product details
   */
  getByBarcode: async (barcode: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/barcode/${barcode}`);
    return response.data;
  },

  /**
   * Create a new product
   *
   * @param data - Product creation data
   * @returns Created product with ID and timestamps
   *
   * Example:
   * const newProduct = await productService.create({
   *   name: 'Motorcycle Helmet',
   *   sku: 'HELM-001',
   *   unit_price: 150.00,
   *   category_id: 1,
   *   supplier_id: 2
   * });
   */
  create: async (data: ProductCreate): Promise<Product> => {
    const response = await api.post<Product>("/products", data);
    return response.data;
  },

  /**
   * Update an existing product
   *
   * @param id - Product ID to update
   * @param data - Partial update data (only fields to change)
   * @returns Updated product
   *
   * Example:
   * const updated = await productService.update(123, {
   *   unit_price: 175.00  // Only update price
   * });
   */
  update: async (id: number, data: ProductUpdate): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product (soft delete - marks as inactive)
   *
   * @param id - Product ID to delete
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  /**
   * Upload (or replace) the product image.
   *
   * Two-step flow: call this AFTER create/update so we have the product id.
   * Returns the saved image URL (server-relative path like "/uploads/products/...").
   */
  uploadImage: async (id: number, file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ image_url: string }>(
      `/products/${id}/image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /**
   * Remove the product image. Leaves image_url = null on the product.
   */
  removeImage: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/products/${id}/image`,
    );
    return response.data;
  },
};
