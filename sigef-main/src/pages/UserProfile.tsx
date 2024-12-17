import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserInfoDisplay from '@/components/profile/UserInfoDisplay';
import ProfilePhotoSection from '@/components/profile/ProfilePhotoSection';
import PasswordUpdateForm from '@/components/profile/PasswordUpdateForm';
import ContactInfoForm from '@/components/profile/ContactInfoForm';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserInfoDisplay user={user} />
          <ProfilePhotoSection user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atualizar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordUpdateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactInfoForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;