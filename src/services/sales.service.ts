import api from './api';
import type { Sale, SaleCreate } from '../types';

/**
 * Sales service
 * 
 * Handles all sales-related API calls.
 */
export const salesService = {
  /**
   * Get all sales (with optional pagination)
   */
  getAll: async (skip = 0, limit = 100): Promise<Sale[]> => {
    const response = await api.get<Sale[]>('/sales', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * Get a single sale by ID
   */
  getById: async (id: number): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  /**
   * Create a new sale
   * 
   * This endpoint:
   * - Creates the sale record
   * - Creates sale items
   * - Deducts inventory
   *     - Calculates tax (configurable)
   * - Returns complete sale with items
   */
  create: async (data: SaleCreate): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },
};
