import api from './api';
import type {
  CashRegister,
  CashSession,
  CashSessionOpen,
  CashSessionClose,
  CashMovement,
  CashMovementCreate,
  CashSessionSummary,
  WarehouseCajaSummary,
} from '../types';

export const cajaService = {
  getRegisters: async (): Promise<CashRegister[]> => {
    const response = await api.get<CashRegister[]>('/cash-registers');
    return response.data;
  },

  createRegister: async (data: { name: string; warehouse_id?: number }): Promise<CashRegister> => {
    const response = await api.post<CashRegister>('/cash-registers', data);
    return response.data;
  },

  updateRegister: async (id: number, data: { name?: string; warehouse_id?: number; is_active?: boolean }): Promise<CashRegister> => {
    const response = await api.put<CashRegister>(`/cash-registers/${id}`, data);
    return response.data;
  },

  getCurrentSession: async (): Promise<CashSession> => {
    const response = await api.get<CashSession>('/cash-sessions/current');
    return response.data;
  },

  getOpenSessions: async (): Promise<CashSession[]> => {
    const response = await api.get<CashSession[]>('/cash-sessions/open');
    return response.data;
  },

  openSession: async (data: CashSessionOpen): Promise<CashSession> => {
    const response = await api.post<CashSession>('/cash-sessions', data);
    return response.data;
  },

  closeSession: async (id: number, data: CashSessionClose): Promise<CashSession> => {
    const response = await api.post<CashSession>(`/cash-sessions/${id}/close`, data);
    return response.data;
  },

  getSessionHistory: async (skip = 0, limit = 50): Promise<CashSession[]> => {
    const response = await api.get<CashSession[]>('/cash-sessions', {
      params: { skip, limit },
    });
    return response.data;
  },

  getSessionSummary: async (id: number): Promise<CashSessionSummary> => {
    const response = await api.get<CashSessionSummary>(`/cash-sessions/${id}/summary`);
    return response.data;
  },

  addMovement: async (data: CashMovementCreate): Promise<CashMovement> => {
    const response = await api.post<CashMovement>('/cash-movements', data);
    return response.data;
  },

  getMovements: async (): Promise<CashMovement[]> => {
    const response = await api.get<CashMovement[]>('/cash-movements');
    return response.data;
  },

  getWarehouseSummary: async (): Promise<WarehouseCajaSummary[]> => {
    const response = await api.get<WarehouseCajaSummary[]>('/cash-sessions/warehouse-summary');
    return response.data;
  },
};
