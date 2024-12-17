import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface TableStatusCellProps {
  isApproved: boolean;
}

export const TableStatusCell: React.FC<TableStatusCellProps> = ({ isApproved }) => {
  return isApproved ? (
    <CheckCircle2 className="h-5 w-5 text-green-500" />
  ) : (
    <XCircle className="h-5 w-5 text-red-500" />
  );
};