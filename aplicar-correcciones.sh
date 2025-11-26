#!/bin/bash

# Script para aplicar automáticamente las correcciones de TypeScript
# Autor: Claude
# Fecha: 2024-11-26

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🔧 Script de Corrección TypeScript${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo -e "${RED}   Asegúrate de ejecutar este script desde la raíz del proyecto${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Verificando estructura del proyecto...${NC}"
if [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: No se encontró el directorio src/${NC}"
    exit 1
fi

# Hacer backup
echo -e "${YELLOW}💾 Creando backup...${NC}"
git add . 2>/dev/null || true
git commit -m "backup: antes de aplicar correcciones TypeScript automáticas" 2>/dev/null || echo "  ℹ️  No hay cambios para commitear"

# Crear directorios necesarios
echo -e "${YELLOW}📁 Creando directorios necesarios...${NC}"
mkdir -p src/types/CC
mkdir -p src/services

# Verificar que tenemos los archivos de corrección
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$SCRIPT_DIR/expense-updated.ts" ]; then
    echo -e "${RED}❌ Error: No se encontró expense-updated.ts en el directorio del script${NC}"
    echo -e "${RED}   Directorio del script: $SCRIPT_DIR${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}�� Aplicando correcciones...${NC}"
echo ""

# 1. Actualizar types/expense.ts
echo -e "${YELLOW}1/10 �� Actualizando src/types/expense.ts...${NC}"
cp "$SCRIPT_DIR/expense-updated.ts" src/types/expense.ts
echo -e "${GREEN}   ✅ Completado${NC}"

# 2. Actualizar types/income.ts
echo -e "${YELLOW}2/10 📝 Actualizando src/types/income.ts...${NC}"
cp "$SCRIPT_DIR/income-updated.ts" src/types/income.ts
echo -e "${GREEN}   ✅ Completado${NC}"

# 3. Crear ingresosApiService.ts
echo -e "${YELLOW}3/10 📝 Creando src/services/ingresosApiService.ts...${NC}"
cp "$SCRIPT_DIR/ingresosApiService.ts" src/services/ingresosApiService.ts
echo -e "${GREEN}   ✅ Completado${NC}"

# 4. Crear types/CC/ingreso.ts
echo -e "${YELLOW}4/10 📝 Creando src/types/CC/ingreso.ts...${NC}"
cp "$SCRIPT_DIR/ingreso.ts" src/types/CC/ingreso.ts
echo -e "${GREEN}   ✅ Completado${NC}"

# 5. Actualizar date-picker.tsx
echo -e "${YELLOW}5/10 📝 Actualizando src/components/form/date-picker.tsx...${NC}"
if [ -f "src/components/form/date-picker.tsx" ]; then
    sed -i 's/label?: string;/label?: React.ReactNode;/g' src/components/form/date-picker.tsx
    echo -e "${GREEN}   ✅ Completado${NC}"
else
    echo -e "${RED}   ⚠️  Archivo no encontrado, saltando...${NC}"
fi

# 6. Actualizar CashFlowComparison.tsx
echo -e "${YELLOW}6/10 📝 Actualizando src/components/Dashboard/CashFlowComparison.tsx...${NC}"
if [ -f "src/components/Dashboard/CashFlowComparison.tsx" ]; then
    # Agregar period_label a la interfaz
    sed -i '/interface CombinedPeriodData {/,/}/ s/period: string;/period: string;\n  period_label: string;/' src/components/Dashboard/CashFlowComparison.tsx
    
    # Agregar period_label en los objetos
    sed -i 's/period: item\.period_label,/period: item.period_label,\n        period_label: item.period_label,/g' src/components/Dashboard/CashFlowComparison.tsx
    
    echo -e "${GREEN}   ✅ Completado${NC}"
else
    echo -e "${RED}   ⚠️  Archivo no encontrado, saltando...${NC}"
fi

# 7. Actualizar ComparativeLineChart.tsx
echo -e "${YELLOW}7/10 📝 Actualizando src/components/Dashboard/ComparativeLineChart.tsx...${NC}"
if [ -f "src/components/Dashboard/ComparativeLineChart.tsx" ]; then
    # Comentar la línea easing
    sed -i "s/easing: 'easeinout',/\/\/ easing: 'easeinout',  \/\/ Removido - no es una propiedad válida/g" src/components/Dashboard/ComparativeLineChart.tsx
    echo -e "${GREEN}   ✅ Completado${NC}"
else
    echo -e "${RED}   ⚠️  Archivo no encontrado, saltando...${NC}"
fi

# 8. Actualizar expenseCategoryService.ts
echo -e "${YELLOW}8/10 📝 Actualizando src/services/expenseCategoryService.ts...${NC}"
if [ -f "src/services/expenseCategoryService.ts" ]; then
    # Este necesita revisión manual más detallada
    echo -e "${YELLOW}   ⚠️  Este archivo requiere revisión manual${NC}"
    echo -e "${YELLOW}      Ver INSTRUCCIONES_PASO_A_PASO.md - Paso 8${NC}"
else
    echo -e "${RED}   ⚠️  Archivo no encontrado, saltando...${NC}"
fi

# 9. Actualizar ExpenseTypeForm.tsx
echo -e "${YELLOW}9/10 📝 Actualizando src/pages/DynamicExpense/ExpenseTypeForm.tsx...${NC}"
if [ -f "src/pages/DynamicExpense/ExpenseTypeForm.tsx" ]; then
    echo -e "${YELLOW}   ⚠️  Este archivo requiere revisión manual${NC}"
    echo -e "${YELLOW}      Ver INSTRUCCIONES_PASO_A_PASO.md - Paso 9${NC}"
else
    echo -e "${RED}   ⚠️  Archivo no encontrado, saltando...${NC}"
fi

# 10. Actualizar ExpenseTypeFormModal.tsx
echo -e "${YELLOW}10/10 📝 Actualizando src/components/ExpenseTypeFormModal.tsx...${NC}"
if [ -f "src/components/ExpenseTypeFormModal.tsx" ]; then
    echo -e "${YELLOW}   ⚠️  Este archivo requiere revisión manual${NC}"
    echo -e "${YELLOW}      Ver INSTRUCCIONES_PASO_A_PASO.md - Paso 9${NC}"
else
    echo -e "${RED}   ⚠️  Archivo no encontrado, saltando...${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Correcciones aplicadas${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo -e "1. Revisa los archivos marcados con ⚠️  manualmente"
echo -e "2. Agrega imports de ingresosApiService donde sea necesario"
echo -e "3. Ejecuta: ${GREEN}npm run build${NC}"
echo -e "4. Si hay errores, consulta ${GREEN}INSTRUCCIONES_PASO_A_PASO.md${NC}"
echo ""

echo -e "${YELLOW}🔍 ¿Quieres ejecutar el build ahora? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo ""
    echo -e "${GREEN}🔨 Ejecutando build...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}🎉 ¡Build exitoso!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo -e "${GREEN}✅ Todos los errores de TypeScript han sido corregidos${NC}"
        echo ""
        echo -e "${YELLOW}💾 ¿Quieres hacer commit de los cambios? (s/n)${NC}"
        read -r commit_response
        if [[ "$commit_response" =~ ^([sS][iI]|[sS])$ ]]; then
            git add .
            git commit -m "fix: corregir todos los errores de TypeScript

- Agregar campos tax_amount, net_amount, total_amount a expense y income types
- Crear servicio ingresosApiService
- Crear tipos CC/ingreso
- Actualizar DatePicker para aceptar React.ReactNode en label
- Corregir CashFlowComparison agregando period_label
- Eliminar propiedad easing de ComparativeLineChart
- Actualizar tipos y servicios"
            echo -e "${GREEN}✅ Cambios commiteados${NC}"
        fi
    else
        echo ""
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}❌ Build falló${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""
        echo -e "${YELLOW}Revisa los errores y consulta INSTRUCCIONES_PASO_A_PASO.md${NC}"
        echo ""
        echo -e "${YELLOW}Puedes deshacer los cambios con:${NC}"
        echo -e "${GREEN}git reset --hard HEAD~1${NC}"
    fi
else
    echo ""
    echo -e "${GREEN}👍 Puedes ejecutar el build manualmente cuando estés listo:${NC}"
    echo -e "${GREEN}npm run build${NC}"
fi

echo ""
