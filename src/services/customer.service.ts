import api from './api';
import type { Customer, CustomerCreate, CustomerUpdate } from '../types';

/**
 * Customer service
 * 
 * Handles all customer-related API calls.
 */
export const customerService = {
  /**
   * Get all customers (with optional pagination)
   */
  getAll: async (skip = 0, limit = 100): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers', {
      params: { skip, limit }
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
   * Delete a customer
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
