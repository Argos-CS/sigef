import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">SiGeF</span>
          </h1>
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => navigate('/')}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => navigate('/financas')}
            >
              Finanças
            </Button>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => navigate('/relatorios')}
            >
              Relatórios
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user?.papel === 'admin' && (
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => navigate('/usuarios')}
              >
                Usuários
              </Button>
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => navigate('/backups')}
              >
                Backups
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;