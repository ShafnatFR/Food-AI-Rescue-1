import React, { useState } from 'react';
import { Mail, AlertCircle, Loader, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onSwitchToLogin?: () => void;
}

type ForgotPasswordStep = 'request' | 'reset' | 'success';

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ 
  onSwitchToLogin 
}) => {
  const [step, setStep] = useState<ForgotPasswordStep>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [requestData, setRequestData] = useState({
    email: ''
  });

  const [resetData, setResetData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestData.email.trim()) {
      setError('Email harus diisi');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_PASSWORD_RESET',
          data: {
            email: requestData.email
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim link reset');
      }

      setSuccess('Link reset password telah dikirim ke email Anda');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetData.token.trim()) {
      setError('Token harus diisi');
      return;
    }

    if (!resetData.newPassword) {
      setError('Password baru harus diisi');
      return;
    }

    if (resetData.newPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          data: {
            token: resetData.token,
            newPassword: resetData.newPassword
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mereset password');
      }

      setSuccess('Password berhasil direset');
      setStep('success');
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
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-600 mb-4">
                Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
              </p>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={requestData.email}
                    onChange={(e) => {
                      setRequestData({ email: e.target.value });
                      setError('');
                    }}
                    placeholder="Masukkan email Anda"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                    Mengirim...
                  </span>
                ) : (
                  'Kirim Link Reset'
                )}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                <ArrowLeft size={16} />
                Kembali ke Login
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Masukkan Token Reset</h2>
              <p className="text-sm text-gray-600 mb-4">
                Kami telah mengirim token ke email Anda. Salin token dari email dan masukkan di sini.
              </p>

              {/* Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Reset
                </label>
                <input
                  type="text"
                  value={resetData.token}
                  onChange={(e) => {
                    setResetData({ ...resetData, token: e.target.value });
                    setError('');
                  }}
                  placeholder="Salin token dari email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type={resetData.showPassword ? 'text' : 'password'}
                    value={resetData.newPassword}
                    onChange={(e) => {
                      setResetData({ ...resetData, newPassword: e.target.value });
                      setError('');
                    }}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type={resetData.showConfirmPassword ? 'text' : 'password'}
                    value={resetData.confirmPassword}
                    onChange={(e) => {
                      setResetData({ ...resetData, confirmPassword: e.target.value });
                      setError('');
                    }}
                    placeholder="Ulangi password baru"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                    Mereset...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Kembali
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Password Berhasil Direset!</h2>
              <p className="text-gray-600">
                Password Anda telah berhasil direset. Silakan login dengan password baru Anda.
              </p>
              <button
                onClick={onSwitchToLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                Ke Halaman Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
