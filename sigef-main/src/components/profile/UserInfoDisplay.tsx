import React from 'react';
import { User } from '@/contexts/auth/types';

interface UserInfoDisplayProps {
  user: User;
}

const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">Nome</p>
        <p className="mt-1 text-sm text-gray-900">{user.nome}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Email</p>
        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Perfil de Acesso</p>
        <p className="mt-1 text-sm text-gray-900 capitalize">{user.papel}</p>
      </div>
    </div>
  );
};

export default UserInfoDisplay;