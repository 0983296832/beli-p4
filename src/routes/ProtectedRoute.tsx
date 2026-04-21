import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRootStore } from '@store/index';
import RootLayout from '@components/layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useRootStore((state) => state.isLoggedIn);

  return isLoggedIn ? <RootLayout>{children}</RootLayout> : <Navigate to='/login' />;
};

export default ProtectedRoute;
