// src/services/expenseDataService.ts
import apiService from './apiService';
import type { ExpenseData, ExpenseFilters } from '../types/expense';

// We might need to define ExpenseData and ExpenseFilters if they don't exist in types
// For now, using Partial and any to maintain flexibility

const BASE_URL = ''; // apiService already adds /api prefix

export const expenseDataService = {
  async getAll(filters?: any): Promise<{ data: any[]; pagination: any }> {
    const response = await apiService.get<any>(`${BASE_URL}/expenses`, { params: filters });
    return {
      data: response.data,
      pagination: response.pagination
    };
  },

  async getById(id: number): Promise<any> {
    const response = await apiService.get<{ data: any }>(`${BASE_URL}/expenses/${id}`);
    return response.data;
  },

  async create(data: Partial<any>): Promise<{ id: number; warnings?: any[] }> {
    const response = await apiService.post<{ data: { id: number }; warnings?: any[] }>(`${BASE_URL}/expenses`, data);
    return {
      id: response.data.id,
      warnings: response.warnings
    };
  },

  async update(id: number, data: Partial<any>): Promise<{ warnings?: any[] }> {
    const response = await apiService.put<{ warnings?: any[] }>(`${BASE_URL}/expenses/${id}`, data);
    return { warnings: response.warnings };
  },

  async delete(id: number): Promise<void> {
    await apiService.delete(`${BASE_URL}/expenses/${id}`);
  },

  async getStats(expenseTypeId?: number, dateFrom?: string, dateTo?: string): Promise<any[]> {
    const response = await apiService.get<{ data: any[] }>(`${BASE_URL}/expenses/stats`, {
      params: { expense_type_id: expenseTypeId, date_from: dateFrom, date_to: dateTo }
    });
    return response.data;
  },

  async getByStatus(typeId: number): Promise<any[]> {
    const response = await apiService.get<{ data: any[] }>(`${BASE_URL}/expense-types/${typeId}/expenses-by-status`);
    return response.data;
  },

  async bulkCreate(expenses: Partial<any>[]): Promise<any> {
    const response = await apiService.post<any>(`${BASE_URL}/expenses/bulk`, { expenses });
    return response;
  }
};

export default expenseDataService;