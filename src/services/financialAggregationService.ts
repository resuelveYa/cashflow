// src/services/financialAggregationService.ts

// Módulos contables eliminados - Sistema genérico SaaS
// import { getRemuneracionesByPeriod } from './CC/remuneracionesService';
// import { previsionalesService } from './CC/previsionalesService';
// import { getFixedCosts } from './CC/fixedCostsService';
// import { getItemsByAccountCategory, ItemFilters, PurchaseOrderItem } from './CC/ordenesCompraItemService';
// import { factoringService } from './factoringService';
// import { accountCategoriesService, AccountCategoryType, AccountCategory } from './accountCategoriesService';

import { FinancialPeriod } from '../components/tables/FinancialTable';

// Tipos locales para compatibilidad
enum AccountCategoryType {
  MANO_OBRA = 'mano_obra',
  MAQUINARIA = 'maquinaria',
  MATERIALES = 'materiales',
  COMBUSTIBLES = 'combustibles',
  GASTOS_GENERALES = 'gastos_generales'
}

interface AccountCategory {
  id: number;
  code: string;
  name: string;
  type: AccountCategoryType;
  group_name?: string;
}

export interface FinancialDataByPeriod {
  remuneraciones: Record<string, number>;
  factoring: Record<string, number>;
  previsionales: Record<string, number>;
  costosFijos: Record<string, number>;
  // Nuevas categorías dinámicas basadas en account_categories
  [categoryKey: string]: Record<string, number>;
}

export interface CategoryFinancialData {
  [categoryKey: string]: Record<string, number>;
}

export interface ExpandedFinancialDataByPeriod extends FinancialDataByPeriod {
  // Removed 'accountCategories' to avoid type conflict with index signature
}

export interface FinancialAggregationOptions {
  periods: FinancialPeriod[];
  year: number;
  costCenterId?: number; // Optional cost center filter
}

interface ItemFilters {
  date_from?: string;
  date_to?: string;
  [key: string]: any;
}

/**
 * Service to handle financial data aggregation from multiple sources
 */
export class FinancialAggregationService {
  /**
   * Helper function to determine period ID from a date
   * Supports weekly, monthly, quarterly, and annual periods
   */
  private static getPeriodIdFromDate(date: Date, periods: FinancialPeriod[]): string | null {
    if (!periods || periods.length === 0) return null;

    const firstPeriodId = periods[0].id;

    // Determine period type from the first period ID
    if (firstPeriodId.startsWith('week-')) {
      // Weekly: Calculate week number
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const daysSinceStart = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.ceil((daysSinceStart + 1) / 7);
      return `week-${Math.min(weekNumber, 52)}`; // Cap at 52 weeks
    } else if (firstPeriodId.startsWith('month-')) {
      // Monthly: Get month number (1-12)
      return `month-${date.getMonth() + 1}`;
    } else if (firstPeriodId.startsWith('quarter-')) {
      // Quarterly: Calculate quarter (1-4)
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `quarter-${quarter}`;
    } else {
      // Annual: Just the year
      return date.getFullYear().toString();
    }
  }

  /**
   * Load all financial data for the given periods and year
   */
  static async getAllFinancialData(options: FinancialAggregationOptions): Promise<FinancialDataByPeriod> {
    const { periods, year, costCenterId } = options;

    try {
      // Load predefined categories and account categories in parallel
      const [
        remuneraciones,
        factoring,
        previsionales,
        costosFijos,
        accountCategoriesData
      ] = await Promise.allSettled([
        this.getRemuneracionesData(periods, year, costCenterId),
        this.getFactoringData(periods, year, costCenterId),
        this.getPrevisionalesData(periods, year, costCenterId),
        this.getCostosFijosData(periods, year, costCenterId),
        this.getAccountCategoriesData(periods, year, costCenterId)
      ]);

      const result: FinancialDataByPeriod = {
        remuneraciones: remuneraciones.status === 'fulfilled' ? remuneraciones.value : this.initializeEmptyPeriods(periods),
        factoring: factoring.status === 'fulfilled' ? factoring.value : this.initializeEmptyPeriods(periods),
        previsionales: previsionales.status === 'fulfilled' ? previsionales.value : this.initializeEmptyPeriods(periods),
        costosFijos: costosFijos.status === 'fulfilled' ? costosFijos.value : this.initializeEmptyPeriods(periods)
      };

      // Add account categories data
      if (accountCategoriesData.status === 'fulfilled') {
        console.log('🔄 Adding account categories data to result:', accountCategoriesData.value);
        Object.assign(result, accountCategoriesData.value);
        console.log('✅ Final result with categories:', result);
      } else {
        console.log('❌ Account categories data failed:', accountCategoriesData.reason);
      }

      return result;
    } catch (error) {
      console.error('Error loading all financial data:', error);

      // Return minimal data structure on error
      return {
        remuneraciones: this.initializeEmptyPeriods(periods),
        factoring: this.initializeEmptyPeriods(periods),
        previsionales: this.initializeEmptyPeriods(periods),
        costosFijos: this.initializeEmptyPeriods(periods)
      };
    }
  }

  /**
   * Get remuneraciones data aggregated by period
   */
  static async getRemuneracionesData(periods: FinancialPeriod[], year: number, costCenterId?: number): Promise<Record<string, number>> {
    // ELIMINADO - Módulo contable removido
    return this.initializeEmptyPeriods(periods);
  }

  /**
   * Get factoring data aggregated by period
   * LEGACY: Módulo removido - sistema genérico SaaS
   */
  static async getFactoringData(periods: FinancialPeriod[], year: number, costCenterId?: number): Promise<Record<string, number>> {
    // ELIMINADO - Factoring es un módulo legacy específico del cliente SAER
    return this.initializeEmptyPeriods(periods);
  }

  /**
   * Get previsionales data aggregated by period
   */
  static async getPrevisionalesData(periods: FinancialPeriod[], year: number, costCenterId?: number): Promise<Record<string, number>> {
    // ELIMINADO - Módulo contable removido
    return this.initializeEmptyPeriods(periods);
  }

  /**
   * Get costos fijos data aggregated by period
   */
  static async getCostosFijosData(periods: FinancialPeriod[], year: number, costCenterId?: number): Promise<Record<string, number>> {
    // ELIMINADO - Módulo contable removido
    return this.initializeEmptyPeriods(periods);
  }

  /**
   * Get account categories data aggregated by period
   * LEGACY: Módulo removido - sistema genérico SaaS
   */
  static async getAccountCategoriesData(periods: FinancialPeriod[], year: number, costCenterId?: number): Promise<CategoryFinancialData> {
    // ELIMINADO - Account categories es un módulo legacy específico del cliente SAER
    console.log('ℹ️ Account categories module disabled (legacy feature)');
    return {};
  }

  /**
   * Generate a consistent key for account categories
   */
  static generateCategoryKey(category: AccountCategory): string {
    // Use a combination of type and name to create a unique, readable key
    const typeKey = category.type.replace('_', '');
    const nameKey = category.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20); // Limit length

    return `${typeKey}_${nameKey}`;
  }

  /**
   * Get human-readable name for a category key
   */
  static getCategoryDisplayName(categoryKey: string, accountCategories: AccountCategory[]): string {
    // Try to find the matching category
    for (const category of accountCategories) {
      if (this.generateCategoryKey(category) === categoryKey) {
        return category.name;
      }
    }

    // Fallback: try to extract readable name from key
    const parts = categoryKey.split('_');
    if (parts.length >= 2) {
      return parts.slice(1).join(' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    return categoryKey;
  }

  /**
   * Get category path for navigation
   */
  static getCategoryPath(categoryKey: string, accountCategories: AccountCategory[]): string {
    // Try to find the matching category
    for (const category of accountCategories) {
      if (this.generateCategoryKey(category) === categoryKey) {
        // Return a path based on category type
        switch (category.type) {
          case AccountCategoryType.MANO_OBRA:
            return '/costos/mano-obra';
          case AccountCategoryType.MAQUINARIA:
            return '/costos/maquinaria';
          case AccountCategoryType.MATERIALES:
            return '/costos/materiales';
          case AccountCategoryType.COMBUSTIBLES:
            return '/costos/combustibles';
          case AccountCategoryType.GASTOS_GENERALES:
            return '/costos/gastos-generales';
          default:
            return '/costos/otros';
        }
      }
    }

    // Fallback path
    return '/costos/categorias';
  }

  /**
   * Get categories grouped by type for better organization
   * LEGACY: Módulo removido - sistema genérico SaaS
   */
  static async getCategoriesByType(): Promise<Record<AccountCategoryType, AccountCategory[]>> {
    // ELIMINADO - Account categories es un módulo legacy
    return {} as Record<AccountCategoryType, AccountCategory[]>;
  }

  /**
   * Initialize empty periods with 0 values
   */
  private static initializeEmptyPeriods(periods: FinancialPeriod[]): Record<string, number> {
    const amounts: Record<string, number> = {};
    periods.forEach(period => {
      amounts[period.id] = 0;
    });
    return amounts;
  }

  /**
   * Get total for a specific financial category across all periods
   */
  static getTotalForCategory(data: Record<string, number>): number {
    return Object.values(data).reduce((sum, amount) => sum + amount, 0);
  }

  /**
   * Get combined totals for all categories (including dynamic account categories)
   */
  static getCombinedTotals(financialData: FinancialDataByPeriod): Record<string, number> {
    const periods = Object.keys(financialData.remuneraciones);
    const totals: Record<string, number> = {};

    periods.forEach(periodId => {
      let periodTotal = 0;

      // Add predefined categories
      periodTotal += financialData.remuneraciones[periodId] || 0;
      periodTotal += financialData.factoring[periodId] || 0;
      periodTotal += financialData.previsionales[periodId] || 0;
      periodTotal += financialData.costosFijos[periodId] || 0;

      // Add dynamic account categories
      Object.keys(financialData).forEach(categoryKey => {
        if (!['remuneraciones', 'factoring', 'previsionales', 'costosFijos'].includes(categoryKey)) {
          const categoryData = financialData[categoryKey];
          if (categoryData && typeof categoryData === 'object') {
            periodTotal += categoryData[periodId] || 0;
          }
        }
      });

      totals[periodId] = periodTotal;
    });

    return totals;
  }

  /**
   * Get grand total across all categories and periods (including dynamic account categories)
   */
  static getGrandTotal(financialData: FinancialDataByPeriod): number {
    let grandTotal = 0;

    // Add predefined categories
    grandTotal += this.getTotalForCategory(financialData.remuneraciones);
    grandTotal += this.getTotalForCategory(financialData.factoring);
    grandTotal += this.getTotalForCategory(financialData.previsionales);
    grandTotal += this.getTotalForCategory(financialData.costosFijos);

    // Add dynamic account categories
    Object.keys(financialData).forEach(categoryKey => {
      if (!['remuneraciones', 'factoring', 'previsionales', 'costosFijos'].includes(categoryKey)) {
        const categoryData = financialData[categoryKey];
        if (categoryData && typeof categoryData === 'object') {
          grandTotal += this.getTotalForCategory(categoryData);
        }
      }
    });

    return grandTotal;
  }

  /**
   * Get all category keys from financial data (predefined + dynamic)
   */
  static getAllCategoryKeys(financialData: FinancialDataByPeriod): string[] {
    const predefinedKeys = ['remuneraciones', 'factoring', 'previsionales', 'costosFijos'];
    const dynamicKeys = Object.keys(financialData).filter(key =>
      !predefinedKeys.includes(key) &&
      typeof financialData[key] === 'object'
    );

    return [...predefinedKeys, ...dynamicKeys];
  }

  /**
   * Helper to convert financial data to FinancialCategory array for the table
   */
  static async convertToFinancialCategories(
    financialData: FinancialDataByPeriod,
    accountCategories?: AccountCategory[]
  ): Promise<Array<{ category: string, amounts: Record<string, number>, path: string }>> {
    const categories: Array<{ category: string, amounts: Record<string, number>, path: string }> = [];

    // Usar categorías proporcionadas o array vacío (legacy module disabled)
    if (!accountCategories) {
      accountCategories = [];
    }

    // Process dynamic account categories
    console.log('🔍 Processing financial data keys:', Object.keys(financialData));
    Object.keys(financialData).forEach(categoryKey => {
      console.log(`🔍 Checking category key: ${categoryKey}`);
      if (!['remuneraciones', 'factoring', 'previsionales', 'costosFijos'].includes(categoryKey)) {
        console.log(`✅ Processing dynamic category: ${categoryKey}`);
        const categoryData = financialData[categoryKey];
        if (categoryData && typeof categoryData === 'object') {
          const displayName = this.getCategoryDisplayName(categoryKey, accountCategories!);
          const path = this.getCategoryPath(categoryKey, accountCategories!);
          console.log(`📋 Adding category: ${displayName} with data:`, categoryData);
          categories.push({
            category: displayName,
            amounts: categoryData,
            path: path
          });
        } else {
          console.log(`❌ Category data invalid for ${categoryKey}:`, categoryData);
        }
      }
    });

    return categories;
  }
}

export default FinancialAggregationService;