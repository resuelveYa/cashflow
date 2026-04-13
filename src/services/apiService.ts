// saerti-admin/src/services/apiService.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';

const API_BASE_URL = ENV.API.BASE_URL;
const API_TIMEOUT = ENV.API.TIMEOUT;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ FUNCIÓN PARA OBTENER TOKEN DIRECTAMENTE DESDE AUTH PROVIDER (SUPABASE)
let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  getTokenFunction = getter;
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // ✅ Obtener token fresco desde Supabase
      if (getTokenFunction) {
        const token = await getTokenFunction();

        console.log('[API Request]', {
          url: config.url,
          method: config.method,
          params: config.params,
          cost_center_id: config.params?.cost_center_id,
          hasToken: !!token,
          tokenPrefix: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
        });

        // Log especial si hay cost_center_id
        if (config.params?.cost_center_id) {
          console.log('🎯 [API] FILTRANDO POR CENTRO DE COSTO:', config.params.cost_center_id);
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.error('[API] ❌ NO SE PUDO OBTENER TOKEN DE SESIÓN');
        }
      } else {
        console.error('[API] ❌ getTokenFunction NO ESTÁ CONFIGURADA');
      }
    } catch (error) {
      console.error('[API] ❌ Error obteniendo token:', error);
    }

    return config;
  },
  (error) => {
    console.error('[API] ❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response] ✅', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('[API Response] ❌', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.warn('[API] 🚨 401 detectado, verificando sesión...');

      if (typeof window !== 'undefined' && getTokenFunction) {
        // Verificar si el token realmente se perdió o es inválido
        getTokenFunction().then(token => {
          if (!token) {
            console.error('[API] 🚫 Sesión perdida o expirada de verdad. Redirigiendo...');
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `https://licitex.cl/sign-in?redirect_url=${currentUrl}`;
          } else {
            console.warn('[API] 🤔 401 recibido pero hay token activo. Posible error de permisos o expiración en backend.');
          }
        });
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: async <T>(url: string, config = {}) => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data = {}, config: any = {}) => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  postFormData: async <T>(url: string, formData: FormData, config: any = {}) => {
    const response = await apiClient.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    });
    return response.data;
  },
  put: async <T>(url: string, data = {}, config: any = {}) => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  patch: async <T>(url: string, data = {}, config: any = {}) => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config: any = {}) => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
  request: apiClient
};

export default api;