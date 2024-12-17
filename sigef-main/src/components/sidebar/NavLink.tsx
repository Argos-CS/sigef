import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isExpanded: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, children, isExpanded }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const link = (
    <Link 
      to={to} 
      className={cn(
        "flex items-center h-10 px-3 rounded-lg transition-all duration-300 ease-in-out",
        isActive 
          ? "bg-primary/10 text-primary hover:bg-primary/15" 
          : "hover:bg-muted",
        !isExpanded ? "justify-center w-10" : "space-x-3"
      )}
    >
      <Icon className="h-5 w-5 min-w-5" />
      {isExpanded && <span className="truncate">{children}</span>}
    </Link>
  );

  if (!isExpanded) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{children}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
};

export default NavLink;