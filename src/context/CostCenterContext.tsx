import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCostCenters, CostCenter } from '../services/costCenterService';
import { incomeTypeService } from '../services/incomeTypeService';
import type { IncomeType } from '../types/income';
import { expenseTypeService } from '../services/expenseTypeService';
import type { ExpenseType } from '../types/expense';

interface CostCenterContextType {
  selectedCostCenterId: number | null; // null means "Todos"
  costCenters: CostCenter[];
  incomeTypes: IncomeType[];
  expenseTypes: ExpenseType[];
  loading: boolean;
  setSelectedCostCenterId: (id: number | null) => void;
  /** Reload all shared reference data (cost-centers, income-types, expense-types) */
  loadCostCenters: () => Promise<void>;
}

const CostCenterContext = createContext<CostCenterContextType | undefined>(undefined);

export const CostCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number | null>(null);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);

  // Log cuando cambia el centro de costo seleccionado
  React.useEffect(() => {
    console.log('[CostCenterContext] Centro de costo seleccionado:', selectedCostCenterId);
  }, [selectedCostCenterId]);

  /**
   * Carga cost-centers, income-types y expense-types en un único Promise.all.
   * Al exponer los resultados vía contexto, cualquier componente que los necesite
   * (Sidebar, OperationalMetrics, etc.) los lee de aquí sin disparar requests adicionales.
   */
  const loadCostCenters = async () => {
    try {
      setLoading(true);
      const [centers, iTypes, eTypes] = await Promise.all([
        getCostCenters(),
        incomeTypeService.getAll(true),
        expenseTypeService.getAll(true),
      ]);
      setCostCenters(centers);
      setIncomeTypes(iTypes);
      setExpenseTypes(eTypes);
    } catch (error) {
      console.error('Error loading shared reference data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCostCenters();
  }, []);

  const value = React.useMemo(() => ({
    selectedCostCenterId,
    costCenters,
    incomeTypes,
    expenseTypes,
    loading,
    setSelectedCostCenterId,
    loadCostCenters,
  }), [selectedCostCenterId, costCenters, incomeTypes, expenseTypes, loading]);

  return (
    <CostCenterContext.Provider value={value}>
      {children}
    </CostCenterContext.Provider>
  );
};

export const useCostCenter = () => {
  const context = useContext(CostCenterContext);
  if (context === undefined) {
    throw new Error('useCostCenter must be used within a CostCenterProvider');
  }
  return context;
};
