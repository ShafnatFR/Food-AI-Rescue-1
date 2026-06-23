
import React, { useState, useEffect, useCallback } from 'react';
import { Package, LayoutGrid, StretchHorizontal, Plus, Loader2, Lock, AlertCircle, MapPin } from 'lucide-react';
import { EmptyState } from '../../../common/EmptyState';
import { FoodItem, UserData, FoodCategory, PackageType, StorageType, ProviderRole } from '../../../../types';
import { StockItemCardSkeleton } from './StockItemCardSkeleton';
import { QualityCheckInventory } from '../QualityCheckInventory';
import { ProductDetailModal } from './ProductDetailModal';
import { StockItemCard } from './StockItemCard';
import { StockHeader } from './StockHeader';
import { StockPagination } from './StockPagination';

import { Button } from '../../../components/Button';
import { db } from '../../../../services/db';
import { checkAndExpireItems } from '../../../../utils/expiryChecker';

interface StockManagerProps {
    foodItems: FoodItem[];
    setFoodItems: React.Dispatch<React.SetStateAction<FoodItem[]>>;
    currentView: 'stock' | 'orders' | 'history';
    setCurrentView: (view: 'stock' | 'orders' | 'history') => void;
    currentUser?: UserData | null;
    isLoading?: boolean;
    onRefresh?: () => void;
    onNavigate: (view: string) => void;
    isReadOnly?: boolean;
    disableExpiryLogic?: boolean;
    openAddForm?: boolean;
    onAddFormOpened?: () => void;
}


export const StockManager: React.FC<StockManagerProps> = ({ 
    foodItems, 
    setFoodItems, 
    currentView, 
    setCurrentView, 
    currentUser, 
    isLoading: isParentLoading,
    onRefresh: onParentRefresh,
    onNavigate,
    isReadOnly = false,
    disableExpiryLogic = false,
    openAddForm = false,
    onAddFormOpened,
}) => {
    const [isAddingNew, setIsAddingNew] = useState(false);

    useEffect(() => {
        if (openAddForm) {
            setIsAddingNew(true);
            onAddFormOpened?.();
        }
    }, [openAddForm, onAddFormOpened]);

    const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [isFetching, setIsFetching] = useState(true);
    const [hasAddress, setHasAddress] = useState<boolean | null>(null);

    // Fetch directly from DB — no cache
    const fetchInventoryAndAddress = useCallback(async () => {
        if (!currentUser?.id) {
            setIsFetching(false);
            return;
        }

        setIsFetching(true);
        try {
            const [inventoryData, addressData] = await Promise.all([
                db.getInventory(currentUser.id),
                db.getAddresses(currentUser.id)
            ]);

            if (inventoryData && Array.isArray(inventoryData)) {
                const processedInventory = disableExpiryLogic
                    ? inventoryData
                    : await checkAndExpireItems(inventoryData);
                setFoodItems(processedInventory);
            }

            setHasAddress(!!(addressData && addressData.length > 0));
        } catch (error) {
            console.error('Gagal memuat data inventaris:', error);
        } finally {
            setIsFetching(false);
        }
    }, [currentUser?.id, disableExpiryLogic, setFoodItems]);

    // Combined Refresh Handler
    const handleRefresh = async () => {
        if (onParentRefresh) await onParentRefresh();
        await fetchInventoryAndAddress();
    };

    const showLoading = isFetching || isParentLoading;

    // Fetch on mount & when user changes
    useEffect(() => {
        fetchInventoryAndAddress();
    }, [fetchInventoryAndAddress]);

    // After adding, re-fetch from DB to get full data (including location/addressId)
    const handleAddNewItem = async (_newItem: FoodItem) => {
        setIsAddingNew(false);
        await fetchInventoryAndAddress();
    };

    // After updating, re-fetch from DB so all fields are fresh
    const handleUpdateItem = async (updatedItem: FoodItem) => {
        setSelectedProduct(updatedItem);
        await fetchInventoryAndAddress();
    };

    // After deleting, re-fetch from DB
    const handleDeleteItem = async (_id: string) => {
        setSelectedProduct(null);
        await fetchInventoryAndAddress();
    };

    // Backend now returns only the relevant items.
    const myItems = foodItems;

    // Filter by Search Query
    const filteredItems = myItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    if (isAddingNew) {
        return (
            <div className="mx-auto max-w-5xl p-4 pb-32 md:max-w-none md:p-0 md:pb-8">
                <QualityCheckInventory 
                    onBack={() => setIsAddingNew(false)} 
                    onSuccess={handleAddNewItem}
                    currentUser={currentUser}
                />
            </div>
        );
    }

    if (selectedProduct) {
        return (
            <ProductDetailModal 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                disableExpiryLogic={disableExpiryLogic}
            />
        );
    }

    return (
        <div className="mx-auto max-w-5xl animate-in p-6 pb-32 fade-in slide-in-from-left-4 md:max-w-none md:p-0 md:pb-8">
            {/* 1. Header (Judul + Search + Refresh) */}
            <StockHeader 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                onRefresh={handleRefresh}
                isLoading={showLoading}
            />

            {/* 2. Action & Toggle */}
            <div className="space-y-6">
                <div className="space-y-3">
                    {!showLoading && hasAddress === false && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex flex-col items-start gap-3 animate-in slide-in-from-top-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-700 dark:text-red-400 text-xs uppercase tracking-wider mb-1">Akses Terkunci</h4>
                                    <p className="text-xs text-red-600/80 dark:text-red-300 leading-relaxed">
                                        Anda belum mengatur lokasi pengambilan. Silakan lengkapi <strong>Alamat</strong> di menu Profil untuk membuka fitur donasi.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onNavigate('profile-address')}
                                className="ml-11 text-[10px] bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 active:scale-95"
                            >
                                <MapPin className="w-3.5 h-3.5" /> Atur Alamat Pengambilan
                            </button>
                        </div>
                    )}

                    <Button 
                        onClick={() => setIsAddingNew(true)}
                        disabled={hasAddress === false || showLoading || isReadOnly}
                        className={`w-full h-14 font-black uppercase tracking-widest rounded-2xl border-0 transition-all ${
                            (hasAddress === false || showLoading || isReadOnly)
                            ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-xl shadow-orange-500/30 active:scale-[0.98]'
                        }`}
                    >
                        {showLoading ? (
                            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> MEMERIKSA DATA...</span>
                        ) : isReadOnly ? (
                            <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> MODE BACA SAJA</span>
                        ) : hasAddress === false ? (
                            <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> FITUR TERKUNCI</span>
                        ) : (
                            <span className="flex items-center gap-2"><Plus className="w-6 h-6" /> TAMBAH DONASI</span>
                        )}
                    </Button>

                </div>

                <div className="flex bg-stone-100 dark:bg-stone-900 p-1.5 rounded-2xl w-full border border-stone-200 dark:border-stone-800">
                    <button 
                        onClick={() => setLayoutMode('grid')}
                        className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${layoutMode === 'grid' ? 'bg-white dark:bg-stone-800 text-orange-600 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden xs:inline">Grid</span>
                    </button>
                    <button 
                        onClick={() => setLayoutMode('list')}
                        className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${layoutMode === 'list' ? 'bg-white dark:bg-stone-800 text-orange-600 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                    >
                        <StretchHorizontal className="w-4 h-4" />
                        <span className="hidden xs:inline">List</span>
                    </button>
                </div>
            </div>
            
            {/* CONTENT AREA: Loading OR Data */}
            {showLoading ? (
                <div className="mt-6">
                    <div className={`grid gap-3 md:gap-5 ${layoutMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <StockItemCardSkeleton key={i} layoutMode={layoutMode} />
                        ))}
                    </div>
                </div>
            ) : currentItems.length === 0 ? (
                <EmptyState 
                    icon={Package} 
                    title={searchQuery ? "Tidak Ditemukan" : "Inventory Kosong"} 
                    description={searchQuery ? `Tidak ada produk dengan kata kunci "${searchQuery}" di stok Anda.` : "Anda belum memiliki stok aktif. Mulai donasi sekarang!"}
                    actionLabel={searchQuery ? "Reset Pencarian" : (hasAddress !== false ? "Tambah Donasi" : undefined)}
                    onAction={searchQuery ? () => setSearchQuery('') : () => setIsAddingNew(true)}
                    className="mt-6"
                />
            ) : (
                <div className="mt-6">
                    <div className={`grid gap-3 md:gap-5 ${layoutMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {currentItems.map(item => (
                            <StockItemCard 
                                key={item.id} 
                                item={item} 
                                layoutMode={layoutMode} 
                                onClick={() => setSelectedProduct(item)} 
                                disableExpiryLogic={disableExpiryLogic}
                            />
                        ))}
                    </div>

                    {filteredItems.length > itemsPerPage && (
                        <StockPagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            setCurrentPage={setCurrentPage} 
                            indexOfFirstItem={indexOfFirstItem} 
                            indexOfLastItem={indexOfLastItem} 
                            totalItems={filteredItems.length} 
                        />
                    )}
                </div>
            )}
        </div>
    );
};
