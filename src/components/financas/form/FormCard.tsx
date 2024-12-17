import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface FormCardProps {
  children: ReactNode;
}

export const FormCard = ({ children }: FormCardProps) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 w-full max-w-full overflow-hidden">
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
};