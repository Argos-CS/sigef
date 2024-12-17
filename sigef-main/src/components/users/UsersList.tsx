import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserTable } from './UserTable';
import { EditUserDialog } from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import { ToggleUserStatusDialog } from './ToggleUserStatusDialog';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { User } from '@/contexts/auth/types';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { UserFilters } from './UserFilters';
import { LoadingState } from './LoadingState';
import { PaginationControls } from './PaginationControls';

const ITEMS_PER_PAGE = 10;

export const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [statusUser, setStatusUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('papel', roleFilter);
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('nome');

    if (error) throw error;
    return { users: data || [], totalCount: count || 0 };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', searchTerm, currentPage, roleFilter],
    queryFn: fetchUsers,
  });

  const totalPages = Math.ceil((data?.totalCount || 0) / ITEMS_PER_PAGE);

  const handleDelete = (userId: string) => {
    if (!data?.users) return;
    setDeleteUser(data.users.find(u => u.id === userId) || null);
  };

  const handleToggleStatus = (user: User) => {
    setStatusUser(user);
  };

  if (error) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-red-600">Erro ao carregar usuários: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + searchTerm + roleFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <UserTable 
              users={data?.users || []}
              onEdit={user => {
                setEditingUser(user);
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <EditUserDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
        }}
      />
      <DeleteUserDialog
        user={deleteUser}
        onOpenChange={() => setDeleteUser(null)}
        onConfirm={() => {
          refetch();
          setDeleteUser(null);
        }}
      />
      <ToggleUserStatusDialog
        user={statusUser}
        onOpenChange={() => setStatusUser(null)}
        onConfirm={() => {
          refetch();
          setStatusUser(null);
        }}
      />
    </motion.div>
  );
};