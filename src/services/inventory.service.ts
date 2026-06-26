import api from './api';
import type { 
  InventoryItem, 
  InventoryItemCreate, 
  InventoryItemUpdate,
  InventoryTransferRequest 
} from '../types';

/**
 * Inventory service
 * 
 * Handles all inventory-related API calls.
 */
export const inventoryService = {
  /**
   * Get all inventory items (with optional pagination)
   */
  getAll: async (skip = 0, limit = 100): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>('/inventory', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * Get inventory items by warehouse
   */
  getByWarehouse: async (warehouseId: number): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>(`/inventory/warehouse/${warehouseId}`);
    return response.data;
  },

  /**
   * Create a new inventory item
   */
  create: async (data: InventoryItemCreate): Promise<InventoryItem> => {
    const response = await api.post<InventoryItem>('/inventory', data);
    return response.data;
  },

  /**
   * Update an existing inventory item
   */
  update: async (id: number, data: InventoryItemUpdate): Promise<InventoryItem> => {
    const response = await api.put<InventoryItem>(`/inventory/${id}`, data);
    return response.data;
  },

  /**
   * Transfer inventory between warehouses
   */
  transfer: async (data: InventoryTransferRequest): Promise<void> => {
    await api.post('/inventory/transfer', data);
  },
};
