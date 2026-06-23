import React from 'react';
import { ShieldCheck, Info, Check, X, Sparkles, Biohazard, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';

interface AIVerificationCardProps {
    verification: {
        isEdible: boolean;
        halalScore: number;
        reason?: string;
        ingredients?: string[];
        allergens?: string[];
    };
}

export const AIVerificationCard: React.FC<AIVerificationCardProps> = ({ verification }) => {
    const isHalal = verification.halalScore >= 80;
    const isHaram = verification.halalScore < 40;
    const isSyubhat = verification.halalScore >= 40 && verification.halalScore < 80;

    return (
        <div className="bg-[#2e3132] text-[#f0f1f2] rounded-2xl p-6 shadow-md relative overflow-hidden font-body-md animate-in fade-in slide-in-from-bottom-4">
            {/* Decorative background glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-[#5bffa0] w-6 h-6" />
                    <h3 className="font-bold text-lg tracking-wide uppercase">Verifikasi Food AI</h3>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest border border-white/10 ${verification.isEdible ? 'bg-green-900/40 text-[#5bffa0]' : 'bg-red-900/40 text-red-400'}`}>
                    {verification.isEdible ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {verification.isEdible ? "Layak" : "Tidak Layak"}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {/* Halal Status Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="font-mono text-[11px] mb-1 uppercase tracking-widest opacity-80 font-semibold" style={{ color: isHalal ? '#5bffa0' : isSyubhat ? '#ffb77f' : '#ffdad6' }}>
                        Status Halal
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="font-bold text-xl" style={{ color: isHalal ? '#5bffa0' : isSyubhat ? '#ffb77f' : '#ffdad6' }}>
                            {isHalal ? "Terverifikasi" : isSyubhat ? "Syubhat" : "Tidak Halal"}
                        </p>
                        {isHalal ? <CheckCircle className="w-6 h-6 text-[#5bffa0]" /> : isSyubhat ? <Info className="w-6 h-6 text-[#ffb77f]" /> : <Biohazard className="w-6 h-6 text-[#ffdad6]" />}
                    </div>
                </div>

                {/* Composition / Ingredients Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-center">
                    <p className="font-mono text-[11px] text-[#e1e2e8] mb-2 uppercase tracking-widest opacity-80 font-semibold">Komposisi Terdeteksi</p>
                    <div className="flex flex-wrap gap-2">
                        {verification.ingredients && verification.ingredients.length > 0 ? (
                            verification.ingredients.map((ing, i) => (
                                <span key={i} className="text-xs font-mono bg-white/10 px-2 py-1 rounded-md text-[#f0f1f2]">
                                    {ing}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-white/50 italic">Tidak terdeteksi</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Allergens — always visible */}
            <div className="mt-4 bg-red-500/10 rounded-xl p-4 border border-red-500/20 relative z-10">
                <p className="font-mono text-[11px] text-red-400 mb-2 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Peringatan Alergen
                </p>
                <div className="flex flex-wrap gap-2">
                    {verification.allergens && verification.allergens.length > 0 ? (
                        verification.allergens.map((allergen, i) => (
                            <span key={i} className="text-xs font-mono bg-red-500/20 px-3 py-1.5 rounded-lg text-red-200 uppercase tracking-wider font-bold">
                                {allergen}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-white/40 italic">Tidak ada alergen kritis terdeteksi.</span>
                    )}
                </div>
            </div>
        </div>
    );
};
