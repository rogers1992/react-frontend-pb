import api from "./api";
import type { ExpenseCategory, Expense, ExpenseCreate, ExpenseUpdate, IncomeStatement } from "../types";

class ExpenseService {
  async getCategories(): Promise<ExpenseCategory[]> {
    const { data } = await api.get<ExpenseCategory[]>("/expenses/categories");
    return data;
  }

  async getExpenses(params?: {
    skip?: number;
    limit?: number;
    warehouse_id?: number;
    category_id?: number;
    from_date?: string;
    to_date?: string;
    is_recurring?: boolean;
  }): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>("/expenses", { params });
    return data;
  }

  async createExpense(expense: ExpenseCreate): Promise<Expense> {
    const { data } = await api.post<Expense>("/expenses", expense);
    return data;
  }

  async updateExpense(id: number, expense: ExpenseUpdate): Promise<Expense> {
    const { data } = await api.put<Expense>(`/expenses/${id}`, expense);
    return data;
  }

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  }

  async getIncomeStatement(params?: {
    warehouse_id?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<IncomeStatement> {
    const { data } = await api.get<IncomeStatement>("/expenses/income-statement", { params });
    return data;
  }
}

export const expenseService = new ExpenseService();
