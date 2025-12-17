import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'agent' | 'buyer';
    allowedRoles?: Array<'admin' | 'agent' | 'buyer'>;
}

export default function ProtectedRoute({
    children,
    requiredRole,
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        // Redirect to login with return URL
        return <Navigate to="/buyer/login" state={{ from: location }} replace />;
    }

    // Check role permissions
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
