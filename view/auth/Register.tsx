
import React, { useState, useMemo, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, UserCircle, Truck, Utensils, ArrowRight, User, ArrowLeft, CheckCircle, Phone, AlertCircle, Check, X, MessageSquare, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UserRole } from '../../types';
import { db } from '../../services/db';

const API_URL = 'http://localhost:5000/api';

type OtpChannel = 'email' | 'whatsapp';

interface WaStatus {
  status: 'initializing' | 'qr_pending' | 'ready' | 'disconnected';
  isReady: boolean;
  hasQr: boolean;
}

interface RegisterViewProps {
  onNavigate: (view: 'login' | 'register' | 'forgot-password') => void;
  onRegister: (formData: any, remember: boolean) => void;
  disableSignup?: boolean;
}


export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate, onRegister, disableSignup }) => {
  // step: 'role' → 'form' → 'otp_channel' → 'otp_verify' → (register)
  const [step, setStep] = useState<'role' | 'form' | 'otp_channel' | 'otp_verify'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('recipient');
  const [showPass, setShowPass] = useState({ pass: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // OTP state
  const [otpChannel, setOtpChannel] = useState<OtpChannel>('email');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [waStatus, setWaStatus] = useState<WaStatus | null>(null);
  
  // Password Analysis
  const passwordAnalysis = useMemo(() => {
      const pwd = formData.password;
      return {
          length: pwd.length >= 8,
          number: /[0-9]/.test(pwd),
          uppercase: /[A-Z]/.test(pwd),
          symbol: /[^A-Za-z0-9]/.test(pwd)
      };
  }, [formData.password]);

  const passwordScore = useMemo(() => {
      let score = 0;
      if (passwordAnalysis.length) score += 25;
      if (passwordAnalysis.number) score += 25;
      if (passwordAnalysis.uppercase) score += 25;
      if (passwordAnalysis.symbol) score += 25;
      return score;
  }, [passwordAnalysis]);

  const strengthLabel = useMemo(() => {
      if (formData.password.length === 0) return { text: '', color: 'bg-stone-800' };
      if (passwordScore <= 25) return { text: 'Lemah', color: 'bg-red-500' };
      if (passwordScore <= 50) return { text: 'Kurang Kuat', color: 'bg-orange-500' };
      if (passwordScore <= 75) return { text: 'Cukup Kuat', color: 'bg-yellow-500' };
      return { text: 'Sangat Kuat', color: 'bg-green-500' };
  }, [passwordScore, formData.password]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!formData.email.includes('@')) newErrors.email = "Email tidak valid";
    if (!formData.phone || formData.phone.length < 9) newErrors.phone = "Nomor HP wajib diisi";
    
    // Strict Password Validation on Submit
    if (passwordScore < 75) newErrors.password = "Password belum memenuhi standar keamanan";
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Konfirmasi password tidak cocok!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Polling status WhatsApp setiap 3 detik saat di step otp_channel
  // Berhenti otomatis setelah WA ready
  useEffect(() => {
    if (step !== 'otp_channel') return;

    const checkWa = () => {
      fetch('http://localhost:5000/api/wa-status')
        .then(r => r.json())
        .then(setWaStatus)
        .catch(() => setWaStatus(null));
    };

    checkWa(); // cek langsung saat masuk step
    const interval = setInterval(checkWa, 3000); // polling tiap 3 detik
    return () => clearInterval(interval);
  }, [step]);

  // Step: form submit → arahkan ke pilih channel OTP
  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;
    setStep('otp_channel');
  };

  // Kirim OTP via channel yang dipilih
  const handleSendOtp = async (channel: OtpChannel) => {
    setOtpSending(true);
    setApiError(null);
    setOtpCode('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_REGISTRATION_OTP',
          data: { channel, email: formData.email, phone: formData.phone, name: formData.name },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal mengirim OTP');
      setOtpChannel(channel);
      setOtpIdentifier(result.data?.identifier || result.identifier);
      setStep('otp_verify');
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  // Verifikasi OTP lalu daftarkan user
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) { setApiError('Masukkan 6 digit kode OTP'); return; }
    setIsLoading(true);
    setApiError(null);
    try {
      // 1. Verifikasi OTP
      const verifyRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_REGISTRATION_OTP',
          data: { identifier: otpIdentifier, code: otpCode, channel: otpChannel },
        }),
      });
      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyResult.message || 'Kode OTP tidak valid');

      // 2. Daftarkan user
      const result = await db.registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: selectedRole,
        isNewUser: true,
      });

      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const wibTimestamp = `${jakartaDate.getFullYear()}-${String(jakartaDate.getMonth()+1).padStart(2,'0')}-${String(jakartaDate.getDate()).padStart(2,'0')} ${String(jakartaDate.getHours()).padStart(2,'0')}:${String(jakartaDate.getMinutes()).padStart(2,'0')}:${String(jakartaDate.getSeconds()).padStart(2,'0')}`;
      result.joinDate = wibTimestamp;
      await db.upsertUser({ ...result, joinDate: wibTimestamp });

      onRegister(result, rememberMe);
    } catch (error: any) {
      console.error("Registration Failed:", error);
      setApiError(error.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      setFormData({...formData, phone: val});
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('form');
  };

  return (
    <div className="flex w-full h-screen bg-[#FDFBF7] font-sans text-stone-900 overflow-hidden relative selection:bg-orange-500 selection:text-white">
      {/* Background Ambience (Cerah) */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-orange-100/50 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-100/50 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-stone-50/50 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-6/12 relative flex-col justify-between p-16 overflow-hidden border-r border-stone-200 h-full">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1080&auto=format&fit=crop" alt="Register Background" className="w-full h-full object-cover opacity-40 mix-blend-multiply scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent"></div>
        </div>
        <div className="relative z-10">
            <button onClick={() => step === 'role' ? onNavigate('login') : setStep('role')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xs uppercase tracking-widest">
                    {step === 'role' ? 'Kembali ke Login' : 'Kembali ke Pilih Peran'}
                </span>
            </button>
        </div>
        <div className="relative z-10 max-w-lg mb-12">
            <h1 className="text-6xl font-black leading-none mb-6 tracking-tight text-stone-900 drop-shadow-sm">
                <span className="text-stone-400">JOIN THE</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-700 filter drop-shadow-sm">MOVEMENT.</span>
            </h1>
            <p className="text-stone-600 font-medium leading-relaxed border-l-4 border-orange-600 pl-6 text-lg">
                Mulai perjalanan Anda mengurangi limbah pangan dan membantu sesama hari ini. Jadilah pahlawan bagi bumi dan kemanusiaan.
            </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-6/12 flex items-start lg:items-center justify-center p-6 relative z-10 bg-white/80 backdrop-blur-xl border-l border-stone-200 h-full overflow-y-auto">
          <div className="w-full max-w-[480px] py-8 lg:py-10 relative z-20">
             
             {disableSignup ? (
                <div className="animate-in fade-in zoom-in duration-500 text-center space-y-6">
                    <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce duration-[3s]">
                        <Lock className="w-10 h-10 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-black text-stone-900 tracking-tighter italic">PENDAFTARAN DITUTUP</h2>
                    <p className="text-stone-500 font-medium leading-relaxed">
                        Mohon maaf, saat ini kami sedang membatasi jumlah pengguna baru untuk optimalisasi sistem. Silakan hubungi admin atau coba lagi nanti.
                    </p>
                    <div className="pt-8">
                        <Button onClick={() => onNavigate('login')} variant="primary" className="w-full">
                            Kembali ke Login
                        </Button>
                    </div>
                </div>

             ) : step === 'role' ? (

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Mobile Back Button */}
                    <div className="lg:hidden mb-6">
                        <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-xs uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                        </button>
                    </div>

                    <div className="mb-8 lg:mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black text-stone-900 mb-2 tracking-tighter leading-none">Pilih Peran Anda</h2>
                        <p className="text-stone-500 text-sm font-medium">Tentukan bagaimana Anda ingin berkontribusi dalam ekosistem.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 'individual_donor', label: 'Donatur Individu', icon: User, desc: 'Donasikan surplus makanan pribadi Anda.' },
                            { id: 'corporate_donor', label: 'Donatur Korporat', icon: Utensils, desc: 'Solusi CSR & Pengelolaan Surplus Pangan Bisnis Anda.' },
                            { id: 'recipient', label: 'Penerima', icon: UserCircle, desc: 'Dapatkan akses ke makanan layak konsumsi di sekitar Anda.' },
                            { id: 'volunteer', label: 'Relawan', icon: Truck, desc: 'Bantu mendistribusikan makanan dari donatur ke penerima.' }
                        ].map((role) => (
                            <button 
                                key={role.id} 
                                type="button" 
                                onClick={() => handleRoleSelect(role.id as UserRole)} 
                                className="group relative flex items-center gap-6 p-6 rounded-3xl transition-all duration-300 border border-stone-100 bg-white hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 text-left"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                                    <role.icon className="w-8 h-8 text-stone-400 group-hover:text-orange-600 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-lg font-black text-stone-900 uppercase tracking-wider mb-1 group-hover:text-orange-600 transition-colors">{role.label}</span>
                                    <p className="text-sm text-stone-500 leading-relaxed">{role.desc}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="mt-12 text-center text-stone-400 text-xs font-medium">
                        Sudah punya akun? <button onClick={() => onNavigate('login')} className="text-orange-600 hover:text-orange-500 transition-colors ml-1 font-black underline decoration-orange-200 underline-offset-4 decoration-2">Masuk disini</button>
                    </p>
                </div>
             ) : step === 'form' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-stone-900 mb-1 tracking-tighter leading-none">Register</h2>
                            <p className="text-stone-500 text-sm font-medium">Lengkapi data diri sebagai <span className="text-orange-600 font-bold uppercase">{selectedRole === 'individual_donor' ? 'Donatur Individu' : selectedRole === 'corporate_donor' ? 'Donatur Korporat' : selectedRole === 'recipient' ? 'Penerima' : 'Relawan'}</span></p>
                        </div>
                        <button 
                            onClick={() => setStep('role')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-xs font-bold uppercase tracking-widest w-fit"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-xs font-bold animate-in slide-in-from-top-2 shadow-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleFormNext} className="space-y-5">
                        <Input 
                            label="Nama Lengkap" 
                            icon={<User className="w-5 h-5 group-focus-within:text-orange-600 transition-colors" />}
                            placeholder={
                                selectedRole === 'recipient' ? "Cth: Panti Asuhan Kasih Ibu" : 
                                (selectedRole === 'individual_donor' || selectedRole === 'corporate_donor') ? "Cth: Toko Roti Berkah / Budi Santoso" : 
                                "Contoh: Budi Santoso"
                            } 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            className="!bg-stone-50 !border-stone-200 !text-stone-900 focus:!border-orange-500 focus:!bg-white rounded-2xl py-3.5 transition-all font-medium"
                            labelClassName="text-orange-600 font-black text-[10px] uppercase tracking-widest group-focus-within:text-orange-500"
                            containerClassName="space-y-1"
                            error={errors.name}
                        />
                        
                        <Input 
                            label="Email Address" 
                            type="email" 
                            icon={<Mail className="w-5 h-5 group-focus-within:text-orange-600 transition-colors" />}
                            placeholder="nama@email.com" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            className="!bg-stone-50 !border-stone-200 !text-stone-900 focus:!border-orange-500 focus:!bg-white rounded-2xl py-3.5 transition-all font-medium"
                            labelClassName="text-orange-600 font-black text-[10px] uppercase tracking-widest group-focus-within:text-orange-500"
                            containerClassName="space-y-1"
                            error={errors.email}
                        />

                        <Input 
                            label="Nomor WhatsApp" 
                            type="tel" 
                            placeholder="812-3456-7890" 
                            leftAddon={<span className="text-stone-400 font-bold px-1">+62</span>}
                            value={formData.phone} 
                            onChange={handlePhoneChange}
                            className="!bg-stone-50 !border-stone-200 !text-stone-900 focus:!border-orange-500 focus:!bg-white rounded-r-2xl py-3.5 transition-all font-medium"
                            labelClassName="text-orange-600 font-black text-[10px] uppercase tracking-widest group-focus-within:text-orange-500"
                            containerClassName="space-y-1"
                            error={errors.phone}
                        />
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input 
                                    label="Password" 
                                    type={showPass.pass ? "text" : "password"} 
                                    icon={<Lock className="w-5 h-5 group-focus-within:text-orange-600 transition-colors" />}
                                    placeholder="••••••" 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className={`!bg-stone-50 !border-stone-200 !text-stone-900 focus:!border-orange-500 focus:!bg-white rounded-2xl py-3.5 transition-all font-medium ${errors.password ? '!border-red-500' : ''}`}
                                    labelClassName="text-orange-600 font-black text-[10px] uppercase tracking-widest group-focus-within:text-orange-500"
                                    containerClassName="space-y-1"
                                    rightElement={
                                        <button type="button" onClick={() => setShowPass({...showPass, pass: !showPass.pass})} className="text-stone-300 hover:text-orange-600 transition-colors">
                                            {showPass.pass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                />
                                
                                {/* Dynamic Alert & Strength Meter */}
                                {formData.password && (
                                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 space-y-3 animate-in slide-in-from-top-2">
                                        {/* Strength Bar */}
                                        <div>
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Kekuatan</span>
                                                <span className={`text-[10px] font-bold ${strengthLabel.color.replace('bg-', 'text-')}`}>
                                                    {strengthLabel.text}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 h-1.5">
                                                {[25, 50, 75, 100].map((step, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`flex-1 rounded-full transition-all duration-500 ${
                                                            passwordScore >= step ? strengthLabel.color : 'bg-stone-200'
                                                        }`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Requirements List */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { met: passwordAnalysis.length, label: "Min 8 Karakter" },
                                                { met: passwordAnalysis.number, label: "Ada Angka (0-9)" },
                                                { met: passwordAnalysis.uppercase, label: "Huruf Besar (A-Z)" },
                                                { met: passwordAnalysis.symbol, label: "Simbol (!@#$)" },
                                            ].map((req, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${req.met ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-stone-100 border-stone-200 text-stone-300'}`}>
                                                        {req.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                                    </div>
                                                    <span className={`text-[10px] font-medium transition-colors ${req.met ? 'text-stone-700' : 'text-stone-400'}`}>{req.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {errors.password && <p className="text-red-500 text-[10px] font-bold ml-2">{errors.password}</p>}
                            </div>

                            <div className="space-y-1">
                                <Input 
                                    label="Konfirmasi Password" 
                                    type={showPass.confirm ? "text" : "password"} 
                                    icon={<Lock className="w-5 h-5 group-focus-within:text-orange-600 transition-colors" />}
                                    placeholder="••••••" 
                                    value={formData.confirmPassword} 
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                                    className={`!bg-stone-50 !border-stone-200 !text-stone-900 focus:!border-orange-500 focus:!bg-white rounded-2xl py-3.5 transition-all font-medium ${errors.confirmPassword ? '!border-red-500' : ''}`}
                                    labelClassName="text-orange-600 font-black text-[10px] uppercase tracking-widest group-focus-within:text-orange-500"
                                    containerClassName="space-y-1"
                                    rightElement={
                                        <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="text-stone-300 hover:text-orange-600 transition-colors">
                                            {showPass.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                />
                                {/* Real-time Match Indicator */}
                                {formData.confirmPassword && (
                                    <div className={`flex items-center gap-2 mt-1.5 ml-1 transition-all duration-300 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                        {formData.password === formData.confirmPassword 
                                            ? <Check className="w-3.5 h-3.5" /> 
                                            : <X className="w-3.5 h-3.5" />
                                        }
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {formData.password === formData.confirmPassword ? "Password Cocok" : "Password Tidak Cocok"}
                                        </span>
                                    </div>
                                )}
                                {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold ml-2">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                        
                        {/* Remember Me Checkbox for Registration Auto-Login */}
                        <div className="flex items-center gap-3 ml-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-5 h-5 rounded border-stone-300 bg-stone-50 text-orange-600 focus:ring-offset-0 focus:ring-2 focus:ring-orange-500/50 accent-orange-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-stone-500 group-hover:text-orange-600 transition-colors select-none">Ingat Saya (Auto Login)</span>
                            </label>
                        </div>

                        <div className="pt-2 relative z-50">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                isLoading={isLoading} 
                                className="w-full h-16 text-base font-black bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white border-0 rounded-2xl tracking-[0.2em] uppercase shadow-[0_10px_40px_-10px_rgba(234,88,12,0.3)] transition-all transform hover:-translate-y-1 cursor-pointer group overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">LANJUTKAN <ArrowRight className="w-5 h-5" /></span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </Button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-stone-400 text-xs font-medium">
                        Sudah punya akun? <button onClick={() => onNavigate('login')} className="text-orange-600 hover:text-orange-500 transition-colors ml-1 font-black underline decoration-orange-200 underline-offset-4 decoration-2">Masuk disini</button>
                    </p>
                </div>

             ) : step === 'otp_channel' ? (

               /* ── Step: Pilih Channel OTP ── */
               <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                 <div>
                   <button onClick={() => setStep('form')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-xs uppercase tracking-widest mb-6">
                     <ArrowLeft className="w-4 h-4" /> Kembali
                   </button>
                   <h2 className="text-3xl font-black text-stone-900 tracking-tighter">Verifikasi Identitas</h2>
                   <p className="text-stone-500 text-sm font-medium mt-1">Pilih metode pengiriman kode OTP 6 digit.</p>
                 </div>

                 {apiError && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-xs font-bold">
                     <AlertCircle className="w-5 h-5 shrink-0" /><p>{apiError}</p>
                   </div>
                 )}

                 <div className="space-y-3">
                   {/* Email */}
                   <button
                     type="button"
                     disabled={otpSending}
                     onClick={() => handleSendOtp('email')}
                     className="w-full flex items-center gap-4 p-5 border-2 border-stone-100 bg-white rounded-2xl text-left hover:border-orange-500 hover:shadow-lg hover:shadow-orange-100 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <span className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors shrink-0">
                       {otpSending && otpChannel === 'email' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mail className="w-6 h-6" />}
                     </span>
                     <div>
                       <p className="font-black text-stone-900 uppercase tracking-wider text-sm">Email</p>
                       <p className="text-xs text-stone-500 mt-0.5">Kirim ke {formData.email}</p>
                     </div>
                     <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 ml-auto transition-colors" />
                   </button>

                   {/* WhatsApp */}
                   <button
                     type="button"
                     disabled={otpSending}
                     onClick={() => handleSendOtp('whatsapp')}
                     className="w-full flex items-center gap-4 p-5 border-2 border-stone-100 bg-white rounded-2xl text-left hover:border-orange-500 hover:shadow-lg hover:shadow-orange-100 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <span className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors shrink-0">
                       {otpSending && otpChannel === 'whatsapp' ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageSquare className="w-6 h-6" />}
                     </span>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <p className="font-black text-stone-900 uppercase tracking-wider text-sm">WhatsApp</p>
                         {waStatus?.isReady
                           ? <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full"><Wifi className="w-3 h-3" /> Siap</span>
                           : <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full"><WifiOff className="w-3 h-3" /> {waStatus?.hasQr ? 'Scan QR dulu' : 'Belum siap'}</span>
                         }
                       </div>
                       <p className="text-xs text-stone-500 mt-0.5 truncate">
                         {waStatus?.isReady ? `Kirim ke +62${formData.phone}` : 'Scan QR di terminal server terlebih dahulu'}
                       </p>
                     </div>
                     <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 ml-auto transition-colors shrink-0" />
                   </button>
                 </div>

                 {waStatus && !waStatus.isReady && (
                   <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs font-medium">
                     <p className="font-bold mb-1">
                       {waStatus.hasQr ? '📱 WhatsApp perlu di-scan' : '⏳ WhatsApp sedang diinisialisasi'}
                     </p>
                     <p>{waStatus.hasQr ? 'Buka terminal server → scan QR code yang muncul dengan nomor WA admin/bot.' : 'Tunggu beberapa detik lalu refresh halaman.'}</p>
                   </div>
                 )}
               </div>

             ) : step === 'otp_verify' ? (

               /* ── Step: Input Kode OTP ── */
               <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                 <div>
                   <button onClick={() => setStep('otp_channel')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-xs uppercase tracking-widest mb-6">
                     <ArrowLeft className="w-4 h-4" /> Ganti Metode
                   </button>
                   <h2 className="text-3xl font-black text-stone-900 tracking-tighter">Masukkan OTP</h2>
                   <p className="text-stone-500 text-sm font-medium mt-1">
                     Kode 6 digit telah dikirim via <span className="font-bold text-orange-600 capitalize">{otpChannel === 'whatsapp' ? 'WhatsApp' : 'Email'}</span>
                   </p>
                 </div>

                 {/* Badge channel */}
                 <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                   {otpChannel === 'email'
                     ? <Mail className="w-5 h-5 text-orange-600 shrink-0" />
                     : <MessageSquare className="w-5 h-5 text-green-600 shrink-0" />
                   }
                   <span className="text-sm font-bold text-stone-700 truncate">{otpIdentifier}</span>
                 </div>

                 {apiError && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-xs font-bold">
                     <AlertCircle className="w-5 h-5 shrink-0" /><p>{apiError}</p>
                   </div>
                 )}

                 <form onSubmit={handleRegister} className="space-y-5">
                   <div className="space-y-2">
                     <label className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Kode OTP</label>
                     <input
                       type="text"
                       inputMode="numeric"
                       value={otpCode}
                       onChange={e => { setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6)); setApiError(null); }}
                       placeholder="000000"
                       maxLength={6}
                       className="w-full px-6 py-5 text-center text-4xl tracking-[0.6em] font-mono font-black border-2 border-stone-200 rounded-2xl focus:outline-none focus:border-orange-500 bg-stone-50 focus:bg-white transition-all"
                     />
                   </div>

                   <Button
                     type="submit"
                     variant="primary"
                     isLoading={isLoading}
                     className="w-full h-16 text-base font-black bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white border-0 rounded-2xl tracking-[0.2em] uppercase shadow-[0_10px_40px_-10px_rgba(234,88,12,0.3)] transition-all transform hover:-translate-y-1 cursor-pointer group overflow-hidden"
                   >
                     <span className="relative z-10 flex items-center justify-center gap-2">VERIFIKASI & DAFTAR <CheckCircle className="w-5 h-5" /></span>
                   </Button>

                   <button
                     type="button"
                     disabled={otpSending}
                     onClick={() => handleSendOtp(otpChannel)}
                     className="w-full text-center text-stone-400 hover:text-orange-600 text-xs font-bold uppercase tracking-widest transition-colors py-2 disabled:opacity-50"
                   >
                     {otpSending ? 'Mengirim ulang...' : 'Kirim Ulang Kode'}
                   </button>
                 </form>
               </div>

             ) : null}
          </div>
      </div>
    </div>
  );
};
