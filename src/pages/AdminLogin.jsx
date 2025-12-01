import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Admin credentials - you can change these
const ADMIN_CREDENTIALS = {
  username: 'rankwise',
  password: 'Kosovi333@'
};

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      navigate(createPageUrl('AdminDashboard'));
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUsername', username);
        navigate(createPageUrl('AdminDashboard'));
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <>
      <SEO title="Admin Login - CityReview.be" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-orange-50 flex items-center justify-center px-4 py-12 relative">
        {/* Back to Home Button */}
        <Link 
          to={createPageUrl('Home')} 
          className="absolute top-28 left-4 md:top-32 md:left-8 flex items-center gap-2 text-gray-600 hover:text-[var(--primary-orange)] transition-colors z-10 bg-white px-4 py-2 rounded-lg shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <Card className="w-full max-w-md shadow-2xl border-0 relative z-0">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] rounded-full flex items-center justify-center mb-4">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Admin Login</CardTitle>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="pl-10 h-12"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:shadow-lg transition-all duration-300 text-white text-lg font-semibold border-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Default Credentials:</p>
                <p className="text-xs text-blue-700">Username: <code className="bg-blue-100 px-2 py-1 rounded">rankwise</code></p>
                <p className="text-xs text-blue-700">Password: <code className="bg-blue-100 px-2 py-1 rounded">Kosovi333@</code></p>
                <p className="text-xs text-blue-600 mt-2">⚠️ Change these in AdminLogin.js file</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}