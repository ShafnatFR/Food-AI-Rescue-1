import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, ArrowLeft, Sparkles, Utensils, Info, CheckCircle2, ChevronRight, Loader2, Image as ImageIcon, Zap, History, LayoutGrid, Calendar, ChefHat } from 'lucide-react';
import { Button } from '../components/Button';
import { db } from '../../services/db';
import { kitchenScanner } from '../../services/kitchenScanner';
import { UserData } from '../../types';
import { toast } from '../common/ToastContext';

interface KitchenScannerProps {
    currentUser: UserData | null;
    onBack: () => void;
    initialTab?: 'scan' | 'history';
}

export const KitchenScanner: React.FC<KitchenScannerProps> = ({ currentUser, onBack, initialTab = 'scan' }) => {
    const [activeTab, setActiveTab] = useState<'scan' | 'history'>(initialTab);
    
    // Scanner State
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    
    // History State
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
    const [allowGallery, setAllowGallery] = useState(true);

    useEffect(() => {
        db.getSettings().then(s => {
            if (s && s.allow_gallery_upload !== undefined) {
                setAllowGallery(s.allow_gallery_upload);
            }
        }).catch(console.error);
    }, []);

    const [scanError, setScanError] = useState<{ message: string; isOverload: boolean } | null>(null);
    const [retryCountdown, setRetryCountdown] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Fetch for History
    useEffect(() => {
        if (activeTab === 'history' && currentUser?.id) {
            fetchHistory();
        }
    }, [activeTab, currentUser?.id]);

    const fetchHistory = async () => {
        if (!currentUser?.id) return;
        setIsLoadingHistory(true);
        try {
            const data = await db.getCorporateAIHistory(Number(currentUser.id));
            setHistoryList(data.filter(h => h.type === 'KITCHEN'));
        } catch (e) {
            console.error("Failed to fetch history:", e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const startCamera = async () => {
        setIsCameraActive(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            toast.error("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                setPhoto(dataUrl);
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
                stopCamera();
            };
            reader.readAsDataURL(file);
        }
    };

    // Auto-retry dengan exponential backoff saat AI overload
    const startRetryCountdown = (seconds: number, onComplete: () => void) => {
        setRetryCountdown(seconds);
        const interval = setInterval(() => {
            setRetryCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setRetryCountdown(0);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const scanIngredients = async (attempt = 1) => {
        if (!photo || !currentUser) return;

        setScanError(null);
        setIsScanning(true);

        try {
            const data = await kitchenScanner.scan(photo, currentUser.role, currentUser.id);
            setResult(data);
            setIsScanning(false);
        } catch (err: any) {
            console.error('[KitchenScanner] Error:', err);
            setIsScanning(false);

            const msg   = (err.message || '').toLowerCase();
            const code  = err.aiErrorCode || '';
            const isOverload =
                code === 'AI_OVERLOAD' ||
                msg.includes('503') ||
                msg.includes('overload') ||
                msg.includes('high demand') ||
                msg.includes('service unavailable') ||
                msg.includes('quota') ||
                msg.includes('429') ||
                msg.includes('too many');

            const MAX_AUTO_RETRY = 3;
            const delaySec = Math.pow(2, attempt) * 5; // 10s, 20s, 40s

            if (isOverload && attempt <= MAX_AUTO_RETRY) {
                setScanError({
                    message: `Server AI sedang sibuk. Mencoba ulang otomatis dalam ${delaySec} detik... (percobaan ${attempt}/${MAX_AUTO_RETRY})`,
                    isOverload: true
                });
                startRetryCountdown(delaySec, () => {
                    setScanError(null);
                    scanIngredients(attempt + 1);
                });
            } else if (isOverload) {
                setScanError({
                    message: 'Server AI sedang sangat sibuk. Silakan coba lagi dalam beberapa menit.',
                    isOverload: true
                });
            } else {
                setScanError({
                    message: err.message || 'Gagal menganalisis bahan. Pastikan sudah memasukkan API Key di profil.',
                    isOverload: false
                });
            }
        }
    };

    const resetScanner = () => {
        setPhoto(null);
        setResult(null);
        setScanError(null);
        setRetryCountdown(0);
        startCamera();
    };

    const renderHistoryDetail = (item: any) => {
        const recipeData = JSON.parse(item.content);
        return (
            <div className="absolute inset-0 z-[110] bg-white dark:bg-stone-950 flex flex-col animate-in slide-in-from-right duration-300">
                <header className="p-6 flex items-center justify-between border-b border-stone-100 dark:border-stone-900 sticky top-0 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedHistoryItem(null)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-sm font-black text-stone-900 dark:text-white uppercase italic leading-none">Detail Resep</h2>
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">Disimpan {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-4xl font-black text-stone-900 dark:text-white tracking-tight">{item.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {recipeData.ingredients?.map((ing: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-orange-100 dark:border-orange-900/30">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 bg-stone-50 dark:bg-stone-900/50 p-8 md:p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Blueprint Langkah Memasak</span>
                            </div>
                            <p className="text-stone-800 dark:text-stone-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                {recipeData.recipe}
                            </p>
                        </div>

                        {recipeData.tips && (
                             <div className="p-6 md:p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20 flex gap-4 md:gap-6 shadow-sm">
                                <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Tips Nol Limbah</h5>
                                    <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                        {recipeData.tips}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-stone-950 flex flex-col lg:max-w-6xl lg:mx-auto lg:relative lg:h-[95vh] lg:rounded-[3rem] lg:shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <header className="p-6 flex flex-col bg-white/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100 dark:border-stone-900 gap-6">
                <div className="flex items-center justify-between w-full">
                    <button 
                        onClick={() => { stopCamera(); onBack(); }}
                        className="p-3 bg-stone-100 dark:bg-stone-900 rounded-2xl text-stone-600 dark:text-stone-300 active:scale-90 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center flex-1">
                        <h2 className="text-xl font-black text-stone-900 dark:text-white leading-none tracking-tight uppercase italic">Kitchen AI</h2>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1 italic">Intelligent Cooking Assistant</p>
                    </div>
                    <div className="w-11"></div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-stone-100 dark:bg-stone-900 p-1.5 rounded-[1.5rem] border border-stone-200 dark:border-stone-800 max-w-sm mx-auto w-full relative">
                    <button 
                        onClick={() => { stopCamera(); setActiveTab('scan'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'scan' ? 'bg-white dark:bg-stone-800 text-orange-600 shadow-sm' : 'text-stone-400 hover:text-stone-600 text-stone-500'}`}
                    >
                        <Camera className="w-3.5 h-3.5" /> Scan Bahan
                    </button>
                    <button 
                        onClick={() => { stopCamera(); setActiveTab('history'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'history' ? 'bg-white dark:bg-stone-800 text-orange-600 shadow-sm' : 'text-stone-400 hover:text-stone-600 text-stone-500'}`}
                    >
                        <History className="w-3.5 h-3.5" /> Riwayat Resep
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar pb-32">
                {activeTab === 'scan' ? (
                    <div className={`transition-all duration-700 ${result ? "lg:grid lg:grid-cols-12 lg:gap-10" : "max-w-2xl mx-auto w-full space-y-6"}`}>
                        {/* Panel Kiri: Kamera & Foto Preview */}
                        <div className={result ? "lg:col-span-5 space-y-6" : "space-y-6"}>
                            {!photo ? (
                                <div className="space-y-6">
                                    {!isCameraActive ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            <button 
                                                onClick={startCamera}
                                                className="h-64 bg-stone-100 dark:bg-stone-900 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center gap-4 group hover:border-orange-500 transition-all"
                                            >
                                                <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-3xl shadow-sm flex items-center justify-center text-stone-400 group-hover:text-orange-500 group-hover:scale-110 transition-all">
                                                    <Camera className="w-8 h-8" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-900 dark:group-hover:text-white">Pindai Bahan Baku</span>
                                            </button>
                                            
                                            {allowGallery && (
                                                <>
                                                    <button 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2rem] text-stone-600 dark:text-stone-400 hover:bg-stone-50 transition-all font-black uppercase text-[10px] tracking-widest"
                                                    >
                                                        <ImageIcon className="w-5 h-5" /> Unggah Dari Galeri
                                                    </button>
                                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-black aspect-[3/4] md:aspect-[4/3] lg:aspect-[3/4]">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 border-2 border-white/20 rounded-[3rem] pointer-events-none"></div>
                                            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
                                                <button 
                                                    onClick={stopCamera}
                                                    className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                                                >
                                                    <RefreshCw className="w-6 h-6" />
                                                </button>
                                                <button 
                                                    onClick={takePhoto}
                                                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-2xl active:scale-90 transition-all"
                                                >
                                                    <div className="w-16 h-16 border-4 border-stone-900/5 rounded-full"></div>
                                                </button>
                                                <div className="w-14"></div>
                                            </div>
                                        </div>
                                    )}

                                    {!result && !photo && (
                                        <div className="bg-stone-50 dark:bg-stone-900/50 rounded-3xl p-6 md:p-8 space-y-4 border border-stone-100 dark:border-stone-800 shadow-sm">
                                            <h4 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-tight">Edukasi Kitchen AI</h4>
                                            <div className="space-y-4">
                                                {[
                                                    "Ambil foto semua bahan masakan yang tersisa di dapur.",
                                                    "Teknologi Visi Komputer kami akan mengenali bahan-bahan tersebut.",
                                                    "AI akan meracik resep lezat khusus untuk Anda!"
                                                ].map((step, i) => (
                                                    <div key={i} className="flex gap-4 items-start">
                                                        <div className="w-6 h-6 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-black text-orange-600">{i+1}</span>
                                                        </div>
                                                        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium pt-0.5">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="rounded-[3rem] overflow-hidden shadow-xl bg-stone-100 dark:bg-stone-800 aspect-[3/4] md:aspect-[4/3] lg:aspect-square relative max-w-2xl mx-auto border border-stone-200 dark:border-stone-800">
                                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />

                                        {/* Overlay: Scanning */}
                                        {isScanning && (
                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                                                <div className="relative">
                                                    <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                                                    <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                                                </div>
                                                <p className="text-sm font-black uppercase tracking-widest animate-pulse">Meracik Resep Khas Kitchen AI...</p>
                                            </div>
                                        )}

                                        {/* Overlay: Error / Retry */}
                                        {!isScanning && scanError && (
                                            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center ${scanError.isOverload ? 'bg-amber-900/80' : 'bg-red-900/80'} backdrop-blur-sm`}>
                                                {scanError.isOverload ? (
                                                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 text-amber-300 animate-spin" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                                                        <Sparkles className="w-8 h-8 text-red-300" />
                                                    </div>
                                                )}

                                                {retryCountdown > 0 ? (
                                                    <>
                                                        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                                                            <span className="text-2xl font-black text-white">{retryCountdown}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-amber-200 leading-relaxed max-w-[220px]">{scanError.message}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-black text-white uppercase tracking-wide">
                                                            {scanError.isOverload ? '🔄 AI Sedang Sibuk' : '❌ Gagal Menganalisis'}
                                                        </p>
                                                        <p className="text-xs text-white/80 leading-relaxed max-w-[220px]">{scanError.message}</p>
                                                        <button
                                                            onClick={() => scanIngredients(1)}
                                                            className="mt-2 px-5 py-2.5 bg-white text-stone-900 rounded-full text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                                        >
                                                            Coba Lagi
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!isScanning && !result && (
                                        <div className="flex gap-4 max-w-2xl mx-auto">
                                            <button 
                                                onClick={() => { setScanError(null); setRetryCountdown(0); setPhoto(null); }}
                                                className="flex-1 p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl text-stone-600 dark:text-stone-400 font-bold text-sm hover:bg-stone-50 transition-colors"
                                            >
                                                Ulangi Foto
                                            </button>
                                            <button 
                                                onClick={() => scanIngredients(1)}
                                                disabled={retryCountdown > 0}
                                                className={`flex-[2] p-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                                                    retryCountdown > 0
                                                        ? 'bg-amber-500 text-white cursor-not-allowed opacity-90'
                                                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20'
                                                }`}
                                            >
                                                {retryCountdown > 0 ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Mencoba ulang dalam {retryCountdown}s
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-5 h-5 fill-white" /> Analisis Bahan
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {result && (
                                        <Button 
                                            onClick={resetScanner} 
                                            variant="outline"
                                            className="w-full bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-stone-200 dark:border-stone-800"
                                        >
                                            Pindai Bahan Lainnya
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Panel Kanan Result */}
                        {result && (
                            <div className="lg:col-span-7 mt-8 lg:mt-0 space-y-6 animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-700">
                                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-6 md:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8 h-full">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] md:text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                            <Utensils className="w-4 h-4" /> Kebutuhan Bahan Dapur
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.ingredients?.map((ing: string, i: number) => (
                                                <span key={i} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-700 dark:text-stone-200 text-xs font-bold border border-stone-200/50 dark:border-stone-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                                                    {ing}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-stone-100 dark:border-stone-800" />

                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-3 items-center justify-between">
                                            <h4 className="text-[10px] md:text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Rancangan Menu Eksklusif
                                            </h4>
                                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-900/50">Cepat & Zero Waste</span>
                                        </div>
                                        <div className="p-6 md:p-8 bg-stone-50 dark:bg-stone-950/50 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-inner">
                                            <p className="text-stone-800 dark:text-stone-200 text-sm md:text-base font-medium leading-relaxed whitespace-pre-line">
                                                {result.recipe}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 flex gap-4 md:gap-5 shadow-sm">
                                        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="text-[10px] md:text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Tips Pemanfaatan Sisa</h5>
                                            <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                                {result.tips || "Bekukan sayuran sisa untuk digunakan sebagai kaldu di kemudian hari."}
                                            </p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={async () => {
                                            if(!currentUser) return;
                                            try {
                                                await db.saveCorporateAIResult({
                                                    donorId: Number(currentUser.id),
                                                    foodId: 0,
                                                    type: 'KITCHEN',
                                                    title: `Kitchen AI Recipe: ${result.ingredients?.slice(0, 2).join(', ')}...`,
                                                    content: JSON.stringify(result)
                                                });
                                                toast.info("Resep resmi disimpan dalam riwayat!");
                                                fetchHistory(); // Refresh history tab
                                            } catch (e: any) {
                                                alert("Gagal menyimpan resep: " + e.message);
                                            }
                                        }}
                                        className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2 inline" /> Simpan Ke Koleksi Saya
                                    </Button>

                                    {result.externalRecipes && result.externalRecipes.length > 0 && (
                                        <div className="pt-6 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700"></div>
                                                <span className="text-[10px] md:text-xs font-black text-stone-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Inspirasi Komunitas</span>
                                                <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700"></div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                {result.externalRecipes.map((ext: any, i: number) => (
                                                    <a 
                                                        key={i} href={ext.link} target="_blank" rel="noopener noreferrer"
                                                        className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-between group hover:border-orange-500 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                                <Utensils className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-[11px] md:text-sm font-black text-stone-900 dark:text-white line-clamp-1">{ext.title}</h5>
                                                                <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{ext.source}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 transition-colors" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* HISTORY TAB */
                    <div className="animate-in fade-in duration-700 space-y-6">
                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-6">
                                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] animate-pulse">Menyelaraskan Riwayat AI...</p>
                            </div>
                        ) : historyList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-[3rem] bg-stone-50/30">
                                <div className="w-24 h-24 bg-white dark:bg-stone-900 rounded-[2.5rem] flex items-center justify-center text-stone-200 shadow-xl border border-stone-100 dark:border-stone-800">
                                    <ChefHat className="w-12 h-12" />
                                </div>
                                <div className="space-y-2 px-10">
                                    <h3 className="text-lg font-black text-stone-900 dark:text-white uppercase italic tracking-tight leading-none">Belum Ada Riwayat</h3>
                                    <p className="text-[11px] text-stone-500 font-medium px-4 leading-relaxed">Mulai manfaatkan Kitchen AI untuk mengolah bahan makanan di rumah dan simpan mahakarya Anda di sini.</p>
                                </div>
                                <Button 
                                    onClick={() => setActiveTab('scan')}
                                    className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                                >
                                    Coba Sekarang
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
                                {historyList.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => setSelectedHistoryItem(item)}
                                        className="p-6 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] text-left hover:border-orange-500 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <div className="flex bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl mb-4 items-center justify-between">
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                                <Utensils className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800">
                                                <Calendar className="w-2.5 h-2.5 text-stone-400" />
                                                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-sm md:text-base font-black text-stone-900 dark:text-white line-clamp-2 uppercase italic tracking-tight leading-tight mb-2 group-hover:text-orange-600 transition-colors uppercase">{item.title}</h4>
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-50 dark:border-stone-800">
                                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Detail Resep</span>
                                            <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Overlay Detail For History (Full Screen) */}
            {selectedHistoryItem && renderHistoryDetail(selectedHistoryItem)}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
