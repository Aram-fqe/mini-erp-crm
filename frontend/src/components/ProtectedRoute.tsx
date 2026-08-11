import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent"></div>
          <p className="text-sm font-medium text-[#9aa0ac]">Loading Portal Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0f1117] p-6 text-center">
        <h2 className="text-2xl font-bold text-red-400">403 - Access Forbidden</h2>
        <p className="mt-2 text-sm text-[#9aa0ac]">
          Your role (<span className="font-semibold text-white">{user.role}</span>) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
