// src/types/user.ts - Versión extendida con compatibilidad Supabase Auth

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;

  // Campos de perfil (ya existentes)
  avatar?: string;
  position?: string;
  location?: string;

  // Campos de dirección (ya existentes)
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;

  // ✅ NUEVOS: Campos adicionales para compatibilidad con metadatos de Auth
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  company?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  position?: string;
  location?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  company?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
  position?: string;
  location?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  company?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  position?: string;
  location?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  // ✅ NUEVOS: Campos para actualizar perfil con Supabase
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  company?: string;
}

// Nuevas interfaces para actualizar información específica
export interface UpdateMetaData {
  name?: string;
  position?: string;
  location?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  company?: string;
}

export interface UpdateAddressData {
  address?: string;
  country?: string;
  city?: string;
  postal_code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface UserStats {
  byRole: Array<{
    role: UserRole;
    total: number;
    active: number;
    inactive: number;
  }>;
  general: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    new_last_month: number;
  };
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
  }>;
}

// Permisos basados en roles
export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canViewAllData: true,
    canModifyAllData: true,
    canDeleteData: true,
  },
  manager: {
    canManageUsers: false,
    canViewAllData: true,
    canModifyAllData: true,
    canDeleteData: false,
  },
  user: {
    canManageUsers: false,
    canViewAllData: false,
    canModifyAllData: false,
    canDeleteData: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin;

// Función helper para obtener el nombre del rol en español
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    admin: 'Administrador',
    manager: 'Gerente',
    user: 'Usuario',
  };
  return roleNames[role] || role;
};

// Función helper para validar email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ NUEVO: Helper para mapear usuario de Supabase a User local
export const mapSupabaseUserToLocal = (supabaseUser: any): User => {
  const metadata = supabaseUser.user_metadata || {};
  return {
    id: parseInt(supabaseUser.id) || 0,
    email: supabaseUser.email || '',
    name: metadata.full_name ||
      `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() ||
      supabaseUser.email?.split('@')[0] ||
      'Usuario',
    firstName: metadata.first_name || metadata.full_name?.split(' ')[0] || '',
    lastName: metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || '',
    username: metadata.username || supabaseUser.email?.split('@')[0] || '',
    avatar: metadata.avatar_url || '',
    phone: metadata.phone || '',
    role: (metadata.role as UserRole) || 'user',
    company: metadata.company as string || '',
    position: metadata.position as string || '',
    location: metadata.location as string || '',
    country: metadata.country as string || '',
    city: metadata.city as string || '',
    postal_code: metadata.postal_code as string || '',
    address: metadata.address as string || '',
    active: true,
    created_at: supabaseUser.created_at || new Date().toISOString(),
    updated_at: supabaseUser.updated_at || new Date().toISOString(),
  };
};