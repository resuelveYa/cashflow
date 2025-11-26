// src/services/costsService.ts
import api from './apiService';

// ==========================================
// DEFINIR OrdenCompra DIRECTAMENTE AQUÍ
// ==========================================

export interface OrdenCompra {
  id: number;
  name: string;
  order_number: string;
  description?: string;
  cost_center_id: number;
  account_category_id?: number;
  provider_name?: string;
  amount: number;
  date: string;
  payment_type?: string;
  state: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  center_code?: string;
  center_name?: string;
  categoria_name?: string;
  supplier_name?: string;
}

// Updated GastoFilter interface to include new filter options
export interface GastoFilter {
  // Existing filters
  projectId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  state?: string;
  emergencyLevel?: 'low' | 'medium' | 'high';

  // New filters for orden de compra
  grupoCuenta?: string;
  paymentType?: string;
  cuentaContable?: string;
  centroCostoId?: number;
  estadoPago?: string;
  tieneFactura?: boolean;
  providerId?: number;
  search?: string;
  orderNumber?: string;

  // Pagination and sorting
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface GastoImprevisto {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  authorizationId?: number;
  authorizationName?: string;
  emergencyLevel: 'low' | 'medium' | 'high';
  date: string;
  amount: number;
  state: string;
  projectId: number;
  projectName: string;
  companyId: number;
  notes: string;
}

export interface Subcontrato {
  id: number;
  name: string;
  contractor_id: number;
  contractor_name: string;
  contract_number: string;
  startDate: string;
  endDate: string;
  paymentType: string;
  paymentTerms: string;
  date: string;
  amount: number;
  state: string;
  projectId: number;
  projectName: string;
  companyId: number;
  notes?: string;
}

export interface IOrdenCompraDetail extends OrdenCompra {
  // Agregar campos adicionales si es necesario
}

export interface Cotizacion {
  id: number;
  companyId?: number;
  name: string;
  supplierName?: string;
  providerId?: number;
  date: string;
  valid_until?: string;
  state: string;
  projectName?: string;
  projectId?: number;
  amount?: number;
  is_approved?: boolean;
  notes?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CostsData {
  totalExpenses: number;
  pendingExpenses: number;
  recentExpenses: CostItem[];
  byPeriodData: CostsByPeriod[];
  byCategoryData: CostsByCategory[];
  emptyCategoriesData: CostsByCategory[];
}

export interface CostItem {
  cost_id: number;
  transaction_type: string;
  description: string;
  amount: number;
  date: string;
  period_year: number;
  period_month: number;
  status: string;
  cost_center_name: string;
  category_name: string;
  supplier_name?: string;
  employee_name?: string;
  source_type: string;
  period_key: string;
}

export interface CostsByPeriod {
  category: string;
  path: string;
  amounts: Record<string, number>;
}

export interface CostsByCategory {
  category_id: number;
  title: string;
  amount: number;
  count: number;
  path: string;
  has_data: boolean;
  category_code?: string;
  category_group?: string;
}

export interface CostsFilters {
  periodType: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  year: string;
  projectId?: string;
  costCenterId?: string;
  categoryId?: string;
  status?: string;
}

// ==========================================
// SERVICIO DE COSTOS
// ==========================================

export const costsApiService = {
  async getCostsData(filters: CostsFilters): Promise<CostsData> {
    try {
      const params = new URLSearchParams();
      
      if (filters.periodType) params.append('period_type', filters.periodType);
      if (filters.year) params.append('year', filters.year);
      if (filters.projectId && filters.projectId !== 'all') {
        params.append('cost_center_id', filters.projectId);
      }
      if (filters.costCenterId && filters.costCenterId !== 'all') {
        params.append('cost_center_id', filters.costCenterId);
      }
      if (filters.categoryId && filters.categoryId !== 'all') {
        params.append('category_id', filters.categoryId);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await api.get<{
        success: boolean;
        data: {
          summary: {
            total_expenses: number;
            pending_count: number;
          };
          items: CostItem[];
          by_category: Array<{
            category_id?: number;
            category_name: string;
            total_amount: number;
            cost_count: number;
          }>;
        };
      }>(`/costs/explore?${params.toString()}`);

      if (!response.success) {
        throw new Error('Error al obtener datos de costos');
      }

      const { summary, items, by_category } = response.data;

      const byCategoryData: CostsByCategory[] = by_category.map((cat, index) => ({
        category_id: cat.category_id || index + 1,
        title: cat.category_name || 'Sin Categoría',
        amount: parseFloat(cat.total_amount.toString()) || 0,
        count: cat.cost_count || 0,
        path: `/costs/category/${encodeURIComponent(cat.category_name || 'sin-categoria')}`,
        has_data: (cat.cost_count || 0) > 0
      }));

      const recentExpenses = items.slice(0, 10);

      return {
        totalExpenses: parseFloat(summary.total_expenses.toString()) || 0,
        pendingExpenses: summary.pending_count || 0,
        recentExpenses,
        byPeriodData: [],
        byCategoryData,
        emptyCategoriesData: []
      };

    } catch (error) {
      console.error('Error fetching costs data:', error);
      throw new Error('Error al cargar datos de costos');
    }
  },

  async getCostsByPeriod(filters: CostsFilters): Promise<CostsByPeriod[]> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          const backendKey = key === 'costCenterId' ? 'cost_center_id' : 
                           key === 'categoryId' ? 'category_id' : key;
          params.append(backendKey, value.toString());
        }
      });

      const response = await api.get<{
        success: boolean;
        data: Array<{
          category_name: string;
          period_key: string;
          total_amount: number;
        }>;
      }>(`/costs/by-period?${params.toString()}`);

      if (!response.success) {
        throw new Error('Error al obtener datos por período');
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      const groupedData: Record<string, Record<string, number>> = {};
      
      response.data.forEach(item => {
        const category = item.category_name || 'Sin Categoría';
        const periodKey = item.period_key;
        const amount = parseFloat(item.total_amount.toString()) || 0;

        if (!groupedData[category]) {
          groupedData[category] = {};
        }
        
        groupedData[category][periodKey] = amount;
      });

      const result = Object.entries(groupedData).map(([category, amounts]) => ({
        category,
        path: `/costs/category/${encodeURIComponent(category)}`,
        amounts
      }));

      return result;

    } catch (error) {
      console.error('Error fetching costs by period:', error);
      return [];
    }
  },

  async getFilterOptions(): Promise<{
    projects: Array<{value: string, label: string}>;
    costCenters: Array<{value: string, label: string}>;
    categories: Array<{value: string, label: string}>;
    statuses: Array<{value: string, label: string}>;
  }> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          cost_centers: Array<{
            id: number;
            name: string;
            type?: string;
          }>;
          categories: Array<{
            id: number;
            name: string;
            group_name?: string;
          }>;
          statuses: Array<{
            value: string;
            label: string;
          }>;
        };
      }>('/costs/dimensions');

      if (!response.success) {
        throw new Error('Error al obtener opciones de filtros');
      }

      const { cost_centers, categories, statuses } = response.data;

      return {
        projects: cost_centers.map(cc => ({
          value: cc.id.toString(),
          label: cc.name
        })),
        costCenters: cost_centers.map(cc => ({
          value: cc.id.toString(),
          label: `${cc.name}${cc.type ? ` (${cc.type})` : ''}`
        })),
        categories: categories.map(cat => ({
          value: cat.id.toString(),
          label: cat.group_name ? `${cat.group_name}: ${cat.name}` : cat.name
        })),
        statuses: statuses.map(status => ({
          value: status.value,
          label: status.label
        }))
      };

    } catch (error) {
      console.error('Error fetching filter options:', error);
      return {
        projects: [],
        costCenters: [],
        categories: [],
        statuses: []
      };
    }
  },

  // Métodos de OrdenCompra - Comentados porque el endpoint no existe en el backend
  async getOrdenesCompra(filters: GastoFilter = {}): Promise<OrdenCompra[]> {
    console.warn('⚠️ getOrdenesCompra: Endpoint /purchase-orders no implementado en backend');
    return [];
  },

  async getOrdenCompraById(id: number): Promise<IOrdenCompraDetail | null> {
    console.warn('⚠️ getOrdenCompraById: Endpoint /ordenes-compra no implementado en backend');
    return null;
  },

  async createOrdenCompra(data: Partial<OrdenCompra>): Promise<OrdenCompra> {
    throw new Error('⚠️ createOrdenCompra: Endpoint /purchase-orders no implementado en backend');
  },

  async updateOrdenCompra(id: number, data: Partial<IOrdenCompraDetail>): Promise<IOrdenCompraDetail> {
    throw new Error('⚠️ updateOrdenCompra: Endpoint no implementado en backend');
  },

  async deleteOrdenCompra(id: number): Promise<boolean> {
    console.warn('⚠️ deleteOrdenCompra: Endpoint /purchase-orders no implementado en backend');
    return false;
  },

  async exportOrdenesCompra(filters: GastoFilter = {}): Promise<Blob> {
    throw new Error('⚠️ exportOrdenesCompra: Endpoint no implementado en backend');
  },

  // Métodos de Cotizaciones - Comentados porque el endpoint no existe
  async getCotizaciones(filters: GastoFilter = {}): Promise<Cotizacion[]> {
    console.warn('⚠️ getCotizaciones: Endpoint /cotizaciones no implementado en backend');
    return [];
  },

  async getCotizacionById(id: number): Promise<Cotizacion> {
    throw new Error('⚠️ getCotizacionById: Endpoint no implementado en backend');
  },

  async createCotizacion(data: Omit<Cotizacion, 'id'>): Promise<Cotizacion> {
    throw new Error('⚠️ createCotizacion: Endpoint no implementado en backend');
  },

  async updateCotizacion(id: number, data: Partial<Cotizacion>): Promise<Cotizacion> {
    throw new Error('⚠️ updateCotizacion: Endpoint no implementado en backend');
  },

  async deleteCotizacion(id: number): Promise<boolean> {
    console.warn('⚠️ deleteCotizacion: Endpoint no implementado en backend');
    return false;
  },

  async getDebugData(): Promise<any> {
    try {
      const response = await api.get<{
        success: boolean;
        debug_data: any;
        analysis: any;
        recommendations: string[];
      }>('/costs/debug');

      if (!response.success) {
        throw new Error('Error al obtener datos de debug');
      }

      return response;
    } catch (error) {
      console.error('Error fetching debug data:', error);
      throw new Error('Error al cargar datos de debug');
    }
  }
};

export const gastosApiService = costsApiService;
export default costsApiService;