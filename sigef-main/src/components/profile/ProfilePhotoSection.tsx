import React from 'react';
import { User } from '@/contexts/auth/types';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoSectionProps {
  user: User;
}

const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({ user }) => {
  const { toast } = useToast();

  const handlePhotoChange = async () => {
    toast({
      title: "Funcionalidade não disponível",
      description: "A alteração de foto de perfil não está disponível no momento.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarFallback>{user.nome?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <Label>Foto de perfil não disponível no momento</Label>
        <Button variant="outline" disabled>Alterar foto</Button>
      </div>
    </div>
  );
};

export default ProfilePhotoSection;