import api from './api';
import type { Supplier, SupplierCreate } from '../types';

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: SupplierCreate): Promise<Supplier> => {
    const response = await api.post<Supplier>('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: SupplierCreate): Promise<Supplier> => {
    const response = await api.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
