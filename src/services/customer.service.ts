import api from './api';
import type {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  Loyalty,
  LoyaltyAdjust,
  CustomerSale,
  PaginationMeta,
} from '../types';

/**
 * Customer service
 *
 * Handles all customer-related API calls.
 */
export const customerService = {
  /**
   * Get all customers (with optional pagination and filters)
   */
  getAll: async (
    skip = 0,
    limit = 10,
    search?: string,
    email?: string,
    isActive?: boolean,
  ): Promise<PaginationMeta<Customer>> => {
    const response = await api.get<PaginationMeta<Customer>>('/customers', {
      params: { skip, limit, search, email, is_active: isActive },
    });
    return response.data;
  },

  /**
   * Get a single customer by ID
   */
  getById: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  /**
   * Create a new customer
   */
  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  /**
   * Update an existing customer
   */
  update: async (id: number, data: CustomerUpdate): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Toggle customer active/inactive status
   */
  toggleActive: async (id: number): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Delete a customer permanently
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  /**
   * Get customer loyalty information
   */
  getLoyalty: async (id: number): Promise<Loyalty> => {
    const response = await api.get<Loyalty>(`/customers/${id}/loyalty`);
    return response.data;
  },

  /**
   * Update customer loyalty (set points/tier directly)
   */
  updateLoyalty: async (
    id: number,
    data: { points?: number; tier?: string },
  ): Promise<Loyalty> => {
    const response = await api.patch<Loyalty>(`/customers/${id}/loyalty`, data);
    return response.data;
  },

  /**
   * Adjust customer loyalty points (add/subtract with auto tier calc)
   */
  adjustLoyalty: async (id: number, data: LoyaltyAdjust): Promise<Loyalty> => {
    const response = await api.post<Loyalty>(
      `/customers/${id}/loyalty/adjust`,
      data,
    );
    return response.data;
  },

  /**
   * Get customer sales history
   */
  getSales: async (
    id: number,
    skip = 0,
    limit = 10,
  ): Promise<CustomerSale[]> => {
    const response = await api.get<CustomerSale[]>(`/customers/${id}/sales`, {
      params: { skip, limit },
    });
    return response.data;
  },
};
