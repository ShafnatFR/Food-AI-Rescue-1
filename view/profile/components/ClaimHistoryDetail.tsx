import React, { useState } from 'react';
import { ArrowLeft, MapPin, Package, Truck, Info, Navigation, AlertTriangle, Star, CheckCircle2, MessageCircle, Clock, ShieldCheck, ShieldAlert, Leaf, Check, Search, ExternalLink, CalendarDays, Store, LeafyGreen, QrCode, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { ClaimHistoryItem } from '../../../types';
import { optimizeUnsplashUrl } from '../../../utils/imageOptimizer';
import { MediaLightbox } from '../../common/MediaLightbox';
import { toast } from '../../common/ToastContext';

interface ClaimHistoryDetailProps {
    item: ClaimHistoryItem;
    onBack: () => void;
    onComplete?: () => void;
    onReport?: () => void;
    onReview?: () => void;
}

export const ClaimHistoryDetail: React.FC<ClaimHistoryDetailProps> = ({ item, onBack, onComplete, onReport, onReview }) => {
    
    // Map Logic
    const locationAddress = item.location?.address || "Lokasi tidak tersedia";
    const mapQuery = (locationAddress && locationAddress !== "Lokasi tidak tersedia")
        ? encodeURIComponent(locationAddress)
        : `${item.location?.lat || -6.914744},${item.location?.lng || 107.609810}`;

    const openInMaps = () => {
        let destination = "";
        if (locationAddress && locationAddress !== "Lokasi tidak tersedia") {
            destination = encodeURIComponent(locationAddress);
        } else if (item.location?.lat && item.location?.lng) {
            destination = `${item.location.lat},${item.location.lng}`;
        } else {
            return toast.error("Lokasi tidak valid.");
        }
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank');
    };

    const isActionable = ['active', 'pending', 'in_progress', 'waiting_provider', 'claimed'].includes(item.status?.toLowerCase() || '');
    const isCompleted = item.status === 'completed';

    const [previewMediaIndex, setPreviewMediaIndex] = useState<number | null>(null);
    const [previewMediaArray, setPreviewMediaArray] = useState<string[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);
    
    // Mocking formatting date
    const formatDate = (isoString: string) => {
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch(e) {
            return isoString;
        }
    };
    const formatTime = (isoString: string) => {
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch(e) {
            return "12:00";
        }
    };

    // Calculate Impact
    const co2Saved = item.socialImpact?.co2Saved || 0;
    const points = item.socialImpact?.totalPoints || 0;

    return (
        <div className="bg-[#FDFBF7] dark:bg-stone-950 min-h-screen animate-in fade-in pb-20">


            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>

                {/* Hero Section */}
                <div className="relative w-full h-[280px] lg:h-[320px] rounded-3xl overflow-hidden mb-6 shadow-sm">
                    <img src={optimizeUnsplashUrl(item.imageUrl, 1080)} alt={item.foodName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Floating Info Card on Hero */}
                    <div className="absolute bottom-6 left-6 right-6 lg:left-8 lg:bottom-8 z-10 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                item.status === 'completed' ? 'bg-green-500 text-white' : 
                                item.status === 'active' ? 'bg-orange-500 text-white' : 
                                'bg-red-500 text-white'
                            }`}>
                                {item.status === 'completed' ? 'SELESAI' : item.status === 'active' ? 'AKTIF' : item.status.toUpperCase()}
                            </span>
                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-medium tracking-wide">
                                ID Klaim: #{item.uniqueCode || item.id.substring(0,8)}
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md mb-2">{item.foodName}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-stone-200 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-stone-300" /> Diambil pada {formatDate(item.date)}</span>
                            <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-stone-300" /> {String(item.claimedQuantity).includes('Porsi') ? item.claimedQuantity : `${item.claimedQuantity || 1} Porsi`}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Detail Pengambilan */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800">
                            <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 mb-5 flex items-center gap-2">
                                <Info className="w-5 h-5 text-orange-500" /> Detail Pengambilan
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Kuantitas</p>
                                    <p className="text-lg font-bold text-stone-800 dark:text-stone-200">{String(item.claimedQuantity).includes('Porsi') ? item.claimedQuantity : `${item.claimedQuantity || 1} Porsi`}</p>
                                    <p className="text-xs text-stone-500 mt-1">Cukup untuk {parseInt(String(item.claimedQuantity)) || 1} orang</p>
                                </div>
                                <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Metode Distribusi</p>
                                    <div className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-200">
                                        <Truck className="w-4 h-4 text-green-600" /> {item.deliveryMethod?.toLowerCase() === 'pickup' ? 'Mandiri' : 'Relawan'}
                                    </div>
                                    <p className="text-xs text-stone-500 mt-1">
                                        {item.deliveryMethod?.toLowerCase() === 'pickup' ? 'Ambil sendiri di lokasi' : `Dikirim oleh: ${item.courierName || 'Relawan FAR'}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lokasi Pengambilan */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800">
                            <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 mb-5 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" /> Lokasi Pengambilan
                            </h3>
                            <div className="flex items-start gap-4 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                    <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-lg">{item.providerName}</h4>
                                    <p className="text-sm text-stone-500 leading-relaxed mt-1">{locationAddress}</p>
                                </div>
                            </div>
                            
                            {item.deliveryMethod?.toLowerCase() === 'pickup' && (
                                <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 relative h-48 sm:h-64 shadow-sm group">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        scrolling="no" 
                                        marginHeight={0} 
                                        marginWidth={0} 
                                        src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                                        className="filter grayscale group-hover:grayscale-0 transition-all duration-700"
                                    ></iframe>
                                    <button onClick={openInMaps} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-stone-900 text-stone-900 dark:text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform border border-stone-100 dark:border-stone-800">
                                        <Navigation className="w-4 h-4 text-orange-500" /> Buka di Google Maps
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {isCompleted && !item.rating && onReview && (
                                <button onClick={onReview} className="flex-1 h-14 bg-[#a56322] hover:bg-[#8b531c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#a56322]/20">
                                    <Star className="w-5 h-5" /> Beri Ulasan
                                </button>
                            )}
                            {isCompleted && !item.isReported && onReport && (
                                <button onClick={onReport} className="sm:w-32 h-14 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                                    <AlertTriangle className="w-5 h-5" /> Lapor
                                </button>
                            )}
                            {item.status?.toLowerCase() === 'pending_approval' && (
                                <div className="flex-1 h-14 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-2xl font-bold flex items-center justify-center gap-2 px-4 text-center text-sm shadow-inner border border-orange-200 dark:border-orange-800">
                                    <Clock className="w-5 h-5" /> Sedang menunggu donatur menyiapkan makanan
                                </div>
                            )}
                            {isActionable && item.status?.toLowerCase() !== 'pending_approval' && (
                                <button onClick={() => setShowQRModal(true)} className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-600/20">
                                    <QrCode className="w-5 h-5" /> Lihat Kode QR
                                </button>
                            )}
                        </div>

                        {/* Hasil Ulasan */}
                        {item.rating && (
                            <div className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 rounded-[2rem] p-8 shadow-sm border border-stone-200/60 dark:border-stone-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <Star className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3 relative z-10">
                                    <span className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500 shadow-sm">
                                        <Star className="w-5 h-5 fill-current" />
                                    </span>
                                    Ulasan Anda
                                </h3>
                                <div className="bg-white dark:bg-stone-900/50 p-6 rounded-[1.5rem] shadow-sm border border-stone-100 dark:border-stone-800 relative z-10">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-6 h-6 ${i < item.rating! ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-stone-200 dark:text-stone-700'}`} />
                                        ))}
                                    </div>
                                    {item.review && <p className="text-stone-700 dark:text-stone-300 mb-4 text-base italic leading-relaxed">"{item.review}"</p>}
                                    {item.reviewMedia && item.reviewMedia.length > 0 && (
                                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                            {item.reviewMedia.map((media, idx) => (
                                                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-stone-100 dark:border-stone-800 cursor-pointer group shadow-sm">
                                                    <img src={media} alt="Review Media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onClick={() => { setPreviewMediaArray(item.reviewMedia!); setPreviewMediaIndex(idx); }} />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Hasil Laporan */}
                        {item.isReported && (
                            <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-stone-950 rounded-[2rem] p-8 shadow-sm border border-red-200/60 dark:border-red-900/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <AlertTriangle className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-black text-red-800 dark:text-red-100 mb-6 flex items-center gap-3 relative z-10">
                                    <span className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-800">
                                        <AlertTriangle className="w-5 h-5" />
                                    </span>
                                    Laporan Anda
                                </h3>
                                <div className="bg-white/80 dark:bg-stone-900/80 p-6 rounded-[1.5rem] shadow-sm border border-red-100 dark:border-red-900/30 relative z-10 backdrop-blur-sm">
                                    <h4 className="text-lg font-black text-red-900 dark:text-red-400 mb-2">{item.reportReason || 'Laporan Masalah'}</h4>
                                    {item.reportDescription && <p className="text-stone-700 dark:text-stone-300 mb-4 leading-relaxed">{item.reportDescription}</p>}
                                    {item.reportEvidence && item.reportEvidence.length > 0 && (
                                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                            {item.reportEvidence.map((media, idx) => (
                                                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-red-100 dark:border-red-900/50 cursor-pointer group shadow-sm">
                                                    <img src={media} alt="Report Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onClick={() => { setPreviewMediaArray(item.reportEvidence!); setPreviewMediaIndex(idx); }} />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {(() => {
                                        let label = 'Sedang Dalam Peninjauan Admin';
                                        let badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800';
                                        let Icon = Clock;
                                        
                                        const rStatus = item.reportStatus?.toLowerCase();

                                        if (rStatus === 'resolved') {
                                            label = 'Telah Diselesaikan';
                                            badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800';
                                            Icon = CheckCircle2;
                                        } else if (rStatus === 'rejected' || rStatus === 'dismissed') {
                                            label = 'Laporan Ditolak';
                                            badgeColor = 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700';
                                            Icon = X;
                                        }

                                        return (
                                            <div className="mt-6 pt-6 border-t border-red-100 dark:border-red-900/30 flex items-center">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border shadow-sm ${badgeColor}`}>
                                                    <Icon className="w-4 h-4" /> {label}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column - Timeline & Insights */}
                    <div className="space-y-6">
                        
                        {/* Impact Insights */}
                        <div className="bg-[#2A2D2C] rounded-3xl p-6 shadow-lg text-white">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-6">
                                <Leaf className="w-4 h-4" /> Impact Insights
                            </h3>
                            
                            <div className="mb-6">
                                <p className="text-xs text-stone-400 mb-1">Emisi CO2 Berhasil Dikurangi</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black">{co2Saved} kg</span>
                                    <LeafyGreen className="w-6 h-6 text-emerald-500 mb-1" />
                                </div>
                            </div>
                            
                            <div className="h-px w-full bg-stone-700/50 mb-6"></div>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-stone-400 mb-1">Skor Kontribusi</p>
                                    <p className="text-xl font-bold">+{points} Poin</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-400">
                                    88%
                                </div>
                            </div>
                        </div>

                        {/* Riwayat Status */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800">
                            <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 mb-6">Riwayat Status</h3>
                            
                            <div className="relative pl-6 space-y-6">
                                {/* Vertical line */}
                                <div className="absolute left-2.5 top-2 bottom-4 w-px bg-stone-200 dark:bg-stone-800"></div>
                                
                                {/* Timeline Items */}
                                {item.status?.toLowerCase() === 'cancelled' && (
                                    <div className="relative">
                                        <div className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 bg-red-500 text-white">
                                            <AlertTriangle className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Pesanan Dibatalkan</h4>
                                            <p className="text-xs text-stone-500 my-0.5">{formatDate(item.date)}, {formatTime(item.date)}</p>
                                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">Pesanan ditolak oleh donatur atau dibatalkan.</p>
                                        </div>
                                    </div>
                                )}

                                {item.status?.toLowerCase() !== 'cancelled' && (
                                    <>
                                        <div className="relative">
                                            <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <div className={`transition-opacity duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                                <h4 className={`text-sm font-bold ${isCompleted ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>Klaim Selesai</h4>
                                                {isCompleted && <p className="text-xs text-stone-500 my-0.5">{formatDate(item.date)}, {formatTime(new Date(new Date(item.date).getTime() + 7200000).toISOString())}</p>}
                                                <p className="text-xs text-stone-600 dark:text-stone-500 mt-1 leading-snug">Makanan telah diterima oleh penerima manfaat.</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${['in_progress', 'completed'].includes(item.status?.toLowerCase() || '') ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'}`}>
                                                <Truck className="w-3 h-3" />
                                            </div>
                                            <div className={`transition-opacity duration-500 ${['in_progress', 'completed'].includes(item.status?.toLowerCase() || '') ? 'opacity-100' : 'opacity-40'}`}>
                                                <h4 className={`text-sm font-bold ${['in_progress', 'completed'].includes(item.status?.toLowerCase() || '') ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>Dalam Pengantaran</h4>
                                                {['in_progress', 'completed'].includes(item.status?.toLowerCase() || '') && <p className="text-xs text-stone-500 my-0.5">{formatDate(item.date)}, {formatTime(new Date(new Date(item.date).getTime() + 3600000).toISOString())}</p>}
                                                <p className="text-xs text-stone-600 dark:text-stone-500 mt-1 leading-snug">{item.deliveryMethod?.toLowerCase() === 'pickup' ? 'Penerima sedang menuju lokasi.' : 'Relawan sedang menuju lokasi drop-off.'}</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${['waiting_provider', 'claimed', 'active', 'in_progress', 'completed'].includes(item.status?.toLowerCase() || '') ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'}`}>
                                                <Store className="w-3 h-3" />
                                            </div>
                                            <div className={`transition-opacity duration-500 ${['waiting_provider', 'claimed', 'active', 'in_progress', 'completed'].includes(item.status?.toLowerCase() || '') ? 'opacity-100' : 'opacity-40'}`}>
                                                <h4 className={`text-sm font-bold ${['waiting_provider', 'claimed', 'active', 'in_progress', 'completed'].includes(item.status?.toLowerCase() || '') ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>Pesanan Disetujui Donatur</h4>
                                                {['waiting_provider', 'claimed', 'active', 'in_progress', 'completed'].includes(item.status?.toLowerCase() || '') && <p className="text-xs text-stone-500 my-0.5">{formatDate(item.date)}, {formatTime(new Date(new Date(item.date).getTime() + 300000).toISOString())}</p>}
                                                <p className="text-xs text-stone-600 dark:text-stone-500 mt-1 leading-snug">Donatur telah mengonfirmasi dan menyiapkan makanan.</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 bg-orange-500 text-white shadow-md shadow-orange-500/20">
                                                <Package className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">Pesanan Dibuat</h4>
                                                <p className="text-xs text-stone-500 my-0.5">{formatDate(item.date)}, {formatTime(item.date)}</p>
                                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">Sistem telah mencatat pesanan Anda.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="bg-[#fcfafa] dark:bg-stone-900/50 rounded-3xl p-5 border border-stone-200/60 dark:border-stone-800">
                            <div className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-stone-800/50">
                                <span className="text-xs text-stone-500">Kategori</span>
                                <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Makanan Siap Saji</span>
                            </div>
                            <div className="flex items-center justify-between py-2 pt-3">
                                <span className="text-xs text-stone-500">Penyumbang</span>
                                <span className="text-sm font-bold text-stone-800 dark:text-stone-200 text-right">{item.providerName}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                        <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2">Kode Penukaran</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">Tunjukkan kode ini kepada penyedia atau relawan.</p>
                        
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 inline-block mb-6">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(item.uniqueCode || item.id)}`} alt="QR Code" className="w-48 h-48" />
                        </div>
                        
                        <div className="bg-stone-100 dark:bg-stone-800 px-6 py-3 rounded-xl border border-stone-200 dark:border-stone-700 w-full mb-6">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">ID KLAIM</p>
                            <p className="text-2xl font-mono font-bold tracking-widest text-stone-800 dark:text-stone-200">{item.uniqueCode || item.id.substring(0,8)}</p>
                        </div>
                        
                        <Button className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 text-white h-12" onClick={() => setShowQRModal(false)}>Tutup</Button>
                    </div>
                </div>
            )}

            {/* Media Lightbox */}
            {previewMediaIndex !== null && previewMediaArray.length > 0 && (
                <MediaLightbox 
                    mediaUrls={previewMediaArray}
                    initialIndex={previewMediaIndex}
                    onClose={() => setPreviewMediaIndex(null)}
                />
            )}
        </div>
    );
};
