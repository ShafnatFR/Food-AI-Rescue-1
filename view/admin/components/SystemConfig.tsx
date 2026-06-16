import React, { useState, useEffect } from 'react';
import { Settings, Lock, Loader2, CheckCircle, Bug, Palette, PhoneCall, Trophy, Leaf, Link2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { db } from '../../../services/db';

interface SystemSetting {
    id: string;
    name: string;
    description: string;
    value: boolean | number | string;
    type: 'toggle' | 'slider' | 'select' | 'input' | 'phone';
    category: string;

    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
    unit?: string;
}

export const SystemConfig: React.FC<{ appSettings?: any, setAppSettings?: any, currentUser?: any }> = ({ appSettings, setAppSettings, currentUser }) => {
    const [settings, setSettings] = useState<SystemSetting[]>([
        // Emergency Controls
        { id: 'maintenance', name: 'Maintenance Mode', description: 'Matikan semua akses user sementara.', value: appSettings?.maintenance || false, type: 'toggle', category: 'emergency' },
        { id: 'disable_signup', name: 'Disable New Signups', description: 'Cegah pendaftaran user baru.', value: appSettings?.disable_signup || false, type: 'toggle', category: 'emergency' },
        { id: 'readonly_mode', name: 'Read-Only Mode', description: 'User hanya bisa melihat, tidak bisa menambah/edit data.', value: appSettings?.readonly_mode || false, type: 'toggle', category: 'emergency' },
        
        // Security
        { id: 'require_otp_verification', name: 'Verifikasi OTP (Email/WA)', description: 'Wajibkan user baru untuk verifikasi OTP saat mendaftar.', value: appSettings?.require_otp_verification ?? true, type: 'toggle', category: 'security' },
        { id: 'require_admin_verification', name: 'Verifikasi Manual Admin', description: 'Wajibkan admin menyetujui akun baru secara manual (akun baru akan berstatus pending).', value: appSettings?.require_admin_verification ?? false, type: 'toggle', category: 'security' },

        
        // Branding
        { id: 'appName', name: 'Nama Aplikasi', description: 'Nama utama aplikasi yang ditampilkan.', value: appSettings?.appName || 'Food AI Rescue', type: 'input', category: 'branding' },
        { id: 'appSlogan', name: 'Slogan Aplikasi', description: 'Tagline aplikasi.', value: appSettings?.appSlogan || 'Selamatkan Makanan, Selamatkan Bumi', type: 'input', category: 'branding' },
        
        // Contact
        { id: 'supportPhone', name: 'Nomor WhatsApp Bantuan', description: 'Nomor WA CS.', value: appSettings?.supportPhone || '628123456789', type: 'phone', category: 'contact' },

        { id: 'supportEmail', name: 'Email Support', description: 'Email bantuan pengguna.', value: appSettings?.supportEmail || 'support@foodairescue.id', type: 'input', category: 'contact' },
        
        // Gamification
        { id: 'pointsPerKg', name: 'Poin per KG Terselamatkan', description: 'Jumlah poin yang diberikan kepada Relawan/Donatur per kg makanan.', value: appSettings?.pointsPerKg || 10, type: 'slider', min: 1, max: 100, unit: ' Poin', category: 'gamification' },
        { id: 'pointsPerTrx', name: 'Poin per Transaksi', description: 'Jumlah poin dasar per transaksi berhasil.', value: appSettings?.pointsPerTrx || 5, type: 'slider', min: 1, max: 50, unit: ' Poin', category: 'gamification' },
        
        // ESG
        { id: 'co2Multiplier', name: 'Pengali CO2 (kg CO2 per kg makanan)', description: 'Standar konversi pengurangan emisi GRK.', value: appSettings?.co2Multiplier || 2.5, type: 'input', category: 'esg' },

        // External API
        { id: 'whatsappGateway', name: 'Endpoint WhatsApp Gateway', description: 'URL API Gateway untuk notifikasi.', value: appSettings?.whatsappGateway || '', type: 'input', category: 'integrations' },
        { id: 'whatsappApiKey', name: 'API Key WhatsApp Gateway', description: 'Token autentikasi WA API.', value: appSettings?.whatsappApiKey || '', type: 'input', category: 'integrations' },

        // Debug
        { id: 'disableExpiryLogic', name: 'Abaikan Kedaluwarsa Data (Debug)', description: 'Tampilkan semua makanan tanpa mengecek waktu kedaluwarsa (bypass isFoodExpired frontend & backend).', value: appSettings?.disableExpiryLogic || false, type: 'toggle', category: 'debug' },
        { id: 'prevent_duplicate_account', name: 'Cegah Duplikasi Akun (Debug)', description: 'Cegah pendaftaran jika email atau nomor telepon sudah terdaftar di database.', value: appSettings?.prevent_duplicate_account ?? true, type: 'toggle', category: 'debug' },
        { id: 'allow_gallery_upload', name: 'Izinkan Upload Galeri (AI)', description: 'Tampilkan tombol Pilih File / Unggah dari Galeri pada halaman verifikasi AI (kamera tetap jadi utama).', value: appSettings?.allow_gallery_upload ?? true, type: 'toggle', category: 'debug' }
    ]);


    useEffect(() => {
        if (appSettings) {
             setSettings(prev => prev.map(s => {
                 if (appSettings[s.id] !== undefined) {
                     return { ...s, value: appSettings[s.id] };
                 }
                 return s;
             }));
        }
    }, [appSettings]);


    const [activeCategory, setActiveCategory] = useState('emergency');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const categories = [
        { id: 'emergency', name: 'Emergency Controls', icon: Lock, color: 'red' },
        { id: 'security', name: 'Keamanan & Autentikasi', icon: Lock, color: 'orange' },
        { id: 'branding', name: 'Branding & Identitas', icon: Palette, color: 'orange' },
        { id: 'contact', name: 'Kontak & Support', icon: PhoneCall, color: 'orange' },
        { id: 'gamification', name: 'Aturan Gamifikasi', icon: Trophy, color: 'orange' },
        { id: 'esg', name: 'Kalkulasi Dampak ESG', icon: Leaf, color: 'orange' },
        { id: 'integrations', name: 'Integrasi Eksternal', icon: Link2, color: 'orange' },
        { id: 'debug', name: 'Developer & Debugging', icon: Bug, color: 'orange' },
    ];


    const updateSetting = (id: string, value: boolean | number | string) => {
        setSettings(settings.map(s => s.id === id ? { ...s, value } : s));
        setHasChanges(true);
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        // Map settings to push to backend
        const settingsToUpdate: any = {};
        settings.forEach(s => {
            settingsToUpdate[s.id] = s.value;
        });


        try {
            const updated = await db.updateSettings(settingsToUpdate, currentUser);
            if (setAppSettings) setAppSettings(updated);
            setHasChanges(false);
            setSuccessMessage('Konfigurasi berhasil disimpan!');
        } catch (e) {
            console.error("Failed to save settings", e);
        }
        setIsSaving(false);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const filteredSettings = settings.filter(s => s.category === activeCategory);
    const activeCatego = categories.find(c => c.id === activeCategory);

    const renderSettingControl = (setting: SystemSetting) => {
        switch (setting.type) {
            case 'toggle':
                return (
                    <button
                        onClick={() => updateSetting(setting.id, !setting.value)}
                        className={`w-14 h-7 rounded-full p-1 transition-colors ${setting.value ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${setting.value ? 'translate-x-7' : ''}`} />
                    </button>
                );
            case 'slider':
                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            value={setting.value as number}
                            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
                            className="flex-1 accent-orange-500"
                        />
                        <span className="text-sm font-bold text-orange-500 min-w-[60px] text-right">
                            {setting.value}{setting.unit}
                        </span>
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={setting.value as string}
                        onChange={(e) => updateSetting(setting.id, e.target.value)}
                        className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:border-orange-500 min-w-[150px]"
                    >
                        {setting.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );
            case 'input':
                return (
                    <input
                        type="text"
                        value={setting.value as string}
                        onChange={(e) => updateSetting(setting.id, e.target.value)}
                        className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:border-orange-500 min-w-[200px]"
                    />
                );
            case 'phone':
                const valStr = String(setting.value || '').replace(/\D/g, '');
                const countryCodes = ['+1', '+44', '+60', '+62', '+65']; 
                let codeStr = '+62'; 
                let localNum = valStr;
                
                if (valStr.startsWith('62')) { codeStr = '+62'; localNum = valStr.substring(2); }
                else if (valStr.startsWith('1')) { codeStr = '+1'; localNum = valStr.substring(1); }
                else if (valStr.startsWith('44')) { codeStr = '+44'; localNum = valStr.substring(2); }
                else if (valStr.startsWith('60')) { codeStr = '+60'; localNum = valStr.substring(2); }
                else if (valStr.startsWith('65')) { codeStr = '+65'; localNum = valStr.substring(2); }

                const formatNumber = (num: string) => {
                    let cleaned = num.replace(/\D/g, '');
                    if (cleaned.length <= 3) return cleaned;
                    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
                    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 15)}`;
                };

                const formattedLocalNum = formatNumber(localNum);

                const handleCodeChange = (newCode: string) => {
                    const cleanCode = newCode.replace('+', '');
                    const cleanLocal = formattedLocalNum.replace(/\D/g, '');
                    updateSetting(setting.id, `${cleanCode}${cleanLocal}`);
                };

                const handleNumberChange = (newNum: string) => {
                    const cleanCode = codeStr.replace('+', '');
                    const cleanLocal = newNum.replace(/\D/g, '');
                    updateSetting(setting.id, `${cleanCode}${cleanLocal}`);
                };

                return (
                    <div className="flex items-center gap-2">
                        <div className="relative shrink-0">
                            <select 
                                value={codeStr}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-black text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-sm"
                            >
                                {countryCodes.map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={formattedLocalNum}
                            placeholder="812-3456-7890"
                            onChange={(e) => handleNumberChange(e.target.value)}
                            maxLength={15}
                            className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:border-orange-500 flex-1 min-w-[150px] font-mono tracking-wider font-bold"
                        />
                    </div>
                );
        }
    };


    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-orange-500" /> System Configuration
                </h2>
                <Button onClick={handleSaveConfig} disabled={!hasChanges || isSaving} className="w-auto h-9 text-xs">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
            </div>

            <div className="flex gap-6">
                {/* Category Sidebar */}
                <div className="w-56 shrink-0 space-y-2">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const colorClasses = {
                            red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
                            orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
                        };

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${activeCategory === cat.id
                                        ? `${colorClasses[cat.color as keyof typeof colorClasses]} font-bold`
                                        : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Settings Panel */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                        <div className={`p-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3 ${activeCatego?.color === 'red' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                            {activeCatego && <activeCatego.icon className={`w-5 h-5 ${activeCatego.color === 'red' ? 'text-red-500' : 'text-orange-500'}`} />}
                            <h3 className="font-bold text-stone-900 dark:text-white">{activeCatego?.name}</h3>
                        </div>

                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {filteredSettings.map(setting => (
                                <div key={setting.id} className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                    <div className="flex-1 pr-4">
                                        <p className="font-bold text-stone-900 dark:text-white">{setting.name}</p>
                                        <p className="text-xs text-stone-500">{setting.description}</p>
                                    </div>
                                    {renderSettingControl(setting)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
