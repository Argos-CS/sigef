import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRegistrationForm } from '@/components/users/UserRegistrationForm';
import { UsersList } from '@/components/users/UsersList';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserManagement: React.FC = () => {
  const { user, canManageUsers } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageUsers()) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-600">
              Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="list">Lista de Usuários</TabsTrigger>
              <TabsTrigger value="register">Novo Usuário</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <UsersList />
            </TabsContent>
            <TabsContent value="register">
              <UserRegistrationForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;