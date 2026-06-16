
import React from 'react';
import { CheckCircle2, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/Button';

interface ActionBarProps {
    onCancel: () => void;
    onVerify: () => void;
    onComplete?: () => void;
    onAccept?: () => void;
    onReject?: () => void;
    isVerifying: boolean;
    isCompleting?: boolean;
    isCompleted?: boolean; 
    isInProgress?: boolean;
    isCancelled?: boolean;
    isWaitingProvider?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
    onCancel, onVerify, onComplete, onAccept, onReject, 
    isVerifying, isCompleting, isCompleted, isInProgress, isCancelled, isWaitingProvider 
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 md:left-[280px] p-5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 z-[110] pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="max-w-2xl mx-auto flex gap-3 pointer-events-auto">
                <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-2 cursor-pointer relative z-20 pointer-events-auto"
                    onClick={onCancel}
                    disabled={isCompleting || isVerifying}
                >
                    Kembali
                </Button>
                
                {isWaitingProvider ? (
                    <div className="flex gap-2 flex-[2] z-20">
                        <Button 
                            variant="danger"
                            onClick={onReject}
                            isLoading={isCompleting}
                            disabled={isCompleting}
                            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-0 transition-all cursor-pointer pointer-events-auto"
                        >
                            Tolak
                        </Button>
                        <Button 
                            variant="primary"
                            onClick={onAccept}
                            isLoading={isCompleting}
                            disabled={isCompleting}
                            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-0 transition-all cursor-pointer pointer-events-auto"
                        >
                            Setujui
                        </Button>
                    </div>
                ) : isCancelled ? (
                    <div className="flex-[2] h-14 flex items-center justify-center font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 pointer-events-auto">
                        <AlertTriangle className="w-5 h-5 mr-2" /> Dibatalkan
                    </div>
                ) : isInProgress ? (
                    <div className="flex-[2] h-14 flex items-center justify-center font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 pointer-events-auto">
                        <Truck className="w-5 h-5 mr-2" /> Sedang Diantar
                    </div>
                ) : isCompleted ? (
                    <div className="flex-[2] h-14 flex items-center justify-center font-black uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 pointer-events-auto">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Pesanan Selesai
                    </div>
                ) : (
                    <Button 
                        onClick={onVerify}
                        isLoading={isVerifying}
                        className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-500/20 border-0 cursor-pointer relative z-20 pointer-events-auto"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Verifikasi & Serahkan
                    </Button>
                )}
            </div>
        </div>
    );
};
