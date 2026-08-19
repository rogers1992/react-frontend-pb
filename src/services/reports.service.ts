import api from './api';
import type {
  ABCReportRow,
  CustomerReportRow,
  InventoryReportRow,
  ProductReportRow,
  ProfitReportRow,
  ProfitSummaryRow,
  PurchaseReportRow,
  ReportType,
  SalesReportRow,
  SellerReportRow,
  SlowMovingReportRow,
} from '../types';
import { AxiosError } from 'axios';

export interface SalesReportFilters {
  from?: string;
  to?: string;
  seller_id?: number;
  customer_id?: number;
}

export interface PurchaseReportFilters {
  from?: string;
  to?: string;
  status?: string;
}

export interface ProductReportFilters {
  from?: string;
  to?: string;
}

export interface DateRangeFilters {
  from?: string;
  to?: string;
}

export interface ProfitSummaryFilters extends DateRangeFilters {
  period?: "daily" | "weekly" | "monthly";
}

export interface ExportParams {
  from?: string;
  to?: string;
  seller_id?: number;
  customer_id?: number;
  status?: string;
  threshold_days?: number;
}

/**
 * When making a request with responseType: 'blob', axios error responses
 * also come back as Blobs - so getErrorMessage can't read the JSON
 * `detail` field. This helper parses the error blob and re-throws a
 * normalized error whose `response.data` looks like a regular API error,
 * so the existing error pipeline works unchanged.
 */
async function normalizeBlobError(error: AxiosError): Promise<never> {
  const blob = error.response?.data as Blob | undefined;
  if (blob && blob.type && blob.type.includes('application/json')) {
    try {
      const text = await blob.text();
      const parsed = JSON.parse(text);
      // Reconstruct a real AxiosError so downstream getErrorMessage sees
      // `error.response.data.detail` like any other request.
      const wrapped = new AxiosError(
        parsed?.detail ?? 'Error al exportar',
        error.code,
        error.config,
        error.request,
        { ...error.response, data: parsed } as AxiosError['response'],
      );
      throw wrapped;
    } catch (e) {
      if (e instanceof AxiosError) throw e;
      // fall through and rethrow the original blob-error
    }
  }
  throw error;
}

export const reportsService = {
  getSales: async (filters: SalesReportFilters = {}): Promise<SalesReportRow[]> => {
    const response = await api.get<SalesReportRow[]>('/reports/sales', {
      params: filters,
    });
    return response.data;
  },

  getInventory: async (): Promise<InventoryReportRow[]> => {
    const response = await api.get<InventoryReportRow[]>('/reports/inventory');
    return response.data;
  },

  getPurchases: async (
    filters: PurchaseReportFilters = {},
  ): Promise<PurchaseReportRow[]> => {
    const response = await api.get<PurchaseReportRow[]>('/reports/purchases', {
      params: filters,
    });
    return response.data;
  },

  getCustomers: async (): Promise<CustomerReportRow[]> => {
    const response = await api.get<CustomerReportRow[]>('/reports/customers');
    return response.data;
  },

  getProducts: async (
    filters: ProductReportFilters = {},
  ): Promise<ProductReportRow[]> => {
    const response = await api.get<ProductReportRow[]>('/reports/products', {
      params: filters,
    });
    return response.data;
  },

  getProfit: async (
    filters: DateRangeFilters = {},
  ): Promise<ProfitReportRow[]> => {
    const response = await api.get<ProfitReportRow[]>('/reports/profit', {
      params: filters,
    });
    return response.data;
  },

  getABC: async (
    filters: DateRangeFilters = {},
  ): Promise<ABCReportRow[]> => {
    const response = await api.get<ABCReportRow[]>('/reports/abc', {
      params: filters,
    });
    return response.data;
  },

  getSlowMoving: async (
    thresholdDays: number = 90,
  ): Promise<SlowMovingReportRow[]> => {
    const response = await api.get<SlowMovingReportRow[]>(
      '/reports/slow-moving',
      { params: { threshold_days: thresholdDays } },
    );
    return response.data;
  },

  getSellers: async (
    filters: DateRangeFilters = {},
  ): Promise<SellerReportRow[]> => {
    const response = await api.get<SellerReportRow[]>('/reports/sellers', {
      params: filters,
    });
    return response.data;
  },

  getProfitSummary: async (
    filters: ProfitSummaryFilters = {},
  ): Promise<ProfitSummaryRow[]> => {
    const response = await api.get<ProfitSummaryRow[]>('/reports/profit-summary', {
      params: filters,
    });
    return response.data;
  },

  exportCsv: async (
    report: ReportType,
    params: ExportParams = {},
  ): Promise<Blob> => {
    try {
      const response = await api.get(`/reports/export`, {
        params: { report, ...params },
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      await normalizeBlobError(error as AxiosError);
      // Unreachable: normalizeBlobError always throws.
      throw error;
    }
  },
};