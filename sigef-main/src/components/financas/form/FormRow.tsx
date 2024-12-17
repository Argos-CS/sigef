import { ReactNode } from "react";

interface FormRowProps {
  children: ReactNode;
}

export const FormRow = ({ children }: FormRowProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full">
      {children}
    </div>
  );
};