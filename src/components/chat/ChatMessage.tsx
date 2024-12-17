import React from 'react';
import { User } from '@/contexts/auth/types';

interface ChatMessageProps {
  message: string;
  created_at: string;
  user: {
    id: string;
    nome: string;
    papel: string;
  };
  currentUserId: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  created_at, 
  user, 
  currentUserId 
}) => {
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <div className="text-sm font-medium mb-1">
          {user.nome} ({user.papel})
        </div>
        <div>{message}</div>
        <div className="text-xs opacity-70 mt-1">
          {new Date(created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};