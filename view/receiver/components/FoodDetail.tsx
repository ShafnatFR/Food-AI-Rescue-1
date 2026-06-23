import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, MapPin, Navigation, Minus, Plus, CalendarDays, Heart, MessageCircle, Truck, Package, AlertTriangle, AlertCircle, ShoppingBag, Store, Verified } from 'lucide-react';
import { Button } from '../../components/Button';
import { FoodItem, ClaimHistoryItem, UserData } from '../../../types';
import { AIVerificationCard } from './AIVerificationCard';
import { SocialImpactAccordion } from '../../components/SocialImpactAccordion';
import { db } from '../../../services/db';
import { formatDateTime, isFoodExpired } from '../../../utils/transformers';
import { optimizeUnsplashUrl } from '../../../utils/imageOptimizer';
import { toast } from '../../common/ToastContext';

interface FoodDetailProps {
  item: FoodItem;
  onBack: () => void;
  onClaim: (quantity: string, method: 'pickup' | 'delivery') => Promise<void> | void; 
  isSaved: boolean;
  onToggleSave: () => void;
  claimHistory?: ClaimHistoryItem[];
  currentUser?: UserData | null;
  isReadOnly?: boolean;
  disableExpiryLogic?: boolean;
}

export const FoodDetail: React.FC<FoodDetailProps> = ({ item, onBack, onClaim, isSaved, onToggleSave, claimHistory = [], currentUser, isReadOnly = false, disableExpiryLogic = false }) => {

  // LOGIKA ADAPTIF PORSI
  const stockAvailable = item.currentQuantity;
  const standardMin = item.minQuantity || 1;
  const maxAllowedByDonor = item.maxQuantity || item.initialQuantity;
  
  const minAllowed = stockAvailable < standardMin ? stockAvailable : standardMin;
  const actualMax = Math.min(stockAvailable, maxAllowedByDonor);

  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [claimQuantity, setClaimQuantity] = useState(minAllowed); 
  const [selectedMethod, setSelectedMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [hasAddress, setHasAddress] = useState<boolean | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  const expired = !disableExpiryLogic && (item.status === 'expired' || isFoodExpired(item.distributionEnd, item.expiryTime));

  const isThisItemActive = claimHistory.some(c => 
      c.status?.toUpperCase() === 'ACTIVE' && 
      c.foodName === item.name && 
      c.providerName === item.providerName
  );
  
  const isOutOfStock = stockAvailable <= 0;

  useEffect(() => {
      const checkAddress = async () => {
          setIsLoadingAddress(true);
          try {
              if (currentUser?.id) {
                  const addresses = await db.getAddresses(currentUser.id);
                  setHasAddress(addresses && addresses.length > 0);
              }
          } catch (e) {
              console.error("Failed to check address:", e);
          } finally {
              setIsLoadingAddress(false);
          }
      };
      checkAddress();
  }, [currentUser?.id]);

  useEffect(() => {
      setClaimQuantity(minAllowed);
      if (item.deliveryMethod === 'delivery' && stockAvailable >= 5) setSelectedMethod('delivery');
      else setSelectedMethod('pickup');
  }, [item, minAllowed, stockAvailable]);

   const handleClaimClick = () => {
    if (isThisItemActive || !hasAddress || isOutOfStock || isReadOnly || expired) return;
    setShowConfirmModal(true);
  };

  const confirmClaim = async () => {
    setShowConfirmModal(false);
    setIsClaiming(true);
    try {
        await onClaim(`${claimQuantity} Porsi`, selectedMethod);
    } catch (e) {
        console.error(e);
    } finally {
        setIsClaiming(false);
    }
  };

  const increment = () => {
    if (claimQuantity < actualMax) setClaimQuantity(prev => prev + 1);
  };

  const decrement = () => {
    if (claimQuantity > minAllowed) setClaimQuantity(prev => prev - 1);
  };

  const handleRoute = () => {
    let destination = "";
    if (item.location?.lat && item.location?.lng && item.location.lat !== -6.914744) {
        destination = `${item.location.lat},${item.location.lng}`;
    } else if (item.location?.address && item.location.address !== "Lokasi tidak tersedia") {
        destination = encodeURIComponent(item.location.address);
    } else {
        return toast.error("Lokasi makanan tidak valid.");
    }

    // Build URL: if we have user's location, use it as origin for turn-by-turn directions
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`, '_blank');
            },
            () => {
                // Fallback: open without origin, GMaps will ask user
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank');
            }
        );
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank');
    }
  };

  const handleChatToProvider = () => {
    const rawPhone = item.providerPhone;
    if (!rawPhone) return toast.info("Kontak tidak tersedia.");
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Halo, saya tertarik dengan donasi: " + item.name)}`, '_blank');
  };

  const locationAddress = item.location?.address || "Lokasi tidak tersedia";
  const mapQuery = (locationAddress && locationAddress !== "Lokasi tidak tersedia")
      ? encodeURIComponent(locationAddress)
      : `${item.location?.lat || -6.914744},${item.location?.lng || 107.609810}`;

  return (
    <div className="flex flex-col min-h-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 md:p-8">
      {/* Back Header is handled by parent, but we can add one if needed, or assume TopAppBar is outside. 
          The Figma shows TopAppBar outside. We will just render the grid content. */}
          
      <div className="max-w-7xl mx-auto w-full">
        <button onClick={onBack} className="md:hidden flex items-center gap-2 mb-4 text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: lg:col-span-7 */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* HERO IMAGE */}
            <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm bg-stone-200 dark:bg-stone-800">
                <img src={optimizeUnsplashUrl(item.imageUrl, 1080)} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-mono font-bold border border-white/20 backdrop-blur-md ${expired || isOutOfStock ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        {expired ? <AlertTriangle className="w-3.5 h-3.5" /> : isOutOfStock ? <AlertTriangle className="w-3.5 h-3.5" /> : <Verified className="w-3.5 h-3.5" />}
                        {expired ? "KEDALUWARSA" : isOutOfStock ? "STOK HABIS" : "LAYAK KONSUMSI"}
                    </span>
                    {/* Time Left Badge */}
                    {!expired && !isOutOfStock && (
                      <span className="bg-white/90 dark:bg-stone-900/90 backdrop-blur text-stone-800 dark:text-stone-200 font-mono px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-orange-600" />
                          {item.distributionEnd ? `Sampai ${formatDateTime(item.distributionEnd).split(',')[1]}` : 'Tersedia'}
                      </span>
                    )}
                </div>
            </div>

            {/* HEADER DETAILS CARD */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white mb-2 leading-tight">{item.name}</h1>
                    <div className="flex flex-wrap gap-3 items-center mt-4">
                        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg">
                            <Store className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">{item.providerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-3 py-1.5 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">Exp: {formatDateTime(item.distributionEnd || item.expiryTime)}</span>
                        </div>
                    </div>
                </div>
                <button 
                  onClick={onToggleSave} 
                  className={`shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isSaved ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20' : 'text-stone-400 border-stone-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:border-stone-700'}`}
                >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* ACTIVE/OUT OF STOCK ALERTS */}
            {isOutOfStock ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-200 dark:border-red-800/50 flex items-center gap-4 animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700 dark:text-red-400 text-sm uppercase tracking-wider">Maaf, Stok Habis</p>
                        <p className="text-xs text-red-600 dark:text-red-300 font-medium">Makanan ini sudah habis diklaim oleh pengguna lain.</p>
                    </div>
                </div>
            ) : isThisItemActive ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-200 dark:border-orange-800/50 flex items-center gap-4">
                    <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
                    <div>
                        <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">Pesanan Sedang Aktif</p>
                        <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">Selesaikan proses pengambilan terlebih dahulu.</p>
                    </div>
                </div>
            ) : null}

            {/* AI VERIFICATION CARD */}
            {item.aiVerification && (
                <div className="space-y-4">
                    <AIVerificationCard verification={item.aiVerification} />
                    {item.socialImpact && (
                        <div className="bg-[#2e3132] text-[#f0f1f2] rounded-2xl p-2 shadow-md border border-white/5 font-body-md animate-in fade-in slide-in-from-bottom-4">
                           <SocialImpactAccordion socialImpact={item.socialImpact} weightPerUnit={500} />
                        </div>
                    )}
                </div>
            )}

          </div>


          {/* RIGHT COLUMN: lg:col-span-5 */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SCHEDULE CARD */}
            <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl p-6 shadow-sm border border-orange-200/50 dark:border-orange-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="text-orange-600 w-5 h-5" />
                    <h3 className="font-bold text-stone-800 dark:text-orange-100">Jadwal Distribusi Surplus</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-orange-100 dark:border-stone-800 shadow-sm">
                        <p className="font-mono text-[10px] text-stone-500 uppercase mb-1 font-bold tracking-widest">Mulai Ambil</p>
                        <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                          {item.distributionStart ? formatDateTime(item.distributionStart).split(',')[1] : '18:30'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-orange-100 dark:border-stone-800 shadow-sm">
                        <p className="font-mono text-[10px] text-stone-500 uppercase mb-1 font-bold tracking-widest">Batas Akhir</p>
                        <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                          {item.distributionEnd ? formatDateTime(item.distributionEnd).split(',')[1] : '21:00'}
                        </p>
                    </div>
                </div>
            </div>

            {/* CLAIM ACTION CARD */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden sticky top-24">
                
                {/* Method Toggle */}
                {item.deliveryMethod === 'both' ? (
                  <div className="flex p-2 bg-stone-100 dark:bg-stone-950 m-4 rounded-xl">
                      <button onClick={() => setSelectedMethod('pickup')} className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${selectedMethod === 'pickup' ? 'bg-white dark:bg-stone-800 shadow-sm text-orange-600' : 'text-stone-500 hover:text-stone-700'}`}>
                          <Store className="w-4 h-4" /> AMBIL SENDIRI
                      </button>
                      <button onClick={stockAvailable < 5 ? () => setShowStockWarning(true) : () => setSelectedMethod('delivery')} className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${selectedMethod === 'delivery' ? 'bg-white dark:bg-stone-800 shadow-sm text-blue-600' : 'text-stone-500 hover:text-stone-700'} ${stockAvailable < 5 ? 'opacity-60' : ''}`}>
                          <Truck className="w-4 h-4" /> DIANTAR RELAWAN {stockAvailable < 5 && <span className="ml-1 text-[8px] bg-red-100 text-red-600 px-1 rounded-md">LIMITED</span>}
                      </button>
                  </div>
                ) : (
                  <div className="flex p-4 border-b border-stone-100 dark:border-stone-800 justify-center">
                    <span className="text-sm font-bold flex items-center gap-2 text-stone-600 dark:text-stone-300">
                      {item.deliveryMethod === 'pickup' ? <><Store className="w-4 h-4 text-orange-600" /> HANYA AMBIL SENDIRI</> : <><Truck className="w-4 h-4 text-blue-600" /> HANYA DIANTAR RELAWAN</>}
                    </span>
                  </div>
                )}

                <div className="p-6 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <p className="font-mono text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-2">Jumlah Ambil (Min: {minAllowed})</p>
                            <div className="flex items-center gap-3">
                                <button onClick={decrement} disabled={claimQuantity <= minAllowed || isThisItemActive || isOutOfStock} className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 disabled:opacity-30 transition-colors">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-xl w-8 text-center">{claimQuantity}</span>
                                <button onClick={increment} disabled={claimQuantity >= actualMax || isThisItemActive || isOutOfStock} className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 disabled:opacity-30 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Tersedia</p>
                            <p className="font-bold text-orange-600 dark:text-orange-400 text-lg"><span className="text-2xl">{actualMax}</span> Porsi</p>
                            <p className="text-[10px] text-stone-400 italic mt-0.5">Maks per user: {actualMax}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button onClick={handleChatToProvider} className="w-14 h-14 shrink-0 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                            <MessageCircle className="w-6 h-6" />
                        </button>
                        <Button 
                            onClick={handleClaimClick} 
                            isLoading={isClaiming} 
                            disabled={isOutOfStock || isThisItemActive || hasAddress === false || isLoadingAddress || isReadOnly || expired}
                            className={`flex-1 h-14 rounded-xl shadow-md font-bold tracking-widest uppercase flex items-center justify-center gap-2 border-0 ${
                                (isOutOfStock || isThisItemActive || hasAddress === false || isLoadingAddress || isReadOnly || expired)
                                ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 shadow-none' 
                                : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-orange-500/20'
                            }`}
                        >
                            {expired ? 'KEDALUWARSA' : isOutOfStock ? 'STOK HABIS' : isLoadingAddress ? 'MEMERIKSA...' : isReadOnly ? 'BACA SAJA' : hasAddress === false ? 'LENGKAPI ALAMAT' : isThisItemActive ? 'SUDAH DIKLAIM' : 'KLAIM SEKARANG'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-200 dark:border-stone-800">
                <div 
                    className="h-36 rounded-xl bg-stone-100 dark:bg-stone-950 overflow-hidden relative border border-stone-200 dark:border-stone-800 cursor-pointer group"
                    onClick={handleRoute}
                    title="Klik untuk buka rute di Google Maps"
                >
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`} 
                        className="filter grayscale group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <MapPin className="text-orange-400 w-4 h-4 shrink-0" />
                        <span className="font-mono text-xs font-bold text-white truncate pr-24">{locationAddress}</span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-mono font-black px-3 py-1.5 rounded-lg shadow-lg transition-all group-hover:scale-105">
                        <Navigation className="w-3 h-3" />
                        RUTE SAYA
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODALS */}
      {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-black text-center text-stone-900 dark:text-white mb-2">Konfirmasi Klaim</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-center text-sm mb-6">
                      Apakah Anda yakin ingin mengambil <span className="font-bold text-stone-900 dark:text-white">{claimQuantity} porsi</span> {item.name}?
                  </p>
                  <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setShowConfirmModal(false)}>Batal</Button>
                      <Button className="flex-1 rounded-2xl bg-orange-600 hover:bg-orange-700" onClick={confirmClaim}>Ya, Yakin</Button>
                  </div>
              </div>
          </div>
      )}

      {showStockWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/10 backdrop-blur-xl animate-in fade-in">
              <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl border border-white/20 relative overflow-hidden text-center">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                  <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <AlertCircle className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 dark:text-white mb-3 tracking-tight">Ketersediaan Kurir</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-8 leading-relaxed">
                      Maaf, relawan pengantar tidak tersedia jika sisa porsi <span className="font-bold text-orange-600">kurang dari 5</span>. Ini untuk menjaga efisiensi rute relawan kami.
                  </p>
                  
                  <div className="bg-stone-100 dark:bg-stone-800/50 p-4 rounded-2xl mb-8 text-left border border-white/5">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Solusi Lain:</p>
                      <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Gunakan Self-Pickup (Ambil Sendiri)
                            </li>
                            <li className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                                <MessageCircle className="w-3.5 h-3.5 text-blue-500" /> Hubungi pemilik untuk COD via WA
                            </li>
                      </ul>
                  </div>

                  <Button 
                      className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20" 
                      onClick={() => setShowStockWarning(false)}
                  >
                      MENGERTI
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
};
