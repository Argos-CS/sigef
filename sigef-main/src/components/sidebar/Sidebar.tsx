import React from 'react';
import { LayoutDashboard, DollarSign, BarChart2, Users, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavLink from './NavLink';
import UserSection from './UserSection';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isExpanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded }) => {
  const { user } = useAuth();

  return (
    <div className={cn(
      "flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r",
      "transition-all duration-300 ease-in-out",
      isExpanded ? "w-64" : "w-16"
    )}>
      <div className="flex-1 px-3 py-2 space-y-1">
        <NavLink to="/" icon={LayoutDashboard} isExpanded={isExpanded}>Dashboard</NavLink>
        <NavLink to="/financas" icon={DollarSign} isExpanded={isExpanded}>Finanças</NavLink>
        <NavLink to="/relatorios" icon={BarChart2} isExpanded={isExpanded}>Relatórios</NavLink>

        {user?.papel === 'admin' && (
          <>
            <div className="my-4 border-t border-border" />
            <NavLink to="/usuarios" icon={Users} isExpanded={isExpanded}>Usuários</NavLink>
            <NavLink to="/backups" icon={Database} isExpanded={isExpanded}>Backups</NavLink>
          </>
        )}
      </div>

      <UserSection isExpanded={isExpanded} />
    </div>
  );
};

export default Sidebar;