import api from './api';
import type { Warehouse, WarehouseCreate, WarehouseUpdate } from '../types';

export const warehouseService = {
  getAll: async (skip = 0, limit = 100, signal?: AbortSignal): Promise<Warehouse[]> => {
    const response = await api.get<Warehouse[]>('/warehouses', { params: { skip, limit }, signal });
    return response.data;
  },

  getById: async (id: number): Promise<Warehouse> => {
    const response = await api.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  create: async (data: WarehouseCreate): Promise<Warehouse> => {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  update: async (id: number, data: WarehouseUpdate): Promise<Warehouse> => {
    const response = await api.put<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};
