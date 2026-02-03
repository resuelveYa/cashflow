import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import CurrencyInput from '../form/input/CurrencyInput';
import DatePicker from '../form/date-picker';
import Label from '../form/Label';
import Select from '../form/Select';
import { incomeDataService } from '../../services/incomeDataService';
import { incomeTypeService } from '../../services/incomeTypeService';
import { expenseDataService } from '../../services/expenseDataService';
import { expenseTypeService } from '../../services/expenseTypeService';
import { getCostCenters, CostCenter, createCostCenter } from '../../services/costCenterService';
import { toast } from 'sonner';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSuccess?: () => void;
}

interface CustomField {
  key: string;
  value: string;
}

export default function QuickEntryModal({ isOpen, onClose, type, onSuccess }: QuickEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newCostCenterName, setNewCostCenterName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    cost_center_id: '',
    type_id: '',
    category_id: '',
    status_id: '',
    description: ''
  });

  const [customFields, setCustomFields] = useState<Array<{
    key: string;
    value: string;
    type: 'text' | 'currency'
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, type]);

  const loadInitialData = async () => {
    setLoadingData(true);
    console.log('[QuickEntryModal] No loading initial data for type:', type);
    try {
      const cc = await getCostCenters();
      console.log('[QuickEntryModal] Cost Centers loaded:', cc.length);
      setCostCenters(cc);

      if (type === 'income') {
        const incomeTypesList = await incomeTypeService.getAll();
        console.log('[QuickEntryModal] Income Types loaded:', incomeTypesList.length);
        setTypes(incomeTypesList);
      } else {
        const expenseTypesList = await expenseTypeService.getAll();
        console.log('[QuickEntryModal] Expense Types loaded:', expenseTypesList.length);
        setTypes(expenseTypesList);
      }
    } catch (error) {
      console.error('[QuickEntryModal] Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (formData.type_id && formData.type_id !== 'new') {
      loadTypesDetails();
    } else if (formData.type_id === 'new') {
      setCategories([]);
      setStatuses([]);
    }
  }, [formData.type_id]);

  const loadTypesDetails = async () => {
    const typeId = parseInt(formData.type_id);
    if (isNaN(typeId)) return;

    setLoadingTypes(true);
    try {
      if (type === 'income') {
        const [cats, stats] = await Promise.all([
          incomeTypeService.getCategories(typeId),
          incomeTypeService.getStatuses(typeId)
        ]);
        console.log(`[QuickEntryModal] Loaded ${cats.length} categories and ${stats.length} statuses for income type ${typeId}`);
        setCategories(cats);
        setStatuses(stats);
      } else {
        const [cats, stats] = await Promise.all([
          expenseTypeService.getCategories(typeId),
          expenseTypeService.getStatuses(typeId)
        ]);
        console.log(`[QuickEntryModal] Loaded ${cats.length} categories and ${stats.length} statuses for expense type ${typeId}`);
        setCategories(cats);
        setStatuses(stats);
      }
    } catch (error) {
      console.error('[QuickEntryModal] Error loading type details:', error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '', type: 'text' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value' | 'type', value: string) => {
    const updated = [...customFields];
    if (field === 'type') {
      updated[index][field] = value as 'text' | 'currency';
    } else {
      updated[index][field] = value;
    }
    setCustomFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalTypeId = parseInt(formData.type_id);

      // Multi-step creation: Type -> Category/Status/CostCenter
      // 1. Create Type if "new"
      if (formData.type_id === 'new' && newTypeName.trim()) {
        try {
          const newType = type === 'income'
            ? await incomeTypeService.create({ name: newTypeName.trim(), is_active: true })
            : await expenseTypeService.create({ name: newTypeName.trim(), is_active: true });
          finalTypeId = newType.id;
        } catch (error) {
          console.error('[QuickEntryModal] Error creando nuevo tipo:', error);
          toast.error('Error al crear el nuevo tipo');
          setLoading(false);
          return;
        }
      }

      // 2. Create Category if "new"
      let finalCategoryId = parseInt(formData.category_id);
      if (formData.category_id === 'new' && newCategoryName.trim()) {
        try {
          const newCat = type === 'income'
            ? await incomeTypeService.createCategory(finalTypeId, { name: newCategoryName.trim(), is_active: true })
            : await expenseTypeService.createCategory(finalTypeId, { name: newCategoryName.trim(), is_active: true });
          finalCategoryId = newCat.id;
        } catch (error) {
          console.error('[QuickEntryModal] Error creando nueva categoría:', error);
          toast.error('Error al crear la nueva categoría');
          setLoading(false);
          return;
        }
      }

      // 3. Create Status if "new"
      let finalStatusId = parseInt(formData.status_id);
      if (formData.status_id === 'new' && newStatusName.trim()) {
        try {
          const newStat = type === 'income'
            ? await incomeTypeService.createStatus(finalTypeId, { name: newStatusName.trim(), is_active: true })
            : await expenseTypeService.createStatus(finalTypeId, { name: newStatusName.trim(), is_active: true });
          finalStatusId = newStat.id;
        } catch (error) {
          console.error('[QuickEntryModal] Error creando nuevo estado:', error);
          toast.error('Error al crear el nuevo estado');
          setLoading(false);
          return;
        }
      }

      // 4. Create Cost Center if "new"
      let finalCostCenterId = parseInt(formData.cost_center_id);
      if (formData.cost_center_id === 'new' && newCostCenterName.trim()) {
        try {
          const newCC = await createCostCenter({
            name: newCostCenterName.trim(),
            active: true,
            code: newCostCenterName.trim().substring(0, 10).toUpperCase()
          });
          finalCostCenterId = newCC.id;
        } catch (error) {
          console.error('[QuickEntryModal] Error creando nuevo centro de costo:', error);
          toast.error('Error al crear el nuevo centro de costo');
          setLoading(false);
          return;
        }
      }

      const safeParseInt = (val: string) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
      };

      if (!formData.name || !formData.amount || !formData.date || !formData.type_id || (formData.type_id !== 'new' && isNaN(finalTypeId))) {
        toast.error('Por favor completa todos los campos obligatorios, incluyendo el tipo');
        setLoading(false);
        return;
      }

      const metadata: Record<string, string> = {};
      customFields.forEach(field => {
        if (field.key.trim()) {
          // Si es moneda, podemos dejarlo como string con el formato o solo el número
          // El usuario pidió aplicar el formatter, así que el valor ya vendrá formateado si es CurrencyInput
          metadata[field.key.trim()] = field.value;
        }
      });

      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        cost_center_id: isNaN(finalCostCenterId) ? undefined : finalCostCenterId,
        income_type_id: type === 'income' ? (isNaN(finalTypeId) ? undefined : finalTypeId) : undefined,
        expense_type_id: type === 'expense' ? (isNaN(finalTypeId) ? undefined : finalTypeId) : undefined,
        category_id: isNaN(finalCategoryId) ? undefined : finalCategoryId,
        status_id: isNaN(finalStatusId) ? undefined : finalStatusId,
        description: formData.description,
        metadata
      };

      if (type === 'income') {
        await incomeDataService.create(payload as any);
      } else {
        await expenseDataService.create(payload as any);
      }

      toast.success(`${type === 'income' ? 'Ingreso' : 'Egreso'} creado exitosamente`);
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        cost_center_id: '',
        type_id: '',
        category_id: '',
        status_id: '',
        description: ''
      });
      setNewTypeName('');
      setNewCategoryName('');
      setNewStatusName('');
      setNewCostCenterName('');
      setCustomFields([]);
    } catch (error: any) {
      console.error('[QuickEntryModal] Submission error:', error.response?.data);
      const backendMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;

      let errorMessage = 'Error al crear el registro';
      if (validationErrors && Array.isArray(validationErrors)) {
        errorMessage = `Errores: ${validationErrors.map(e => e.message).join(', ')}`;
      } else if (backendMessage) {
        errorMessage = backendMessage;
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {type === 'income' ? <Plus size={20} /> : <Trash2 size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nuevo {type === 'income' ? 'Ingreso' : 'Egreso'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completa los datos básicos para el registro rápido.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base Info */}
            <div className="space-y-4">
              <div>
                <Label>Nombre / Glosa</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FileText size={16} />
                  </span>
                  <Input
                    value={formData.name}
                    onChange={(e: any) => handleChange('name', e.target.value)}
                    placeholder="Ej: Factura #123 o Pago Cliente X"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monto</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                      <DollarSign size={16} />
                    </span>
                    <CurrencyInput
                      value={formData.amount}
                      onChange={(val) => handleChange('amount', val)}
                      placeholder="0"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <DatePicker
                    id="quick-entry-date"
                    label="Fecha"
                    defaultDate={formData.date}
                    onChange={([d]) => {
                      if (d) {
                        const dateStr = d.toISOString().split('T')[0];
                        handleChange('date', dateStr);
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Centro de Costo</Label>
                <div className="space-y-3">
                  <Select
                    options={[
                      { value: '', label: 'Seleccionar...' },
                      ...costCenters.map(cc => ({ value: cc.id.toString(), label: cc.name })),
                      { value: 'new', label: '+ Otro (Crear nuevo...)' }
                    ]}
                    value={formData.cost_center_id}
                    onChange={(val) => handleChange('cost_center_id', val)}
                    isLoading={loadingData}
                  />

                  {formData.cost_center_id === 'new' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input
                        placeholder="Nombre del nuevo centro de costo"
                        value={newCostCenterName}
                        onChange={(e: any) => setNewCostCenterName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Categorization */}
            <div className="space-y-4">
              <div>
                <Label>Tipo de {type === 'income' ? 'Ingreso' : 'Egreso'}</Label>
                <div className="space-y-3">
                  <Select
                    options={[
                      { value: '', label: 'Seleccionar...' },
                      ...types.map(t => ({ value: t.id.toString(), label: t.name })),
                      { value: 'new', label: '+ Otro (Crear nuevo...)' }
                    ]}
                    value={formData.type_id}
                    onChange={(val) => handleChange('type_id', val)}
                    isLoading={loadingData}
                  />

                  {formData.type_id === 'new' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input
                        placeholder="Nombre del nuevo tipo"
                        value={newTypeName}
                        onChange={(e: any) => setNewTypeName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    options={[
                      { value: '', label: 'Ninguna' },
                      ...categories.map(c => ({ value: c.id.toString(), label: c.name })),
                      { value: 'new', label: '+ Otra (Crear nueva...)' }
                    ]}
                    value={formData.category_id}
                    onChange={(val) => handleChange('category_id', val)}
                    disabled={!formData.type_id || formData.type_id === 'new'}
                    isLoading={loadingTypes}
                  />
                  {formData.category_id === 'new' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input
                        placeholder="Nombre de la nueva categoría"
                        value={newCategoryName}
                        onChange={(e: any) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select
                    options={[
                      { value: '', label: 'Ninguno' },
                      ...statuses.map(s => ({ value: s.id.toString(), label: s.name })),
                      { value: 'new', label: '+ Otro (Crear nuevo...)' }
                    ]}
                    value={formData.status_id}
                    onChange={(val) => handleChange('status_id', val)}
                    disabled={!formData.type_id || formData.type_id === 'new'}
                    isLoading={loadingTypes}
                  />
                  {formData.status_id === 'new' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input
                        placeholder="Nombre del nuevo estado"
                        value={newStatusName}
                        onChange={(e: any) => setNewStatusName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Descripción / Notas (Opcional)</Label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>
          </div>

          {/* Dynamic Fields Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} />
                Campos Personalizados
              </h3>
              <button
                type="button"
                onClick={addCustomField}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={16} />
                Añadir campo
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {customFields.length === 0 && (
                <div className="text-center py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-400">No hay campos adicionales. Usa "Añadir campo" para datos específicos.</p>
                </div>
              )}
              {customFields.map((field, index) => (
                <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 duration-200 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Nombre del campo"
                      value={field.key}
                      onChange={(e: any) => handleCustomFieldChange(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="flex-[2] flex gap-2">
                    <div className="relative flex-1">
                      {field.type === 'currency' && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                          <DollarSign size={14} />
                        </span>
                      )}
                      {field.type === 'currency' ? (
                        <CurrencyInput
                          value={field.value}
                          onChange={(val) => handleCustomFieldChange(index, 'value', val)}
                          placeholder="0"
                          className="pl-8"
                        />
                      ) : (
                        <Input
                          placeholder="Valor"
                          value={field.value}
                          onChange={(e: any) => handleCustomFieldChange(index, 'value', e.target.value)}
                        />
                      )}
                    </div>

                    {/* Toggle Tipo */}
                    <button
                      type="button"
                      onClick={() => handleCustomFieldChange(index, 'type', field.type === 'text' ? 'currency' : 'text')}
                      className={`p-2 rounded-lg border transition-all ${field.type === 'currency'
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                        : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                      title={field.type === 'currency' ? 'Cambiar a Texto' : 'Cambiar a Moneda (CLP)'}
                    >
                      {field.type === 'currency' ? <DollarSign size={16} /> : <FileText size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`${type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} min-w-[140px]`}
              isLoading={loading}
              disabled={loading}
            >
              {type === 'income' ? 'Crear Ingreso' : 'Crear Egreso'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
