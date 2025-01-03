src/pages/Index.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // If authenticated, redirect to dashboard, otherwise to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default Index;