import api from './api';
import type {
  DashboardSummary,
  InventoryStatusSummary,
  PaymentMethodRow,
  SalesTrendPoint,
  TopCustomerRow,
  TopProductRow,
} from '../types';

export type TrendPeriod = 'daily' | 'weekly' | 'monthly';

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  getSalesTrend: async (
    period: TrendPeriod = 'daily',
    range: DateRangeParams = {},
  ): Promise<SalesTrendPoint[]> => {
    const response = await api.get<SalesTrendPoint[]>(
      '/dashboard/sales-trend',
      { params: { period, ...range } },
    );
    return response.data;
  },

  getInventoryStatus: async (): Promise<InventoryStatusSummary> => {
    const response = await api.get<InventoryStatusSummary>(
      '/dashboard/inventory-status',
    );
    return response.data;
  },

  getTopProducts: async (
    range: DateRangeParams = {},
    limit = 10,
  ): Promise<TopProductRow[]> => {
    const response = await api.get<TopProductRow[]>(
      '/dashboard/top-products',
      { params: { ...range, limit } },
    );
    return response.data;
  },

  getTopCustomers: async (
    range: DateRangeParams = {},
    limit = 10,
  ): Promise<TopCustomerRow[]> => {
    const response = await api.get<TopCustomerRow[]>(
      '/dashboard/top-customers',
      { params: { ...range, limit } },
    );
    return response.data;
  },

  getPaymentMethods: async (
    range: DateRangeParams = {},
  ): Promise<PaymentMethodRow[]> => {
    const response = await api.get<PaymentMethodRow[]>(
      '/dashboard/payment-methods',
      { params: { ...range } },
    );
    return response.data;
  },
};