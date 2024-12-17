import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('Login component mounted');
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').single();
        console.log('Connection test result:', { data, error });
        if (error) throw error;
      } catch (error) {
        console.error('Connection test failed:', error);
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        console.log('Fetching logo URL...');
        const { data: { publicUrl } } = supabase
          .storage
          .from('system-assets')
          .getPublicUrl('logo.png');
        
        console.log('Logo URL fetched:', publicUrl);
        setLogoUrl(publicUrl);
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogoUrl();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log('Form submitted:', { email: data.email });
    if (isLoading) return;
    
    setIsLoading(true);
    setShowError(false);
    
    try {
      console.log('Attempting login...');
      await login(data.email, data.password);
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      setShowError(true);
      setErrorMessage(
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : 'Ocorreu um erro ao tentar fazer login. Por favor, verifique sua conexão.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            {logoUrl && (
              <div className="flex justify-center mb-4">
                <img 
                  src={logoUrl}
                  alt="SiGeF Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="seu@email.com" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            type="password" 
                            placeholder="******" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Entrando..."
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Entrar
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Login;