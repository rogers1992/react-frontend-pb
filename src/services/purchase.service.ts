import api from './api';
import type { Order, OrderCreate } from '../types';

/**
 * Purchases service (maps to backend /api/purchases -> orders table)
 *
 * Handles all purchase-order API calls. Two-step workflow:
 *   1) create()  -> status='pending' (no inventory change)
 *   2) receive() -> status='received', inventory auto-increments
 */
export const purchaseService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    supplier_id?: number;
    warehouse_id?: number;
  }): Promise<Order[]> => {
    const response = await api.get<Order[]>('/purchases', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/purchases/${id}`);
    return response.data;
  },

  create: async (data: OrderCreate): Promise<Order> => {
    const response = await api.post<Order>('/purchases', data);
    return response.data;
  },

  receive: async (id: number): Promise<Order> => {
    const response = await api.patch<Order>(`/purchases/${id}/receive`);
    return response.data;
  },

  cancel: async (id: number): Promise<Order> => {
    const response = await api.patch<Order>(`/purchases/${id}/cancel`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/purchases/${id}`);
  },
};