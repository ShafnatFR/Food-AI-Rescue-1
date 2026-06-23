
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Truck, ShoppingBag, Timer, Clock, List, Edit3, Save, X, Plus, Trash2, Loader2, Info, ChevronDown, Leaf, Award, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '../../../components/Button';
import { FoodItem, ImpactBreakdownItem } from '../../../../types';
import { db } from '../../../../services/db';
import { formatDateTime, isFoodExpired } from '../../../../utils/transformers';
import { toast } from '../../../common/ToastContext';

interface ProductDetailModalProps {
    product: FoodItem;
    onClose: () => void;
    onUpdate?: (updatedItem: FoodItem) => void;
    onDelete?: (id: string) => void;
    disableExpiryLogic?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product: p, onClose, onUpdate, onDelete, disableExpiryLogic = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState<FoodItem>({
        ...p,
        initialQuantity: p.initialQuantity ?? (p as any).initial_quantity ?? (p as any).initialquantity ?? 0,
        currentQuantity: p.currentQuantity ?? (p as any).current_quantity ?? (p as any).currentquantity ?? 0,
        createdAt: p.createdAt ?? (p as any).created_at ?? (p as any).createdat ?? new Date().toISOString(),
        expiryTime: p.expiryTime ?? (p as any).expiry_time ?? (p as any).expirytime ?? '',
        distributionEnd: p.distributionEnd ?? (p as any).distribution_end_time ?? (p as any).distributionend ?? (p.expiryTime ?? (p as any).expiry_time ?? (p as any).expirytime ?? '')
    });
    const [newIngredient, setNewIngredient] = useState('');
    
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isImpactExpanded, setIsImpactExpanded] = useState(true);
    const [activeCalcTab, setActiveCalcTab] = useState<'co2' | 'social'>('co2');

    // Robust fallbacks for older cached data and postgres lowercased keys
    const initialQty = p.initialQuantity ?? (p as any).initial_quantity ?? (p as any).initialquantity ?? 0;
    const currentQty = p.currentQuantity ?? (p as any).current_quantity ?? (p as any).currentquantity ?? 0;
    const createdAt = p.createdAt ?? (p as any).created_at ?? (p as any).createdat ?? new Date().toISOString();
    const expiryTime = p.expiryTime ?? (p as any).expiry_time ?? (p as any).expirytime ?? '';
    const distributionEnd = p.distributionEnd ?? (p as any).distribution_end_time ?? (p as any).distributionend ?? expiryTime;

    const progressPercent = initialQty > 0 ? (currentQty / initialQty) * 100 : 0;
    const expired = !disableExpiryLogic && (p.status === 'expired' || isFoodExpired(distributionEnd, expiryTime));

    useEffect(() => {
        setFormData({
            ...p,
            initialQuantity: initialQty,
            currentQuantity: currentQty,
            createdAt: createdAt,
            expiryTime: expiryTime,
            distributionEnd: distributionEnd
        });
    }, [p]);

    const fullDescription = formData.description || "Tidak ada deskripsi tersedia.";
    const firstDotIndex = fullDescription.indexOf('.');
    const firstSentence = firstDotIndex !== -1 ? fullDescription.substring(0, firstDotIndex + 1) : fullDescription;
    const isLongDescription = fullDescription.length > firstSentence.length;

    const handleSave = async () => {
        if (!onUpdate) return;
        setIsSaving(true);
        try {
            await db.updateFoodItem(formData);
            onUpdate(formData);
            setIsEditing(false);
            toast.success("Data produk berhasil diperbarui!");
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Gagal memperbarui produk.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        if (!confirm("Apakah Anda yakin ingin menghapus produk ini dari stok? Tindakan ini tidak dapat dibatalkan.")) return;
        
        setIsDeleting(true);
        try {
            await db.deleteFoodItem(formData.id);
            onDelete(formData.id);
            onClose();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Gagal menghapus produk.");
            setIsDeleting(false);
        }
    };

    const handleAddIngredient = () => {
        if (newIngredient.trim()) {
            const currentIngredients = formData.aiVerification?.ingredients || [];
            setFormData({
                ...formData,
                aiVerification: {
                    ...formData.aiVerification!,
                    isEdible: formData.aiVerification?.isEdible ?? true,
                    reason: formData.aiVerification?.reason ?? '',
                    halalScore: formData.aiVerification?.halalScore ?? 0,
                    ingredients: [...currentIngredients, newIngredient.trim()]
                }
            });
            setNewIngredient('');
        }
    };

    const handleRemoveIngredient = (index: number) => {
        const currentIngredients = formData.aiVerification?.ingredients || [];
        const newIngredients = currentIngredients.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            aiVerification: {
                ...formData.aiVerification!,
                isEdible: formData.aiVerification?.isEdible ?? true,
                reason: formData.aiVerification?.reason ?? '',
                halalScore: formData.aiVerification?.halalScore ?? 0,
                ingredients: newIngredients
            }
        });
    };

    const handleToggleAllergen = (ingredient: string) => {
        if (!isEditing) return;
        const currentAllergens = formData.aiVerification?.allergens || [];
        const isAllergen = currentAllergens.some(a => a.toLowerCase() === ingredient.toLowerCase());
        
        setFormData({
            ...formData,
            aiVerification: {
                ...formData.aiVerification!,
                isEdible: formData.aiVerification?.isEdible ?? true,
                reason: formData.aiVerification?.reason ?? '',
                halalScore: formData.aiVerification?.halalScore ?? 0,
                allergens: isAllergen 
                    ? currentAllergens.filter(a => a.toLowerCase() !== ingredient.toLowerCase())
                    : [...currentAllergens, ingredient]
            }
        });
    };


    return (
        <div className="fixed inset-0 bg-[#FDFBF7] dark:bg-stone-950 z-[100] overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-100 dark:border-stone-800 p-3 flex items-center justify-between text-stone-900 dark:text-white">
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors font-bold text-sm shrink-0">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <h2 className="font-black text-sm sm:text-base truncate uppercase tracking-tight hidden sm:block">Detail Produk</h2>
                </div>
                <div className="shrink-0">
                    {!isEditing ? (
                        <div className="flex gap-2">
                            {onDelete && (
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-xs"
                                >
                                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                            )}
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors font-bold text-xs"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Edit Data</span><span className="xs:hidden">Edit</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setIsEditing(false); setFormData(p); }} 
                                disabled={isSaving}
                                className="px-3 py-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors font-bold text-xs"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-bold text-xs shadow-lg shadow-green-500/20 disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-10 pb-10 space-y-10">
                <div className={`grid grid-cols-1 ${(formData.socialImpact && formData.socialImpact.co2Breakdown) ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 items-start`}>
                    
                    {/* COLUMN 1: Visuals & Waktu */}
                    <div className="space-y-6">
                        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 relative group">
                            <img src={formData.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={formData.name} />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="bg-white/90 backdrop-blur-md text-stone-900 px-4 py-1.5 rounded-full text-xs font-black shadow-xl uppercase tracking-widest flex items-center gap-2 border border-white/20">
                                    <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> AI SCORE {formData.aiVerification?.halalScore}
                                </span>
                                {expired && (
                                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl uppercase tracking-widest flex items-center gap-2 border border-red-500">
                                        <AlertTriangle className="w-3.5 h-3.5" /> EXPIRED
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 p-5 bg-stone-50 dark:bg-stone-900/30 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                            <div className="flex-1 w-full flex items-center gap-3">
                                <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-sm"><Timer className="w-4 h-4 text-orange-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Dibuat Pada</p>
                                    <p className="font-bold text-stone-900 dark:text-white text-sm">{formatDateTime(formData.createdAt)}</p>
                                </div>
                            </div>
                            <div className="hidden sm:block lg:hidden xl:block w-px h-8 bg-stone-200 dark:bg-stone-800"></div>
                            <div className="hidden lg:block xl:hidden w-full h-px bg-stone-200 dark:bg-stone-800"></div>
                            <div className="flex-1 w-full flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl"><Clock className="w-4 h-4 text-red-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Batas Kedaluwarsa</p>
                                    <p className="font-bold text-red-600 dark:text-red-400 text-sm">{formatDateTime(formData.distributionEnd || formData.expiryTime)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stone-900/30 p-5 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Lokasi Pengambilan</p>
                                </div>
                            </div>
                            <p className="font-bold text-stone-700 dark:text-stone-300 text-sm leading-relaxed mb-4">
                                {formData.location?.address || "Lokasi tidak tersedia"}
                            </p>
                            
                            {(formData.location?.address || (formData.location?.lat && formData.location?.lng)) && (
                                <>
                                    <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-stone-200 dark:border-stone-800">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            frameBorder="0" 
                                            style={{border:0}} 
                                            src={`https://maps.google.com/maps?q=${formData.location.lat},${formData.location.lng}&z=15&output=embed`} 
                                            allowFullScreen 
                                            title="Live Preview Map"
                                        />
                                    </div>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${
                                            (formData.location?.address && formData.location?.address !== "Lokasi tidak tersedia") 
                                                ? encodeURIComponent(formData.location.address) 
                                                : `${formData.location?.lat},${formData.location?.lng}`
                                        }`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block w-full py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-colors"
                                    >
                                        Buka di Maps
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* COLUMN 2: Informasi Utama */}
                    <div className="space-y-6">
                        <div>
                            {isEditing ? (
                                <div className="mb-4">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Nama Produk</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full text-3xl font-black text-stone-900 dark:text-white bg-transparent border-b-2 border-stone-200 focus:border-orange-500 outline-none pb-2"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-4xl font-black text-stone-900 dark:text-white leading-tight mb-4">{formData.name}</h1>
                            )}
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-bold uppercase border border-orange-100 dark:border-orange-800 flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5" /> {formData.deliveryMethod === 'both' ? 'Pick-up & Diantar' : formData.deliveryMethod}
                                </span>
                                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold uppercase border border-blue-100 dark:border-orange-800 flex items-center gap-1.5">
                                    <ShoppingBag className="w-3.5 h-3.5" /> Min: {formData.minQuantity || 1} • Max: {formData.maxQuantity || 5}
                                </span>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-sm">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Status Ketersediaan</p>
                                    <h3 className="text-3xl font-black text-orange-600 italic leading-none">{formData.currentQuantity} <span className="text-sm not-italic text-stone-400">Porsi Tersedia</span></h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-stone-900 dark:text-white">{Math.round(100 - progressPercent)}% Terklaim</span>
                                </div>
                            </div>
                            <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 shadow-lg" style={{width: `${progressPercent}%`}}></div>
                            </div>
                        </div>
                            
                        <div className={`bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 transition-all ${isEditing ? 'ring-2 ring-orange-500/20 bg-white' : ''}`}>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Deskripsi Produk</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
                                        placeholder="Tulis deskripsi makanan..."
                                    />
                                </div>
                            ) : (
                                <p className="text-stone-700 dark:text-stone-200 text-lg leading-loose font-medium">
                                    {isDescExpanded ? fullDescription : firstSentence}
                                    {isLongDescription && !isDescExpanded && (
                                        <button 
                                            onClick={() => setIsDescExpanded(true)}
                                            className="ml-2 text-sm font-black text-orange-500 hover:text-orange-600 uppercase tracking-wide cursor-pointer inline-flex items-center gap-1"
                                        >
                                            Lihat Selengkapnya
                                        </button>
                                    )}
                                    {isLongDescription && isDescExpanded && (
                                        <button 
                                            onClick={() => setIsDescExpanded(false)}
                                            className="ml-2 text-sm font-black text-stone-400 hover:text-stone-600 uppercase tracking-wide cursor-pointer inline-flex items-center gap-1"
                                        >
                                            Sembunyikan
                                        </button>
                                    )}
                                </p>
                            )}

                            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
                                {/* ITEM TERDETEKSI — Badge Biru */}
                                <h4 className="font-black text-sm text-stone-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-3">
                                    <List className="w-4 h-4 text-orange-500" /> Item Terdeteksi dalam Foto
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {formData.aiVerification?.ingredients && formData.aiVerification.ingredients.length > 0 ? (
                                        formData.aiVerification.ingredients.map((ing, i) => (
                                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl group relative">
                                                <span className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-tighter">{ing}</span>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => handleRemoveIngredient(i)}
                                                        className="ml-1 p-0.5 bg-red-100 rounded-full text-red-500 hover:bg-red-200"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-stone-400 text-sm italic">Belum ada data bahan.</span>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="mt-2 mb-6 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newIngredient}
                                            onChange={(e) => setNewIngredient(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                                            placeholder="+ Tambah bahan..."
                                            className="flex-1 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <button 
                                            onClick={handleAddIngredient}
                                            className="px-3 bg-stone-200 dark:bg-stone-700 hover:bg-orange-500 hover:text-white rounded-xl transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {/* PERINGATAN ALERGEN — Badge Merah, seksi terpisah persis seperti QualityCheckInventory */}
                                <h4 className="font-black text-sm text-stone-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-red-500" /> Peringatan Alergen
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {formData.aiVerification?.allergens && formData.aiVerification.allergens.length > 0 ? (
                                        formData.aiVerification.allergens.map((allergen, i) => (
                                            <div key={`allergen-${i}`} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl">
                                                <span className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-tighter">{allergen}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-stone-400 italic px-1">Tidak ada alergen kritis terdeteksi.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 3: Dampak Lingkungan (Conditional) */}
                    {formData.socialImpact && formData.socialImpact.co2Breakdown && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-6 text-stone-900 dark:text-white shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                                            {activeCalcTab === 'co2' ? (
                                                <Leaf className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Award className="w-5 h-5 text-indigo-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-stone-500 dark:text-stone-400 font-black uppercase tracking-widest">TOTAL DAMPAK</p>
                                            <p className="text-xl font-bold text-stone-900 dark:text-white">
                                                {activeCalcTab === 'co2' 
                                                    ? `${formData.socialImpact.co2Saved}kg CO2` 
                                                    : `${formData.socialImpact.totalPoints} Poin`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsImpactExpanded(!isImpactExpanded)}
                                        className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-full transition-colors"
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isImpactExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className={`overflow-hidden transition-all duration-500 ${isImpactExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="bg-stone-50 dark:bg-black/30 rounded-2xl p-4 mt-2 border border-stone-200 dark:border-white/5">
                                        <div className="flex bg-stone-200/50 dark:bg-white/5 p-1 rounded-xl mb-4">
                                            <button onClick={() => setActiveCalcTab('co2')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeCalcTab === 'co2' ? 'bg-emerald-500 text-white shadow-md' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}>
                                                CO2
                                            </button>
                                            <button onClick={() => setActiveCalcTab('social')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeCalcTab === 'social' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}>
                                                SOCIAL
                                            </button>
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-500 dark:text-stone-400 mb-3 text-[10px] uppercase tracking-widest">
                                                METODOLOGI PERHITUNGAN (LCA STANDARD)
                                            </p>
                                            <div className="bg-white dark:bg-white/5 p-3 rounded-lg border border-stone-200 dark:border-white/10 mb-6">
                                                <code className={`block text-[10px] font-mono ${activeCalcTab === 'co2' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                                    {activeCalcTab === 'co2' 
                                                        ? 'CO2 Saved = Σ (Berat Komponen x Faktor Emisi Kategori)' 
                                                        : 'Total Poin = Σ (Berat Komponen x Faktor Dampak Sosial)'}
                                                </code>
                                            </div>
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="font-bold text-stone-700 dark:text-stone-300 text-[10px] uppercase tracking-widest">
                                                    ANALISIS KANDUNGAN PER 1 PORSI
                                                </p>
                                                <span className="text-[10px] font-black text-orange-500">
                                                    Bobot: {(formData.weightPerUnit || 500)}g
                                                </span>
                                            </div>
                                            <div className="space-y-3 mb-6">
                                                {(activeCalcTab === 'co2' 
                                                    ? formData.socialImpact?.co2Breakdown 
                                                    : formData.socialImpact?.socialBreakdown
                                                )?.map((item: ImpactBreakdownItem, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-[11px] border-b border-stone-200 dark:border-white/10 pb-2 last:border-0">
                                                        <span className="text-stone-700 dark:text-stone-300 font-medium">{item.name}</span>
                                                        <div className="text-right font-mono">
                                                            <span className={`font-bold ${activeCalcTab === 'co2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                                {item.result} {activeCalcTab === 'co2' ? 'kg' : 'Pts'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-3 mt-1 border-t border-stone-300 dark:border-white/20">
                                                    <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">Total (1 Porsi)</span>
                                                    <span className={`font-black text-sm ${activeCalcTab === 'co2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                        {activeCalcTab === 'co2' 
                                                            ? `${formData.socialImpact?.co2PerPortion} kg CO2`
                                                            : `${formData.socialImpact?.pointsPerPortion} Pts`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
