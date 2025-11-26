import api from './apiService';
import { Income as IncomeType, IncomeStats as IncomeStatsType, IncomeDetail as IncomeDetailType, IncomeFilter as IncomeFilterType, IncomeItem as IncomeItemType } from '@/types/income';

export type { Income, IncomeStats, IncomeDetail, IncomeFilter, IncomeItem } from '@/types/income';

export interface IncomesByPeriod {
  client: string;
  path: string;
  amounts: Record<string, number>;
}

export interface IncomesByClient {
  client_id: string;
  client_name: string;
  client_tax_id: string;
  amount: number;
  total_amount: number;
  count: number;
  path: string;
  has_data: boolean;
}

export interface IncomesByCenter {
  center_id: number;
  center_name: string;
  center_code: string;
  amount: number;
  count: number;
  path: string;
  has_data: boolean;
}

export interface ExtendedIncomeData {
  id: number;
  income_type_id: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
  totalIncomes?: number;
  pendingIncomes?: number;
  recentIncomes?: IncomeItemType[];
  byPeriodData?: IncomesByPeriod[];
  byClientData?: IncomesByClient[];
  byCenterData?: IncomesByCenter[];
}

export const incomeApiService = {
  async getIncomeData(filters: IncomeFilterType): Promise<ExtendedIncomeData> {
    try {
      const params = new URLSearchParams();
      if (filters.periodType) params.append('period_type', filters.periodType);
      if (filters.year) params.append('year', filters.year);
      if (filters.cost_center_id && filters.cost_center_id.toString() !== 'all') {
        params.append('cost_center_id', filters.cost_center_id.toString());
      }
      if (filters.clientId && filters.clientId !== 'all') {
        params.append('client_id', filters.clientId);
      }
      if (filters.state && filters.state !== 'all') {
        params.append('status', filters.state);
      }

      const response = await api.get<{
        success: boolean;
        data: {
          summary: { total_incomes: number; pending_count: number };
          items: IncomeItemType[];
          by_client: Array<{ client_tax_id: string; client_name: string; total_amount: number; income_count: number }>;
          by_center: Array<{ center_id?: number; center_name: string; center_code?: string; total_amount: number; income_count: number }>;
        };
      }>(`/ingresos/explore?${params.toString()}`);

      if (!response.success) throw new Error('Error al obtener datos de ingresos');

      const { summary, items, by_client, by_center } = response.data;

      const byClientData: IncomesByClient[] = by_client.map((client, index) => ({
        client_id: client.client_tax_id || index.toString(),
        client_name: client.client_name || 'Sin Cliente',
        client_tax_id: client.client_tax_id || '',
        amount: parseFloat(client.total_amount.toString()) || 0,
        total_amount: parseFloat(client.total_amount.toString()) || 0,
        count: client.income_count || 0,
        path: `/ingresos/client/${encodeURIComponent(client.client_tax_id || 'sin-cliente')}`,
        has_data: (client.income_count || 0) > 0
      }));

      const byCenterData: IncomesByCenter[] = by_center.map((center, index) => ({
        center_id: center.center_id || index + 1,
        center_name: center.center_name || 'Sin Centro',
        center_code: center.center_code || '',
        amount: parseFloat(center.total_amount.toString()) || 0,
        count: center.income_count || 0,
        path: `/ingresos/center/${center.center_id || index + 1}`,
        has_data: (center.income_count || 0) > 0
      }));

      return {
        id: 0,
        income_type_id: 0,
        organization_id: '',
        created_at: '',
        updated_at: '',
        totalIncomes: parseFloat(summary.total_incomes.toString()) || 0,
        pendingIncomes: summary.pending_count || 0,
        recentIncomes: items.slice(0, 10),
        byPeriodData: [],
        byClientData,
        byCenterData
      };
    } catch (error) {
      console.error('Error fetching income data:', error);
      throw new Error('Error al cargar datos de ingresos');
    }
  },

  async getIncomesByPeriod(filters: IncomeFilterType): Promise<IncomesByPeriod[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          const backendKey = key === 'cost_center_id' ? 'cost_center_id' : key === 'clientId' ? 'client_id' : key;
          params.append(backendKey, value.toString());
        }
      });

      const response = await api.get<{
        success: boolean;
        data: Array<{ client_name: string; client_tax_id: string; period_key: string; total_amount: number }>;
      }>(`/ingresos/by-period?${params.toString()}`);

      if (!response.success || !response.data || response.data.length === 0) return [];

      const groupedData: Record<string, Record<string, number>> = {};
      response.data.forEach(item => {
        const client = item.client_name || 'Sin Cliente';
        const periodKey = item.period_key;
        const amount = parseFloat(item.total_amount.toString()) || 0;
        if (!groupedData[client]) groupedData[client] = {};
        groupedData[client][periodKey] = amount;
      });

      return Object.entries(groupedData).map(([client, amounts]) => ({
        client,
        path: `/ingresos/client/${encodeURIComponent(client)}`,
        amounts
      }));
    } catch (error) {
      console.error('Error fetching incomes by period:', error);
      return [];
    }
  },

  async getFilterOptions(): Promise<{
    projects: Array<{value: string, label: string}>;
    costCenters: Array<{value: string, label: string}>;
    clients: Array<{value: string, label: string}>;
    statuses: Array<{value: string, label: string}>;
  }> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          cost_centers: Array<{ id: number; name: string; code?: string; type?: string }>;
          clients: Array<{ tax_id: string; name: string }>;
          statuses: Array<{ value: string; label: string }>;
        };
      }>('/ingresos/dimensions');
      if (!response.success) throw new Error('Error al obtener opciones de filtros');
      const { cost_centers, clients, statuses } = response.data;
      return {
        projects: cost_centers.map(cc => ({ value: cc.id.toString(), label: cc.name })),
        costCenters: cost_centers.map(cc => ({ value: cc.id.toString(), label: `${cc.code ? cc.code + ' - ' : ''}${cc.name}${cc.type ? ` (${cc.type})` : ''}` })),
        clients: clients.map(client => ({ value: client.tax_id, label: `${client.name} (${client.tax_id})` })),
        statuses: statuses.map(status => ({ value: status.value, label: status.label }))
      };
    } catch (error) {
      return { projects: [], costCenters: [], clients: [], statuses: [] };
    }
  },

  async getIncomes(filters: any = {}): Promise<{ data: IncomeType[]; pagination: any; stats: IncomeStatsType }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, value.toString());
    });
    const response = await api.get<{ success: boolean; data: IncomeType[]; pagination: any; stats: IncomeStatsType }>(`/ingresos?${params.toString()}`);
    if (!response.success) throw new Error('Error al obtener ingresos');
    return { data: response.data, pagination: response.pagination, stats: response.stats };
  },

  async getIncomeById(id: number): Promise<IncomeDetailType> {
    const response = await api.get<{ success: boolean; data: IncomeDetailType }>(`/ingresos/${id}`);
    return response.data;
  },

  async createIncome(data: any): Promise<IncomeType> {
    const response = await api.post<{ success: boolean; data: IncomeType }>('/ingresos', data);
    if (!response.success) throw new Error('Error al crear ingreso');
    return response.data;
  },

  async createIncomesBatch(data: any[]): Promise<any> {
    const response = await api.post<{ success: boolean; data: any }>('/ingresos/batch', data);
    if (!response.success) throw new Error('Error al crear ingresos en lote');
    return response.data;
  },

  async updateIncome(id: number, data: any): Promise<IncomeType> {
    const response = await api.put<{ success: boolean; data: IncomeType }>(`/ingresos/${id}`, data);
    if (!response.success) throw new Error('Error al actualizar ingreso');
    return response.data;
  },

  async updateIncomeStatus(id: number, state: string): Promise<IncomeType> {
    const response = await api.put<{ success: boolean; data: IncomeType }>(`/ingresos/${id}/state`, { state });
    if (!response.success) throw new Error('Error al actualizar estado del ingreso');
    return response.data;
  },

  async deleteIncome(id: number): Promise<boolean> {
    const response = await api.delete<{ success: boolean }>(`/ingresos/${id}`);
    return response.success;
  },

  async exportIncomes(filters: any = {}): Promise<Blob> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, value.toString());
    });
    const response = await api.request({ url: `/ingresos/export?${params.toString()}`, method: 'GET', responseType: 'blob' });
    return response.data;
  },

  async getIncomeStats(filters: any = {}): Promise<IncomeStatsType> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, value.toString());
    });
    const response = await api.get<{ success: boolean; data: IncomeStatsType }>(`/ingresos/stats?${params.toString()}`);
    if (!response.success) throw new Error('Error al obtener estadísticas de ingresos');
    return response.data;
  }
};

export default incomeApiService;