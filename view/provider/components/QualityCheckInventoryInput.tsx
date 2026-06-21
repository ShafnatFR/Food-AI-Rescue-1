import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Upload, Camera, Sparkles, Timer, Weight, ShoppingBag, MapPin, AlertTriangle, Utensils, Brain, Truck, Plus } from 'lucide-react';
import { DeliveryMethod, Address } from '../../../types';
import { foodVerification } from '../../../services/foodVerification';
import { db } from '../../../services/db';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '../../common/ToastContext';

const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { animate: true, duration: 0.5 });
        }
    }, [center, map]);
    return null;
};

interface QualityCheckInventoryInputProps {
  onAnalysisComplete: (result: any, image: string, formData: any) => void;
  onBack: () => void;
  addresses: Address[];
}

export const QualityCheckInventoryInput: React.FC<QualityCheckInventoryInputProps> = ({ onAnalysisComplete, onBack, addresses }) => {
  const [step, setStep] = useState<'form' | 'upload' | 'loading'>('form');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [allowGallery, setAllowGallery] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
      db.getSettings().then(s => {
          if (s && s.allow_gallery_upload !== undefined) {
              setAllowGallery(s.allow_gallery_upload);
          }
      }).catch(console.error);
  }, []);

  const getLocalDateStr = () => {
    return new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(Date.now() - offset).toISOString().slice(0, 16);
  };

  const defaultTimes = {
    start: `${getLocalDateStr()}T18:30`,
    end: `${getLocalDateStr()}T21:00`
  };

  const [form, setForm] = useState({ 
    name: '', 
    ingredients: '', 
    madeDateTime: getCurrentDateTime(),
    distributionStart: defaultTimes.start, 
    distributionEnd: defaultTimes.end,
    quantity: '', 
    quantityUnit: 'Porsi' as 'Porsi' | 'Box' | 'Gram', 
    weightPerUnit: '', 
    minClaim: '1', 
    maxClaim: '5',
    storageLocation: 'Suhu Ruang',
    packaging: 'plastic' as 'plastic' | 'recycled' | 'no-plastic', 
    deliveryMethod: 'pickup' as DeliveryMethod,
    allergens: [] as string[],
    newAllergen: '',
    addressId: addresses.length > 0 ? (addresses.find(a => a.isPrimary)?.id || addresses[0].id) : ''
  });

  const selectedAddress = addresses.find(a => a.id === form.addressId) || addresses[0];
  const mapCenter: [number, number] = selectedAddress?.lat && selectedAddress?.lng 
      ? [selectedAddress.lat, selectedAddress.lng] 
      : [-6.200000, 106.816666];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setStep('loading');
        runAnalysis(base64);
      };
      reader.readAsDataURL(file);
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
              stopCamera();
              
              setImagePreview(dataUrl);
              setStep('loading');
              runAnalysis(dataUrl);
          }
      }
  };

  const runAnalysis = async (img: string) => {
    try {
        const qtyNum = parseFloat(form.quantity) || 1;
        const weightNum = parseFloat(form.weightPerUnit) || 500;
        
        const totalWeightGram = form.quantityUnit === 'Gram' 
            ? qtyNum 
            : qtyNum * weightNum;

        const portionCount = form.quantityUnit === 'Gram' ? 1 : qtyNum;

        const result = await foodVerification.analyze(img, {
            foodName: form.name,
            ingredients: form.ingredients,
            madeTime: form.madeDateTime,
            storageLocation: form.storageLocation,
            weightGram: totalWeightGram,
            packagingType: form.packaging,
            distributionStart: form.distributionStart,
            quantityCount: portionCount 
        });
        
        onAnalysisComplete(result, img, { ...form, allergens: form.allergens.join(', ') });
    } catch (err) {
        console.error(err);
        toast.error("Gagal menganalisis. Silakan coba lagi.");
        setStep('upload');
    }
  };

  const toggleAllergen = (allergen: string) => {
    setForm(prev => {
        const newAllergens = prev.allergens.includes(allergen)
            ? prev.allergens.filter(a => a !== allergen)
            : [...prev.allergens, allergen];
        return { ...prev, allergens: newAllergens };
    });
  };

  const handleAddNewAllergen = () => {
      if (form.newAllergen.trim() && !form.allergens.includes(form.newAllergen.trim())) {
          setForm(prev => ({
              ...prev,
              allergens: [...prev.allergens, prev.newAllergen.trim()],
              newAllergen: ''
          }));
      }
  };

  if (step === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-orange-400" />
                </div>
            </div>
            <h3 className="text-3xl font-black text-stone-900 dark:text-white italic">AI Sedang Mengaudit Kualitas Pangan...</h3>
            <p className="text-stone-500 mt-3 max-w-sm mx-auto">Kami menganalisis risiko pertumbuhan bakteri dan menghitung dampak lingkungan per porsi.</p>
        </div>
      );
  }

  if (step === 'upload') {
      return (
        <div className="w-full max-w-lg mx-auto py-12 animate-in zoom-in-95">
            {!isCameraActive ? (
                <>
                     <button onClick={startCamera} className="w-full relative group cursor-pointer max-w-xs aspect-square mx-auto border-4 border-dashed border-orange-200 dark:border-stone-700 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50/30 transition-all duration-500">
                        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Camera className="w-10 h-10 text-orange-600" />
                        </div>
                        <span className="font-bold text-xl text-stone-800 dark:text-stone-200">Buka Kamera</span>
                        <span className="text-sm text-stone-400 mt-2 px-6 text-center font-medium">Kamera akan terbuka secara langsung untuk memfoto makanan.</span>
                    </button>

                    {allowGallery && (
                        <div className="mt-6 flex justify-center">
                             <label className="cursor-pointer text-stone-600 hover:text-orange-500 dark:text-stone-400 dark:hover:text-orange-400 font-bold text-sm flex items-center gap-2 transition-colors px-5 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                 <Upload className="w-5 h-5" />
                                 <span>Pilih File (Galeri)</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                             </label>
                        </div>
                    )}

                    <button onClick={() => setStep('form')} className="mt-8 text-stone-500 hover:text-stone-900 dark:hover:text-white font-medium flex items-center justify-center w-full transition-colors">← Kembali Isi Detail</button>
                </>
            ) : (
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-black aspect-[3/4] md:aspect-[4/3] lg:aspect-[3/4] max-w-md mx-auto">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-white/20 rounded-[3rem] pointer-events-none"></div>
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
                        <button 
                            type="button"
                            onClick={stopCamera}
                            className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                        >
                            <ArrowRight className="w-6 h-6 rotate-180" />
                        </button>
                        <button 
                            type="button"
                            onClick={takePhoto}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-2xl active:scale-90 transition-all"
                        >
                            <div className="w-16 h-16 border-4 border-stone-900/5 rounded-full"></div>
                        </button>
                        <div className="w-14"></div>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
      );
  }

  // The COMMON Allergen presets
  const commonAllergens = ['Gluten', 'Dairy', 'Nuts', 'Soy'];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 py-4 w-full">
        {/* Header Section (already shown in QualityCheckInventory parent, but kept for context if needed, we'll just put the description) */}
        <div className="mb-8 hidden md:block">
            <p className="text-stone-500 dark:text-stone-400 text-sm">Isi detail di bawah ini untuk mencatat donasi makanan baru ke dalam sistem. AI kami akan secara otomatis mencocokkannya dengan logistik penerima yang optimal.</p>
        </div>

        {/* Bento Grid Form Layout */}
        <form className="grid grid-cols-1 xl:grid-cols-12 gap-6" onSubmit={(e) => { e.preventDefault(); setStep('upload'); }}>
            
            {/* Left Column: Core Info */}
            <div className="xl:col-span-7 space-y-6">
                
                {/* Food Information Card */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-500">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white">Informasi Makanan</h3>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="foodName">Nama Item</label>
                            <input 
                                id="foodName" 
                                required
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                placeholder="Misal: Roti Gandum Utuh" 
                                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" 
                                type="text"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="stock">Jml Stok</label>
                                <input 
                                    id="stock" 
                                    required
                                    type="number" 
                                    min="1"
                                    value={form.quantity}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setForm({...form, quantity: isNaN(val) ? '' : Math.max(0, val).toString()});
                                    }}
                                    placeholder="100" 
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" 
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="unit">Satuan</label>
                                <select 
                                    id="unit" 
                                    value={form.quantityUnit}
                                    onChange={e => setForm({...form, quantityUnit: e.target.value as any})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                >
                                    <option value="Porsi">Porsi</option>
                                    <option value="Box">Box</option>
                                    <option value="Gram">Gram</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="weight">Est. Berat</label>
                                <div className="relative">
                                    <input 
                                        id="weight" 
                                        type="number"
                                        min="1"
                                        required={form.quantityUnit !== 'Gram'}
                                        disabled={form.quantityUnit === 'Gram'}
                                        value={form.weightPerUnit}
                                        onChange={e => setForm({...form, weightPerUnit: e.target.value})}
                                        placeholder={form.quantityUnit === 'Gram' ? 'Otomatis' : '50'} 
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" 
                                    />
                                    <span className="absolute right-4 top-3 text-stone-400 text-sm">
                                        {form.quantityUnit === 'Gram' ? '-' : 'g/unit'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Waktu Masak & Penyimpanan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="madeTime">Waktu Dimasak / Diproduksi</label>
                                <input 
                                    id="madeTime" 
                                    required
                                    value={form.madeDateTime}
                                    onChange={e => setForm({...form, madeDateTime: e.target.value})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]" 
                                    type="datetime-local"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="storageLocation">Penyimpanan</label>
                                <select 
                                    id="storageLocation" 
                                    value={form.storageLocation}
                                    onChange={e => setForm({...form, storageLocation: e.target.value})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                >
                                    <option>Suhu Ruang</option>
                                    <option>Kulkas</option>
                                    <option>Pemanas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dietary & AI Metadata Card */}
                <div className="bg-stone-900 dark:bg-black rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
                    
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-800 pb-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Brain className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Metadata Makanan & AI</h3>
                        <div className="ml-auto flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> AI Assisted
                        </div>
                    </div>
                    
                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-widest" htmlFor="ingredients">Bahan Utama (Pisahkan dgn koma)</label>
                            <textarea 
                                id="ingredients" 
                                value={form.ingredients}
                                onChange={e => setForm({...form, ingredients: e.target.value})}
                                placeholder="Tepung, Air, Ragi..." 
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none placeholder:text-stone-600" 
                            ></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-[11px] font-bold text-stone-400 mb-2 uppercase tracking-widest">Alergen Terdeteksi</label>
                            <div className="flex flex-wrap gap-2">
                                {commonAllergens.map(allergen => (
                                    <label key={allergen} className="cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="peer sr-only" 
                                            checked={form.allergens.includes(allergen)}
                                            onChange={() => toggleAllergen(allergen)}
                                        />
                                        <span className="inline-flex items-center px-4 py-2 rounded-full border border-stone-700 text-stone-400 peer-checked:bg-red-500/20 peer-checked:border-red-500 peer-checked:text-red-400 text-xs font-bold transition-all">
                                            {allergen}
                                        </span>
                                    </label>
                                ))}
                                
                                {/* Custom Allergens */}
                                {form.allergens.filter(a => !commonAllergens.includes(a)).map(allergen => (
                                    <label key={allergen} className="cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="peer sr-only" 
                                            checked={true}
                                            onChange={() => toggleAllergen(allergen)}
                                        />
                                        <span className="inline-flex items-center px-4 py-2 rounded-full border border-red-500 bg-red-500/20 text-red-400 text-xs font-bold transition-all">
                                            {allergen}
                                        </span>
                                    </label>
                                ))}

                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Lainnya..." 
                                        value={form.newAllergen}
                                        onChange={e => setForm({...form, newAllergen: e.target.value})}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewAllergen())}
                                        className="w-24 bg-transparent border-b border-stone-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddNewAllergen}
                                        className="inline-flex items-center p-1.5 rounded-full border border-dashed border-stone-600 text-stone-400 hover:text-emerald-400 hover:border-emerald-400 text-xs font-bold transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Logistics */}
            <div className="xl:col-span-5 space-y-6">
                
                {/* Logistics & Location Card */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                            <Truck className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white">Logistik & Lokasi</h3>
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="pickupStart">Waktu Buka</label>
                                <input 
                                    id="pickupStart" 
                                    required
                                    type="datetime-local" 
                                    value={form.distributionStart}
                                    onChange={e => setForm({...form, distributionStart: e.target.value})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="pickupEnd">Batas Waktu</label>
                                <input 
                                    id="pickupEnd" 
                                    required
                                    type="datetime-local" 
                                    value={form.distributionEnd}
                                    onChange={e => setForm({...form, distributionEnd: e.target.value})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest">Lokasi Pengambilan</label>
                            
                            <select 
                                className="w-full mb-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" 
                                value={form.addressId} 
                                onChange={e => setForm({...form, addressId: e.target.value})}
                            >
                                {addresses.length === 0 ? (
                                    <option value="">Belum ada alamat tersimpan</option>
                                ) : (
                                    addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>{addr.label} - {addr.fullAddress ? addr.fullAddress.substring(0, 30) : ''}...</option>
                                    ))
                                )}
                            </select>

                            <div className="relative h-40 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 z-0">
                                <div className="w-full h-full dark:invert dark:hue-rotate-180">
                                    <MapContainer center={mapCenter} zoom={16} zoomControl={false} className="w-full h-full z-0">
                                        <TileLayer 
                                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                        />
                                        <MapUpdater center={mapCenter} />
                                    </MapContainer>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 pointer-events-none z-10">
                                    <div className="text-white drop-shadow-md">
                                        <div className="text-sm font-bold flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            {selectedAddress?.label || 'Lokasi Belum Diatur'}
                                        </div>
                                        <div className="text-[10px] font-medium opacity-90 pl-5.5 leading-tight mt-1 line-clamp-1">
                                            {selectedAddress?.fullAddress || 'Silakan tambahkan alamat di menu profil.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Missing Options gracefully reintegrated */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="deliveryMethod">Pengiriman</label>
                                <select 
                                    id="deliveryMethod" 
                                    value={form.deliveryMethod}
                                    onChange={e => setForm({...form, deliveryMethod: e.target.value as any})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                >
                                    <option value="pickup">Pick Up</option>
                                    <option value="delivery">Diantar (Relawan)</option>
                                    <option value="both">Keduanya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest" htmlFor="maxClaim">Maks Klaim/Org</label>
                                <input 
                                    id="maxClaim" 
                                    type="number"
                                    min="1"
                                    value={form.maxClaim}
                                    onChange={e => setForm({...form, maxClaim: e.target.value})}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* End of Logistics Card */}
                    </div>
                </div>

            </div>

            {/* Action Area */}
            <div className="xl:col-span-12 mt-4 flex flex-col sm:flex-row items-center justify-end gap-4">
                <button 
                    type="button" 
                    onClick={onBack}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:hover:text-white dark:hover:bg-stone-800 transition-colors"
                >
                    Batalkan
                </button>
                <button 
                    type="submit" 
                    disabled={!form.name || !form.quantity || (form.quantityUnit !== 'Gram' && !form.weightPerUnit)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Lanjut ke Foto & Audit AI
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            
        </form>
    </div>
  );
};
