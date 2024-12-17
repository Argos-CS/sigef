import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { User, AuthContextType } from './auth/types';
import { checkPermissions } from './auth/permissions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  console.log('AuthProvider initialized'); // Debug log

  const fetchUserProfile = async (userId: string): Promise<boolean> => {
    console.log('Fetching user profile for ID:', userId); // Debug log
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { data, error }); // Debug log

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        if (data.status === 'desativado') {
          toast({
            title: "Acesso negado",
            description: "Sua conta está desativada. Entre em contato com o administrador.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return false;
        }

        setUser({
          id: data.id,
          nome: data.nome || '',
          email: data.email || '',
          papel: data.papel,
          status: data.status,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthProvider useEffect running'); // Debug log
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session); // Debug log
        
        if (session?.user && mounted) {
          const profileExists = await fetchUserProfile(session.user.id);
          if (!profileExists && mounted) {
            console.log('Profile not found, signing out'); // Debug log
            await supabase.auth.signOut();
            toast({
              title: "Erro de autenticação",
              description: "Perfil de usuário não encontrado",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session); // Debug log
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const profileExists = await fetchUserProfile(session.user.id);
        if (!profileExists && mounted) {
          await supabase.auth.signOut();
          toast({
            title: "Erro de autenticação",
            description: "Perfil de usuário não encontrado",
            variant: "destructive",
          });
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email); // Debug log
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error }); // Debug log

      if (error) throw error;

      if (data.user) {
        const profileExists = await fetchUserProfile(data.user.id);
        
        if (!profileExists) {
          throw new Error('Perfil de usuário não encontrado');
        }

        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema!",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      toast({
        title: "Erro ao fazer login",
        description: error.message === 'Invalid login credentials' 
          ? "Email ou senha incorretos"
          : "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    canManageUsers: () => checkPermissions.canManageUsers(user),
    canManageFinances: () => checkPermissions.canManageFinances(user),
    canEditFinances: () => checkPermissions.canEditFinances(user),
    canViewFinances: () => checkPermissions.canViewFinances(user),
    canAuditFinances: () => checkPermissions.canAuditFinances(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};