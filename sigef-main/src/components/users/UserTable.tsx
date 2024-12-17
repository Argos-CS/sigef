import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Power } from 'lucide-react';
import { User } from '@/contexts/auth/types';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <TableCell className="font-medium">{user.nome}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.papel}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'ativo' ? 'default' : 'destructive'}>
                  {user.status === 'ativo' ? 'Ativo' : 'Desativado'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(user)}
                    className="hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                    className={`hover:bg-${user.status === 'ativo' ? 'orange' : 'green'}-100`}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    className="hover:bg-red-100 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};