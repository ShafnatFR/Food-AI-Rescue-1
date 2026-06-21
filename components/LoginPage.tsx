import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: (user: any) => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  onSwitchToRegister,
  onSwitchToForgotPassword
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Validate form
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email harus diisi');
      return false;
    }
    if (!formData.password) {
      setError('Password harus diisi');
      return false;
    }
    return true;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN_USER',
          data: {
            email: formData.email,
            password: formData.password
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login gagal');
      }

      // Save to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('userEmail', formData.email);
      } else {
        localStorage.removeItem('userEmail');
      }

      // Save user data and token
      localStorage.setItem('user', JSON.stringify(result.data));
      localStorage.setItem('userId', result.data.id);

      if (onLoginSuccess) {
        onLoginSuccess(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">Food AI Rescue</h1>
          <p className="text-purple-100 text-sm">Selamatkan Makanan, Selamatkan Bumi</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Login</h2>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email Anda"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Lupa password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" />
                  Masuk...
                </span>
              ) : (
                'Masuk'
              )}
            </button>

            {/* Switch to Register */}
            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Daftar di sini
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
