import { api } from './apiService';
import type {
  DashboardSummary,
  CashFlowPeriod,
  TypeSummary,
  CategorySummary
} from '../types/dashboard';

export interface ConsolidatedData {
  income: {
    summary: DashboardSummary;
    byType: TypeSummary[];
    byCategory: CategorySummary[];
    cashFlow: CashFlowPeriod[];
  };
  expense: {
    summary: DashboardSummary;
    byType: TypeSummary[];
    byCategory: CategorySummary[];
    cashFlow: CashFlowPeriod[];
  };
}

export interface FinancialKPIs {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  profitMargin: number;
  incomeGrowth: number;
  expenseGrowth: number;
  cashFlowGrowth: number;
  incomeCount: number;
  expenseCount: number;
}

export interface OperationalMetrics {
  costCentersCount: number;
  incomeTypesCount: number;
  expenseTypesCount: number;
  totalTransactions: number;
}

export interface TopTransaction {
  id: number;
  name: string;
  type_name: string;
  category_name: string;
  amount: number;
  date: string;
}

class ConsolidatedDashboardService {
  async fetchAllData(filters: { date_from?: string; date_to?: string; cost_center_id?: number } = {}): Promise<ConsolidatedData> {
    try {
      const [
        incomeSummary,
        incomeByType,
        incomeByCategory,
        incomeCashFlow,
        expenseSummary,
        expenseByType,
        expenseByCategory,
        expenseCashFlow
      ] = await Promise.all([
        this.getIncomeSummary(filters),
        this.getIncomeByType(filters),
        this.getIncomeByCategory(filters),
        this.getIncomeCashFlow(filters),
        this.getExpenseSummary(filters),
        this.getExpenseByType(filters),
        this.getExpenseByCategory(filters),
        this.getExpenseCashFlow(filters)
      ]);

      return {
        income: {
          summary: incomeSummary,
          byType: incomeByType,
          byCategory: incomeByCategory,
          cashFlow: incomeCashFlow
        },
        expense: {
          summary: expenseSummary,
          byType: expenseByType,
          byCategory: expenseByCategory,
          cashFlow: expenseCashFlow
        }
      };
    } catch (error) {
      console.error('Error fetching consolidated data:', error);
      throw error;
    }
  }

  calculateKPIs(data: ConsolidatedData): FinancialKPIs {
    const totalIncome = data.income.summary.total_amount || 0;
    const totalExpense = data.expense.summary.total_amount || 0;
    const netCashFlow = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    const incomeGrowth = data.income.summary.trend_percentage || 0;
    const expenseGrowth = data.expense.summary.trend_percentage || 0;
    const cashFlowGrowth = incomeGrowth - expenseGrowth;

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      profitMargin,
      incomeGrowth,
      expenseGrowth,
      cashFlowGrowth,
      incomeCount: data.income.summary.total_count || 0,
      expenseCount: data.expense.summary.total_count || 0
    };
  }

  async getOperationalMetrics(filters: { cost_center_id?: number } = {}): Promise<OperationalMetrics> {
    try {
      // api.get() retorna SOLO response.data → o sea: { data: [...] }
      const [incomeTypes, expenseTypes, costCenters] = await Promise.all([
        api.get<{ data: any[] }>('/income-types', { params: { only_active: true } }),
        api.get<{ data: any[] }>('/expense-types', { params: { only_active: true } }),
        api.get<{ data: any[] }>('/cost-centers')
      ]);

      const incomeTypesArr = Array.isArray(incomeTypes.data) ? incomeTypes.data : [];
      const expenseTypesArr = Array.isArray(expenseTypes.data) ? expenseTypes.data : [];
      const costCentersArr = Array.isArray(costCenters.data) ? costCenters.data : [];

      const costCentersCount = filters.cost_center_id
        ? 1
        : costCentersArr.filter((cc: any) => cc.is_active !== false).length;

      return {
        costCentersCount,
        incomeTypesCount: incomeTypesArr.length,
        expenseTypesCount: expenseTypesArr.length,
        totalTransactions: 0
      };
    } catch (error) {
      console.error('Error fetching operational metrics:', error);
      return {
        costCentersCount: 0,
        incomeTypesCount: 0,
        expenseTypesCount: 0,
        totalTransactions: 0
      };
    }
  }

  async getTopTransactions(
    limit: number = 5,
    filters: { date_from?: string; date_to?: string } = {}
  ): Promise<{ income: TopTransaction[]; expense: TopTransaction[] }> {
    try {
      const [incomeTop, expenseTop] = await Promise.all([
        api.get<{ data: TopTransaction[] }>('/incomes/dashboard/top-transactions', {
          params: { ...filters, limit }
        }).catch(() => ({ data: [] })),

        api.get<{ data: TopTransaction[] }>('/expenses/dashboard/top-transactions', {
          params: { ...filters, limit }
        }).catch(() => ({ data: [] }))
      ]);

      return {
        income: incomeTop.data ?? [],
        expense: expenseTop.data ?? []
      };
    } catch (error) {
      console.error('Error fetching top transactions:', error);
      return { income: [], expense: [] };
    }
  }

  // -----------------------------------------------------
  //  ENDPOINTS PRINCIPALES → api.get() devuelve SOLO .data
  // -----------------------------------------------------

  private async getIncomeSummary(filters: any) {
    const res = await api.get<{ data: DashboardSummary }>('/incomes/dashboard/summary', { params: filters });
    return res.data;
  }

  private async getIncomeByType(filters: any) {
    const res = await api.get<{ data: TypeSummary[] }>('/incomes/dashboard/by-type', { params: filters });
    return res.data;
  }

  private async getIncomeByCategory(filters: any) {
    const res = await api.get<{ data: CategorySummary[] }>('/incomes/dashboard/by-category', { params: filters });
    return res.data;
  }

  private async getIncomeCashFlow(filters: any) {
    const res = await api.get<{ data: CashFlowPeriod[] }>('/incomes/dashboard/cash-flow', { params: filters });
    return res.data;
  }

  private async getExpenseSummary(filters: any) {
    const res = await api.get<{ data: DashboardSummary }>('/expenses/dashboard/summary', { params: filters });
    return res.data;
  }

  private async getExpenseByType(filters: any) {
    const res = await api.get<{ data: TypeSummary[] }>('/expenses/dashboard/by-type', { params: filters });
    return res.data;
  }

  private async getExpenseByCategory(filters: any) {
    const res = await api.get<{ data: CategorySummary[] }>('/expenses/dashboard/by-category', { params: filters });
    return res.data;
  }

  private async getExpenseCashFlow(filters: any) {
    const res = await api.get<{ data: CashFlowPeriod[] }>('/expenses/dashboard/cash-flow', { params: filters });
    return res.data;
  }
}

export const consolidatedDashboardService = new ConsolidatedDashboardService();
