export type UserRole = 'admin' | 'tesoureiro' | 'assistente' | 'auditor';
export type UserStatus = 'ativo' | 'desativado';

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  status: UserStatus;
}

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  canManageUsers: () => boolean;
  canManageFinances: () => boolean;
  canEditFinances: () => boolean;
  canViewFinances: () => boolean;
  canAuditFinances: () => boolean;
};