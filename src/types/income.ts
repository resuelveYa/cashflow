// src/types/income.ts
// Tipos TypeScript para sistema dinámico de ingresos - VERSIÓN COMPLETA CORREGIDA

export interface IncomeType {
  id: number;
  organization_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;

  // Campos show_* (15 campos opcionales - CORREGIDO)
  show_amount: boolean;
  show_category: boolean;
  show_payment_date: boolean;
  show_reference_number: boolean;
  show_payment_method: boolean;
  show_payment_status: boolean;
  show_currency: boolean;
  show_exchange_rate: boolean;
  show_invoice_number: boolean;
  show_tax_amount: boolean;
  show_net_amount: boolean;
  show_total_amount: boolean;

  // Campos required_* (19 campos: 4 base + 15 opcionales - CORREGIDO)
  required_name: boolean;
  required_date: boolean;
  required_status: boolean;
  required_cost_center: boolean;
  required_amount: boolean;
  required_category: boolean;
  required_payment_date: boolean;
  required_reference_number: boolean;
  required_payment_method: boolean;
  required_payment_status: boolean;
  required_currency: boolean;
  required_exchange_rate: boolean;
  required_invoice_number: boolean;
  required_tax_amount: boolean;
  required_net_amount: boolean;
  required_total_amount: boolean;

  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface IncomeCategory {
  id: number;
  income_type_id: number;
  organization_id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeStatus {
  id: number;
  income_type_id: number;
  organization_id: string;
  name: string;
  description?: string;
  color?: string;
  is_final: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeData {
  id: number;
  income_type_id: number;
  organization_id: string;
  
  // Campos base
  name?: string;
  description?: string;
  notes?: string;
  date?: string;
  status_id?: number;
  cost_center_id?: number;
  
  // Campos opcionales originales
  amount?: number;
  category_id?: number;
  payment_date?: string;
  reference_number?: string;
  payment_method?: 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta' | 'otro';
  payment_status?: 'pendiente' | 'parcial' | 'pagado' | 'anulado';
  currency?: string;
  exchange_rate?: number;
  invoice_number?: string;
  
  // Campos adicionales de montos
  tax_amount?: number;
  net_amount?: number;
  total_amount?: number;
  
  // Metadatos
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  
  // Campos relacionados (joins)
  income_type_name?: string;
  status_name?: string;
  status_color?: string;
  category_name?: string;
  cost_center_name?: string;
  created_by_email?: string;
  updated_by_email?: string;
  
  // Campos adicionales para dashboard
  totalIncomes?: number;
  pendingIncomes?: number;
  byClientData?: Array<{
    client_id: number;
    client_name: string;
    total_amount: number;
    has_data: boolean;
  }>;
  byCenterData?: Array<{
    cost_center_id: number;
    cost_center_name: string;
    total_amount: number;
    has_data: boolean;
  }>;
  recentIncomes?: IncomeItem[];
}

export interface FieldDefinition {
  name: string;
  required: boolean;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface VisibleFields {
  base: FieldDefinition[];
  optional: FieldDefinition[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface IncomeFilters {
  organization_id?: string;
  income_type_id?: number;
  status_id?: number;
  category_id?: number;
  cost_center_id?: number;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
  search?: string;
  offset?: number;
  limit?: number;
  periodType?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  year?: string;
}

// Tipos auxiliares para el formulario
export type IncomeFormMode = 'create' | 'edit' | 'view';

export interface IncomeFormProps {
  mode: IncomeFormMode;
  incomeId?: number;
  typeId?: number;
  onSuccess?: (income: IncomeData) => void;
  onCancel?: () => void;
}

// Tipo para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}

// ✅ AGREGADOS - Tipos adicionales necesarios

export interface Income extends IncomeData {}

export interface IncomeFilter extends IncomeFilters {}

export interface IncomeStats {
  total_amount: number;
  total_count: number;
  pending_count: number;
  by_type: Array<{
    type_id: number;
    type_name: string;
    count: number;
    total_amount: number;
  }>;
  by_status: Array<{
    status_id: number;
    status_name: string;
    count: number;
    total_amount: number;
  }>;
}

export interface IncomeItem {
  id: number;
  name: string;
  amount: number;
  total_amount: number;
  date: string;
  status_name: string;
  status_color: string;
  income_type_name: string;
  category_name?: string;
  cost_center_name?: string;
}

export interface IncomeDetail extends IncomeData {
  // Campos adicionales para vista de detalle
  history?: Array<{
    id: number;
    field: string;
    old_value: string;
    new_value: string;
    changed_at: string;
    changed_by: string;
  }>;
}