// src/context/TenantContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentOrganization, getUserOrganizations, switchOrganization, type Organization, type OrganizationMembership } from '../services/organizationService';
import { useAuth } from './AuthContext';

// Keep the types the same so components using them don't break
interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
}

interface TenantConfig {
  id: string;
  name: string;
  theme: TenantTheme;
  features: string[];
  companyId: number;
  slug?: string;
  userRole?: string;
}

interface TenantContextType {
  currentTenant: TenantConfig;
  setCurrentTenant: (tenant: TenantConfig) => void;
  availableTenants: TenantConfig[];
  isLoading: boolean;
  refreshOrganization: () => Promise<void>;
  switchToOrganization: (organizationId: string) => Promise<void>;
}

// Default theme configuration
const defaultTheme: TenantTheme = {
  primaryColor: '#3C50E0',
  secondaryColor: '#80CAEE',
  accentColor: '#10B981',
  logoUrl: '/images/logo/logo.svg',
};

// Default features
const defaultFeatures = ['cashflow', 'dashboard', 'projects', 'expenses', 'income'];

// Fallback tenant (usado solo si no hay organización)
const fallbackTenant: TenantConfig = {
  id: 'loading',
  name: 'Loading...',
  companyId: 0,
  theme: defaultTheme,
  features: defaultFeatures,
};

// Create the context
const TenantContext = createContext<TenantContextType>({
  currentTenant: fallbackTenant,
  setCurrentTenant: () => { },
  availableTenants: [],
  isLoading: true,
  refreshOrganization: async () => { },
  switchToOrganization: async () => { },
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<TenantConfig>(fallbackTenant);
  const [availableTenants, setAvailableTenants] = useState<TenantConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Función para convertir Organization a TenantConfig
  const organizationToTenant = (org: Organization): TenantConfig => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    userRole: org.userRole,
    companyId: 1, // Legacy compatibility
    theme: defaultTheme,
    features: defaultFeatures,
  });

  // Aplicar tema CSS
  const applyTheme = (theme: TenantTheme) => {
    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--color-accent', theme.accentColor);
  };

  // Carga organización actual + lista de organizaciones en un único Promise.all
  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const [org, orgs] = await Promise.all([
        getCurrentOrganization(),
        getUserOrganizations(),
      ]);

      const tenant = organizationToTenant(org);
      setCurrentTenant(tenant);
      applyTheme(tenant.theme);
      localStorage.setItem('currentTenant', JSON.stringify(tenant));

      const tenants = orgs.map(o => organizationToTenant({ id: o.id, name: o.name, userRole: o.role }));
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('[TenantContext] Error loading organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar de organización
  const switchToOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      await switchOrganization(organizationId);
      await loadOrganizations();
      window.location.reload();
    } catch (error) {
      console.error('[TenantContext] Error switching organization:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar si el usuario está autenticado
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadOrganizations();
    } else if (!isAuthLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isAuthenticated]);

  // Aplicar tema inicial
  useEffect(() => {
    applyTheme(defaultTheme);
  }, []);

  // Función de actualización manual del tenant
  const updateTenant = (tenant: TenantConfig) => {
    setCurrentTenant(tenant);
    localStorage.setItem('currentTenant', JSON.stringify(tenant));
    applyTheme(tenant.theme);
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setCurrentTenant: updateTenant,
        availableTenants,
        isLoading,
        refreshOrganization: loadOrganizations,
        switchToOrganization,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

// Keep the same hook for components that use it
export const useTenant = () => useContext(TenantContext);