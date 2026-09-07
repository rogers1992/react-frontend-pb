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
  warehouse_ids?: number[];
}

export const dashboardService = {
  getSummary: async (params: { warehouse_ids?: number[]; from?: string; to?: string; signal?: AbortSignal } = {}): Promise<DashboardSummary> => {
    const { signal, ...rest } = params;
    const queryParams: Record<string, unknown> = {};
    if (rest.warehouse_ids?.length) queryParams.warehouse_id = rest.warehouse_ids;
    if (rest.from) queryParams.from = rest.from;
    if (rest.to) queryParams.to = rest.to;
    const response = await api.get<DashboardSummary>('/dashboard/summary', {
      params: queryParams,
      signal,
    });
    return response.data;
  },

  getSalesTrend: async (
    period: TrendPeriod = 'daily',
    range: DateRangeParams = {},
    signal?: AbortSignal,
  ): Promise<SalesTrendPoint[]> => {
    const params: Record<string, unknown> = { period, ...range };
    if (range.warehouse_ids?.length) {
      params.warehouse_id = range.warehouse_ids;
      delete params.warehouse_ids;
    }
    const response = await api.get<SalesTrendPoint[]>(
      '/dashboard/sales-trend',
      { params, signal },
    );
    return response.data;
  },

  getInventoryStatus: async (signal?: AbortSignal): Promise<InventoryStatusSummary> => {
    const response = await api.get<InventoryStatusSummary>(
      '/dashboard/inventory-status',
      { signal },
    );
    return response.data;
  },

  getTopProducts: async (
    range: DateRangeParams = {},
    limit = 10,
    signal?: AbortSignal,
  ): Promise<TopProductRow[]> => {
    const params: Record<string, unknown> = { ...range, limit };
    if (range.warehouse_ids?.length) {
      params.warehouse_id = range.warehouse_ids;
      delete params.warehouse_ids;
    }
    const response = await api.get<TopProductRow[]>(
      '/dashboard/top-products',
      { params, signal },
    );
    return response.data;
  },

  getTopCustomers: async (
    range: DateRangeParams = {},
    limit = 10,
    signal?: AbortSignal,
  ): Promise<TopCustomerRow[]> => {
    const response = await api.get<TopCustomerRow[]>(
      '/dashboard/top-customers',
      { params: { ...range, limit }, signal },
    );
    return response.data;
  },

  getPaymentMethods: async (
    range: DateRangeParams = {},
    signal?: AbortSignal,
  ): Promise<PaymentMethodRow[]> => {
    const params: Record<string, unknown> = { ...range };
    if (range.warehouse_ids?.length) {
      params.warehouse_id = range.warehouse_ids;
      delete params.warehouse_ids;
    }
    const response = await api.get<PaymentMethodRow[]>(
      '/dashboard/payment-methods',
      { params, signal },
    );
    return response.data;
  },
};