import React from 'react';
import { Hammer, Lock, RefreshCw, MessageSquare } from 'lucide-react';

interface MaintenancePageProps {
    appSettings?: any;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ appSettings }) => {

    return (
        <div className="min-h-screen bg-[#0A0502] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 rounded-full blur-[120px] animate-pulse duration-[5s]"></div>
            <div className="max-w-4xl w-full space-y-12 relative z-10 animate-in fade-in zoom-in duration-1000">
                {/* Illustration */}
                <div className="relative mx-auto w-fit group">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-[3rem] blur-2xl group-hover:bg-orange-500/40 transition-all duration-700"></div>
                    <img 
                        src="/assets/maintenance.png" 
                        alt="Maintenance" 
                        className="w-full max-w-lg rounded-[3rem] border border-white/10 shadow-2xl relative z-10 transform group-hover:scale-[1.02] transition-transform duration-700"
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
                        <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px]">Pusat Pemeliharaan</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Sistem Sedang <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Pembaruan</span>
                    </h1>

                    <p className="max-w-xl mx-auto text-stone-400 font-medium text-sm md:text-base leading-relaxed">
                        Kami sedang melakukan peningkatan performa dan penyesuaian infrastruktur untuk memberikan pengalaman operasional yang lebih mulus. Terima kasih atas kesabaran Anda.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
                        <span className="text-white font-bold text-xs uppercase tracking-widest">Estimasi Selesai: Segera</span>
                    </div>
                    <button 
                        onClick={() => window.open(`https://wa.me/${appSettings?.supportPhone || '628123456789'}`, '_blank')}
                        className="flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-900/20 active:scale-95"
                    >
                        <MessageSquare className="w-5 h-5" /> Hubungi Admin (WhatsApp)
                    </button>

                </div>

                <div className="pt-12 text-stone-600 text-[9px] font-black uppercase tracking-[0.3em]">
                    &copy; 2026 {appSettings?.appName || 'Food AI Rescue'} &bull; Operasional Terintegrasi
                </div>

            </div>
        </div>
    );
};
