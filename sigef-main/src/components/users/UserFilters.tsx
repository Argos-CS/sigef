import React from 'react';
import { UserSearch } from './UserSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por papel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="tesoureiro">Tesoureiro</SelectItem>
          <SelectItem value="auditor">Auditor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};