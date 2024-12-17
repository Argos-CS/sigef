import { User } from './types';

export const checkPermissions = {
  canManageUsers: (user: User | null) => user?.papel === 'admin',
  
  canManageFinances: (user: User | null) => user?.papel === 'tesoureiro',
  
  canEditFinances: (user: User | null) => 
    ['tesoureiro', 'assistente'].includes(user?.papel || ''),
  
  canViewFinances: (user: User | null) => !!user,
  
  canAuditFinances: (user: User | null) => user?.papel === 'auditor'
};