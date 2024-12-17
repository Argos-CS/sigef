import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex items-center space-x-2">
      <Search className="w-5 h-5 text-gray-400" />
      <Input
        placeholder="Pesquisar usuários..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};