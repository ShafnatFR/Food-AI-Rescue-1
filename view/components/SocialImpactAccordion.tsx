import React, { useState } from 'react';
import { Info, ChevronDown, Leaf, Award } from 'lucide-react';

interface ImpactBreakdownItem {
  name: string;
  weightKg: number;
  factor: number;
  result: number;
  category: string;
}

interface SocialImpactAccordionProps {
  socialImpact: any;
  weightPerUnit: number;
}

export const SocialImpactAccordion: React.FC<SocialImpactAccordionProps> = ({ socialImpact, weightPerUnit }) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [activeCalcTab, setActiveCalcTab] = useState<'co2' | 'social'>('co2');

  if (!socialImpact) return null;

  return (
    <div className="mt-4">
        <button 
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="flex items-center gap-2 text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-widest px-2"
        >
            <Info className="w-3.5 h-3.5" /> Info Metodologi AI
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isInfoExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-500 ${isInfoExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="bg-black/40 border border-[#2C1810] rounded-2xl p-5 space-y-6">
                <div className="flex bg-stone-900/50 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setActiveCalcTab('co2')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeCalcTab === 'co2' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-50'}`}>
                        <Leaf className="w-3 h-3" /> CO2 Saved Breakdown
                    </button>
                    <button onClick={() => setActiveCalcTab('social')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeCalcTab === 'social' ? 'bg-indigo-600 text-white shadow-lg' : 'text-stone-50'}`}>
                        <Award className="w-3 h-3" /> Social Score Breakdown
                    </button>
                </div>

                {/* DYNAMIC BREAKDOWN DISPLAY */}
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div>
                        <p className="font-bold text-stone-400 mb-3 text-[10px] uppercase tracking-widest">
                            METODOLOGI PERHITUNGAN (LCA STANDARD)
                        </p>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-6">
                            <code className={`block text-[10px] font-mono ${activeCalcTab === 'co2' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                {activeCalcTab === 'co2' 
                                    ? 'CO2 Saved = Σ (Berat Komponen x Faktor Emisi Kategori)' 
                                    : 'Total Poin = Σ (Berat Komponen x Faktor Dampak Sosial)'}
                            </code>
                        </div>

                        {/* SECTION 1: ANALISIS KANDUNGAN PER 1 PORSI */}
                        <div className="flex justify-between items-end mb-2">
                            <p className="font-bold text-stone-300 text-[10px] uppercase tracking-widest">
                                ANALISIS KANDUNGAN PER 1 PORSI
                            </p>
                            <span className="text-[10px] font-black text-orange-500">
                                Bobot: {weightPerUnit}g
                            </span>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                            {(activeCalcTab === 'co2' 
                                ? (socialImpact.co2Breakdown || socialImpact.impactDetails?.co2Breakdown)
                                : (socialImpact.socialBreakdown || socialImpact.impactDetails?.socialBreakdown)
                            )?.map((item: ImpactBreakdownItem, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] border-b border-white/10 pb-1 last:border-0">
                                    <span className="text-stone-300">{item.name}</span>
                                    <div className="text-right font-mono">
                                        <span className="text-stone-500">{item.weightKg}kg</span>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-white/20">
                                <span className="text-[10px] font-bold text-stone-400">Total {activeCalcTab === 'co2' ? 'CO2' : 'Poin'} (1 Porsi)</span>
                                <span className={`font-black text-sm ${activeCalcTab === 'co2' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                    {activeCalcTab === 'co2' 
                                        ? `${socialImpact.co2PerPortion || socialImpact.impactDetails?.co2PerPortion || 0} kg CO2`
                                        : `${socialImpact.pointsPerPortion || socialImpact.impactDetails?.pointsPerPortion || 0} Pts`
                                    }
                                </span>
                            </div>
                        </div>

                        {/* SECTION 2: AKUMULASI TOTAL */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 text-center">
                            <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1">AKUMULASI TOTAL DONASI</p>
                            <p className="text-xl font-black text-white">
                                {activeCalcTab === 'co2' ? (socialImpact.co2PerPortion || socialImpact.impactDetails?.co2PerPortion || 0) : (socialImpact.pointsPerPortion || socialImpact.impactDetails?.pointsPerPortion || 0)} 
                                <span className="text-stone-500 text-sm mx-2">x</span> 
                                <span className="text-orange-500">{socialImpact.portionCount || 1} Porsi</span> 
                                <span className="text-stone-500 text-sm mx-2">=</span> 
                                <span className={`${activeCalcTab === 'co2' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                    {activeCalcTab === 'co2' 
                                        ? `${socialImpact.co2Saved || 0} kg`
                                        : `${socialImpact.totalPoints || 0}`
                                    }
                                </span>
                            </p>
                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${activeCalcTab === 'co2' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                {activeCalcTab === 'co2' ? 'CO2' : 'POIN'}
                            </p>
                        </div>

                        {/* SECTION 3: RINCIAN TOTAL */}
                        <p className="font-bold text-orange-500 mb-2 text-[10px] uppercase tracking-widest">
                            PERHITUNGAN LEBIH LANJUT (BATCH TOTAL)
                        </p>
                        <p className="text-[9px] font-bold text-stone-500 mb-2 uppercase tracking-widest">
                            RINCIAN KOMPONEN TERDETEKSI:
                        </p>

                        <div className="space-y-3">
                            {(activeCalcTab === 'co2' 
                                ? (socialImpact.co2Breakdown || socialImpact.impactDetails?.co2Breakdown)
                                : (socialImpact.socialBreakdown || socialImpact.impactDetails?.socialBreakdown)
                            )?.map((item: ImpactBreakdownItem, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-stone-300 font-bold">{item.name}</span>
                                    </div>
                                    <div className="text-right font-mono">
                                        <div className="text-stone-400 text-[9px]">
                                            {item.weightKg}kg x {socialImpact.portionCount || 1} x {item.factor} =
                                        </div>
                                        <span className={`font-bold ${activeCalcTab === 'co2' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                            {(item.result * (socialImpact.portionCount || 1)).toFixed(1)} {activeCalcTab === 'co2' ? 'kg' : 'pts'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-white/10 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">TOTAL {activeCalcTab === 'co2' ? 'EMISI' : 'POIN'}</span>
                                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">TERCEGAH</span>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black block leading-none ${activeCalcTab === 'co2' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                    {activeCalcTab === 'co2' 
                                        ? `${socialImpact.co2Saved || 0} kg`
                                        : `${socialImpact.totalPoints || 0}`
                                    }
                                </span>
                                <span className={`text-[10px] font-bold uppercase ${activeCalcTab === 'co2' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                                    {activeCalcTab === 'co2' ? 'CO2' : 'POIN'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
