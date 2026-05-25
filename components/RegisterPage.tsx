import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, User, Phone, AlertCircle, CheckCircle,
  Loader, MessageSquare, Wifi, WifiOff,
} from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess?: (email: string) => void;
  onSwitchToLogin?: () => void;
}

type RegisterStep = 'form' | 'choose_channel' | 'verification' | 'success';
type OtpChannel = 'email' | 'whatsapp';

const API_URL = 'http://localhost:5000/api';

interface WaStatus {
  status: 'initializing' | 'qr_pending' | 'ready' | 'disconnected';
  isReady: boolean;
  hasQr: boolean;
  info: { name: string; phone: string } | null;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [step, setStep] = useState<RegisterStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [waStatus, setWaStatus] = useState<WaStatus | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'individual_donor',
  });

  const [otpState, setOtpState] = useState({
    channel: 'email' as OtpChannel,
    identifier: '',
    code: '',
  });

  // Cek status WhatsApp saat komponen mount
  useEffect(() => {
    fetch(`${API_URL.replace('/api', '')}/api/wa-status`)
      .then(r => r.json())
      .then(setWaStatus)
      .catch(() => setWaStatus(null));
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) { setError('Nama lengkap harus diisi'); return false; }
    if (!formData.email.trim()) { setError('Email harus diisi'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Format email tidak valid'); return false; }
    if (!formData.password) { setError('Password harus diisi'); return false; }
    if (formData.password.length < 8) { setError('Password minimal 8 karakter'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('Password tidak cocok'); return false; }
    return true;
  };

  // Step 1 → Step 2: Validasi form lalu pilih channel
  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError('');
    setStep('choose_channel');
  };

  // Step 2 → Step 3: Kirim OTP via channel yang dipilih
  const handleSendOtp = async (channel: OtpChannel) => {
    // Validasi nomor telepon jika channel butuh phone
    const channelOpt = CHANNEL_OPTIONS.find(c => c.id === channel)!;
    if (channelOpt.requiresPhone && !formData.phone.trim()) {
      setError('Nomor telepon harus diisi untuk verifikasi via ' + channelOpt.label);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_REGISTRATION_OTP',
          data: {
            channel,
            email: formData.email,
            phone: formData.phone,
            name: formData.name,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal mengirim kode OTP');

      setOtpState({ channel, identifier: result.identifier, code: '' });
      setSuccess(result.message);
      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verifikasi OTP lalu daftar
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpState.code.trim() || otpState.code.length < 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Verifikasi OTP
      const verifyRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_REGISTRATION_OTP',
          data: {
            identifier: otpState.identifier,
            code: otpState.code,
            channel: otpState.channel,
          },
        }),
      });

      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyResult.message || 'Kode OTP tidak valid');

      // 2. Daftarkan user
      const registerRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_USER',
          data: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: formData.role,
          },
        }),
      });

      const registerResult = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerResult.message || 'Gagal mendaftar');

      setSuccess('Pendaftaran berhasil! Silakan login dengan akun Anda.');
      setStep('success');
      onRegisterSuccess?.(formData.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Kirim ulang OTP
  const handleResendOtp = async () => {
    await handleSendOtp(otpState.channel);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">Food AI Rescue</h1>
          <p className="text-purple-100 text-sm">Selamatkan Makanan, Selamatkan Bumi</p>
        </div>

        <div className="p-6">

          {/* ── Step 1: Form Registrasi ── */}
          {step === 'form' && (
            <form onSubmit={handleFormNext} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Akun Baru</h2>

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleInputChange} placeholder="Masukkan nama lengkap"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleInputChange} placeholder="Masukkan email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                  <span className="text-gray-400 font-normal ml-1">(wajib untuk SMS/WA)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleInputChange} placeholder="Contoh: 08123456789"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password" name="password" value={formData.password}
                    onChange={handleInputChange} placeholder="Minimal 8 karakter"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password" name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleInputChange} placeholder="Ulangi password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Tipe Akun */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Akun</label>
                <select
                  name="role" value={formData.role} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="individual_donor">Pendonor Individu</option>
                  <option value="corporate_donor">Pendonor Korporat</option>
                  <option value="recipient">Penerima Manfaat</option>
                  <option value="volunteer">Relawan</option>
                </select>
              </div>

              {error && <ErrorAlert message={error} />}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                Lanjutkan
              </button>

              <p className="text-center text-sm text-gray-600">
                Sudah punya akun?{' '}
                <button type="button" onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-700 font-medium">
                  Login di sini
                </button>
              </p>
            </form>
          )}

          {/* ── Step 2: Pilih Channel Verifikasi ── */}
          {step === 'choose_channel' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Pilih Metode Verifikasi</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Kode OTP 6 digit akan dikirim ke metode yang Anda pilih.
                </p>
              </div>

              {error && <ErrorAlert message={error} />}

              <div className="space-y-3">
                {/* Opsi Email */}
                <ChannelButton
                  icon={<Mail size={22} />}
                  label="Email"
                  desc={`Kode dikirim ke ${formData.email}`}
                  loading={loading && otpState.channel === 'email'}
                  disabled={loading}
                  onClick={() => handleSendOtp('email')}
                />

                {/* Opsi WhatsApp */}
                <ChannelButton
                  icon={<MessageSquare size={22} />}
                  label="WhatsApp"
                  desc={
                    !formData.phone.trim()
                      ? 'Isi nomor telepon di form sebelumnya'
                      : waStatus?.isReady
                      ? `Kode dikirim ke WA ${formData.phone}`
                      : waStatus?.hasQr
                      ? 'WhatsApp belum terhubung — scan QR di terminal server'
                      : 'WhatsApp sedang diinisialisasi...'
                  }
                  badge={
                    waStatus?.isReady
                      ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Wifi size={12} /> Terhubung
                        </span>
                      : <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <WifiOff size={12} />
                          {waStatus?.hasQr ? 'Perlu scan QR' : 'Belum siap'}
                        </span>
                  }
                  loading={loading && otpState.channel === 'whatsapp'}
                  disabled={loading || !formData.phone.trim() || !waStatus?.isReady}
                  onClick={() => handleSendOtp('whatsapp')}
                />
              </div>

              {/* Info jika WA belum ready */}
              {waStatus && !waStatus.isReady && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                  <p className="font-semibold mb-1">
                    {waStatus.hasQr ? '📱 WhatsApp perlu di-scan' : '⏳ WhatsApp sedang diinisialisasi'}
                  </p>
                  <p>
                    {waStatus.hasQr
                      ? 'Buka terminal server → scan QR code yang muncul menggunakan nomor WA admin/bot.'
                      : 'Tunggu beberapa detik lalu refresh halaman ini.'}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); }}
                className="w-full text-purple-600 hover:text-purple-700 font-medium text-sm py-2"
              >
                ← Kembali ke Form
              </button>
            </div>
          )}

          {/* ── Step 3: Input Kode OTP ── */}
          {step === 'verification' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Masukkan Kode OTP</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {success || `Kode OTP telah dikirim via ${otpState.channel}.`}
                </p>
              </div>

              {/* Badge channel */}
              <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                {otpState.channel === 'email' ? <Mail size={18} className="text-purple-600" /> : <MessageSquare size={18} className="text-purple-600" />}
                <span className="text-sm text-purple-700 font-medium capitalize">
                  Verifikasi via {otpState.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </span>
              </div>

              {/* Input OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode OTP (6 digit)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpState.code}
                  onChange={e => {
                    setOtpState(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-3xl tracking-[0.5em] font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              {error && <ErrorAlert message={error} />}

              <button
                type="submit"
                disabled={loading || otpState.code.length < 6}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" /> Memverifikasi...
                  </span>
                ) : 'Verifikasi & Daftar'}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex-1 text-purple-600 hover:text-purple-700 font-medium text-sm py-2 border border-purple-200 rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
                >
                  Kirim Ulang
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('choose_channel'); setError(''); setSuccess(''); }}
                  disabled={loading}
                  className="flex-1 text-gray-600 hover:text-gray-700 font-medium text-sm py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Ganti Metode
                </button>
              </div>
            </form>
          )}

          {/* ── Step 4: Sukses ── */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Pendaftaran Berhasil!</h2>
              <p className="text-gray-600">
                Akun Anda telah berhasil dibuat. Silakan login dengan email dan password Anda.
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

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
    <AlertCircle size={18} className="shrink-0" />
    <span className="text-sm">{message}</span>
  </div>
);

interface ChannelButtonProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  badge?: React.ReactNode;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

const ChannelButton: React.FC<ChannelButtonProps> = ({
  icon, label, desc, badge, loading, disabled, onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl text-left transition
      ${disabled
        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
        : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
      }`}
  >
    <span className={`p-2 rounded-lg shrink-0 ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'}`}>
      {loading ? <Loader size={22} className="animate-spin" /> : icon}
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-sm">{label}</p>
        {badge}
      </div>
      <p className="text-xs text-gray-500 truncate">{desc}</p>
    </div>
  </button>
);
