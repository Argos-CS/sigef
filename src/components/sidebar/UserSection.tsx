import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface UserSectionProps {
  isExpanded: boolean;
}

const UserSection: React.FC<UserSectionProps> = ({ isExpanded }) => {
  const { user, logout } = useAuth();

  return (
    <div className={cn(
      "p-4 mt-auto border-t transition-all duration-300 ease-in-out",
      !isExpanded && "flex justify-center"
    )}>
      {isExpanded ? (
        <>
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarFallback>{user?.nome?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link to="/perfil">
                <Settings className="h-4 w-4 mr-2" />
                Perfil
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </>
      ) : (
        <Avatar className="cursor-pointer">
          <AvatarFallback>{user?.nome?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default UserSection;