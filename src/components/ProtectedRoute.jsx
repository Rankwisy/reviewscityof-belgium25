import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { hasPermission, hasAnyPermission } from '@/functions/permissions';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredPermissions, 
  requireAll = false,
  fallbackUrl = 'Home' 
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then((userData) => {
        setUser(userData);
        
        // Check permissions
        let access = false;
        if (requiredPermission) {
          access = hasPermission(userData, requiredPermission);
        } else if (requiredPermissions) {
          if (requireAll) {
            access = requiredPermissions.every(perm => hasPermission(userData, perm));
          } else {
            access = hasAnyPermission(userData, requiredPermissions);
          }
        } else {
          access = true; // No specific permission required
        }
        
        setHasAccess(access);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        // Redirect to login if not authenticated
        base44.auth.redirectToLogin(window.location.pathname);
      });
  }, [requiredPermission, requiredPermissions, requireAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Please contact an administrator if you believe this is an error.
            </p>
            <Link to={createPageUrl(fallbackUrl)}>
              <Button className="bg-[var(--primary-orange)] hover:bg-[#d67f0a]">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}