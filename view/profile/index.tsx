
import React, { useState, useEffect } from 'react';
import { User, MapPin, Shield, HelpCircle, LogOut, Moon, Sun, Store, Heart, ChevronRight, ArrowLeft, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { UserRole, UserData, SavedItem, ClaimHistoryItem, FoodItem, FAQItem, Address } from '../../types';
import { ProfileHeader } from './components/ProfileHeader';
import { EditProfile } from './components/EditProfile';
import { AddressList } from './components/AddressList';
import { SecuritySettings } from './components/SecuritySettings';
import { FaqSection } from './components/FaqSection';
import { SavedItems } from './components/SavedItems';
import { ClaimHistory, ReportModal, ReviewModal } from './components/ClaimHistory';
import { ClaimHistoryDetail } from './components/ClaimHistoryDetail'; 
import { GamificationSummary } from './components/GamificationSummary';
import { PointHistory } from './components/PointHistory';
import { AIApiManagement } from './components/AIApiManagement';
import { HistoryList } from '../volunteer/components/HistoryList';
import { FoodDetail } from '../receiver/components/FoodDetail';
import { db } from '../../services/db';
import { toast } from '../common/ToastContext';

interface ProfileIndexProps {
  role: UserRole;
  currentUser: UserData | null;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigate: (view: string) => void;
  initialView?: 'main' | 'address' | 'history' | 'saved' | 'edit' | 'security' | 'faq' | 'point_history';
  savedItems: SavedItem[];
  setSavedItems: React.Dispatch<React.SetStateAction<SavedItem[]>>;
  claimHistory: ClaimHistoryItem[];
  setClaimHistory: React.Dispatch<React.SetStateAction<ClaimHistoryItem[]>>;
  availableFoodForDetail: FoodItem[];
  onClaim: (item: FoodItem, quantity: string) => void;
  globalFAQs: FAQItem[];
  stats: {
      label1: string; value1: number | string;
      label2: string; value2: number | string;
      label3: string; value3: number;
  };
  onSubmitReview?: (claimId: string, rating: number, comment: string, media: string[]) => void;
  onSubmitReport?: (claimId: string, reason: string, description: string, evidence: string[]) => void;
  onRefresh?: () => void; 
  allAddresses?: Address[];
  onUpdateUser?: (data: UserData) => void;
  onEditAvatar?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  socialSystem?: any;
}

const MenuButton = ({ icon: Icon, label, subtitle, onClick, last }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 lg:p-5 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all duration-200 group ${!last ? 'border-b border-stone-100 dark:border-stone-800' : ''}`}
    >
        <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-colors">
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="text-left">
                <span className="text-stone-900 dark:text-stone-200 text-sm font-semibold block">{label}</span>
                {subtitle && <span className="text-[10px] text-stone-400 font-medium hidden lg:block">{subtitle}</span>}
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
    </button>
);

export const ProfileIndex: React.FC<ProfileIndexProps> = ({ 
    role, 
    currentUser, 
    onLogout, 
    isDarkMode, 
    toggleTheme,
    onNavigate,
    initialView = 'main',
    savedItems,
    setSavedItems,
    claimHistory,
    setClaimHistory,
    availableFoodForDetail,
    onClaim,
    globalFAQs,
    stats,
    onSubmitReview,
    onSubmitReport,
    onRefresh,
    allAddresses = [],
    onUpdateUser,
    onEditAvatar,
    socialSystem
}) => {
    const [currentView, setCurrentView] = useState<string>(initialView);
    const [userData, setUserData] = useState<UserData | null>(currentUser);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    
    // For Food Detail in Saved Items
    const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
    
    // For Claim History Detail & Actions
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<ClaimHistoryItem | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    // Edit Profile unsaved changes state
    const [isEditDirty, setIsEditDirty] = useState(false);
    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [pendingSave, setPendingSave] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setUserData(currentUser);
            setIsEditDirty(false); // Reset dirty state when user data is freshly loaded
        }
    }, [currentUser]);

    useEffect(() => {
        if (initialView) {
            setCurrentView(initialView);
        }
    }, [initialView]);

    useEffect(() => {
        if (currentView === 'history') {
            setIsHistoryLoading(true);
            const timer = setTimeout(() => {
                setIsHistoryLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentView]);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (currentUser?.id) {
                try {
                    const data = await db.getAddresses(currentUser.id);
                    setAddresses(data);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        fetchAddresses();
    }, [currentUser]);

    const handleUpdateUser = (data: UserData) => {
        setUserData(data);
        if (onUpdateUser) onUpdateUser(data);
    };

    const handleAddAddress = async (addr: Address) => {
        if (!currentUser) return;
        const newAddr = { ...addr, userId: currentUser.id, role: currentUser.role };
        const saved = await db.addAddress(newAddr);
        setAddresses([...addresses, saved]);
    };

    const handleUpdateAddress = async (addr: Address) => {
        const updatedAddr = { ...addr, role: currentUser?.role || addr.role };
        await db.updateAddress(updatedAddr);
        // Use loose equality or String casting for ID matching as MySQL returns numbers
        setAddresses(prev => prev.map(a => String(a.id) === String(addr.id) ? { ...updatedAddr, id: a.id } : (a.isPrimary && updatedAddr.isPrimary ? { ...a, isPrimary: false } : a)));
    };

    const handleDeleteAddress = async (id: string) => {
        await db.deleteAddress(id);
        setAddresses(prev => prev.filter(a => a.id !== id));
    };

    const handleToggleSave = (item: FoodItem) => {
        if (savedItems.some(s => s.id === item.id)) {
            setSavedItems(savedItems.filter(s => s.id !== item.id));
        } else {
            setSavedItems([...savedItems, { id: item.id, name: item.name, provider: item.providerName, image: item.imageUrl, status: 'available' }]);
        }
    };

    const handleCompleteClaim = async () => {
        if (selectedHistoryItem) {
            try {
                await db.updateClaimStatus(selectedHistoryItem.id, 'completed');
                setClaimHistory(prev => prev.map(c => c.id === selectedHistoryItem.id ? { ...c, status: 'completed' } : c));
                
                // Update selected item status locally to reflect change immediately without closing modal if desired
                setSelectedHistoryItem(prev => prev ? { ...prev, status: 'completed' } : null);
                
                toast.success("Pesanan berhasil diselesaikan!");
            } catch (e) {
                console.error("Gagal update status", e);
                toast.error("Gagal memperbarui status pesanan.");
            }
        }
    };

    const handleReportSubmit = (reason: string, description: string, evidence: string[]) => {
        if (selectedHistoryItem && onSubmitReport) {
            onSubmitReport(selectedHistoryItem.id, reason, description, evidence);
            setReportModalOpen(false);
            
            // Update local state to show 'Reported' status immediately.
            // reportEvidence is now an array (string[])
            setSelectedHistoryItem(prev => prev ? { 
                ...prev, 
                isReported: true,
                reportReason: reason,
                reportDescription: description,
                reportEvidence: evidence
            } : null);
            toast.info("Laporan Anda telah dikirim.");
        }
    };

    const handleReviewSubmit = (rating: number, review: string, media: string[]) => {
        if (selectedHistoryItem && onSubmitReview) {
            onSubmitReview(selectedHistoryItem.id, rating, review, media);
            setReviewModalOpen(false);
            
            // Update local state to show rating & media immediately
            setSelectedHistoryItem(prev => prev ? { ...prev, rating, review, reviewMedia: media } : null);
            toast.success("Terima kasih atas ulasan Anda!");
        }
    };

    // Sub-view renders
    if (currentView === 'edit' && userData) {
        return (
            <div className="p-4 md:p-8 pb-32">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => {
                            if (isEditDirty) {
                                setShowConfirmBack(true);
                            } else {
                                setCurrentView('main');
                            }
                        }} 
                        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-stone-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Edit Profil</h2>
                </div>
                <EditProfile 
                    userData={userData} 
                    onSave={(data) => {
                        handleUpdateUser(data);
                        setIsEditDirty(false);
                        if (pendingSave) {
                            setPendingSave(false);
                            setCurrentView('main');
                        }
                    }} 
                    addresses={addresses}
                    onDirtyChange={setIsEditDirty}
                    triggerSave={pendingSave}
                />

                {/* Confirm Back Modal */}
                {showConfirmBack && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-stone-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-300">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tight">Simpan Perubahan?</h3>
                                <p className="text-stone-500 text-sm mt-2 font-medium">Anda memiliki perubahan yang belum disimpan. Ingin menyimpannya sekarang?</p>
                            </div>
                            <div className="p-6 pt-0 flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        setShowConfirmBack(false);
                                        setPendingSave(true);
                                    }}
                                    className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                                >
                                    Simpan & Keluar
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowConfirmBack(false);
                                        setIsEditDirty(false);
                                        setCurrentView('main');
                                    }}
                                    className="w-full h-14 bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95"
                                >
                                    Hapus & Keluar
                                </button>
                                <button 
                                    onClick={() => setShowConfirmBack(false)}
                                    className="w-full h-14 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold text-sm transition-colors"
                                >
                                    Batal (Tetap di Sini)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (currentView === 'address') {
        return (
            <div className="pb-32 animate-view-enter">
                <div className="flex items-center gap-4 p-4 md:p-8 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
                    <button onClick={() => setCurrentView('main')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Alamat Tersimpan</h2>
                </div>
                <AddressList 
                    addresses={addresses} 
                    onAddAddress={handleAddAddress} 
                    onUpdateAddress={handleUpdateAddress} 
                    onDeleteAddress={handleDeleteAddress} 
                    role={role}
                    currentUser={currentUser}
                />
            </div>
        );
    }

    if (currentView === 'security') {
        return (
            <div className="pb-32">
                <div className="flex items-center gap-4 p-4 md:p-8 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
                    <button onClick={() => setCurrentView('main')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Keamanan</h2>
                </div>
                <SecuritySettings />
            </div>
        );
    }

    if (currentView === 'faq') {
        return (
            <div className="pb-32">
                <div className="flex items-center gap-4 p-4 md:p-8 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
                    <button onClick={() => setCurrentView('main')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Bantuan & FAQ</h2>
                </div>
                <FaqSection faqs={globalFAQs} />
            </div>
        );
    }

    // Point History will be handled responsively in the main render
    // no early return here anymore as it is handled by the responsive wrapper at the end
    
    if (currentView === 'ai_settings' && userData) {
        return (
            <div className="p-4 md:p-8 pb-32">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setCurrentView('main')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Pengaturan Utama AI</h2>
                </div>
                <AIApiManagement currentUser={userData} />
            </div>
        );
    }

    if (currentView === 'saved') {
        if (selectedFoodItem) {
            return (
                <FoodDetail 
                    item={selectedFoodItem} 
                    onBack={() => setSelectedFoodItem(null)} 
                    onClaim={(qty) => { onClaim(selectedFoodItem, qty); setSelectedFoodItem(null); }} 
                    isSaved={true}
                    onToggleSave={() => handleToggleSave(selectedFoodItem)}
                    claimHistory={claimHistory}
                />
            );
        }
        return (
            <div className="pb-32">
                <div className="flex items-center gap-4 p-4 md:p-8 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
                    <button onClick={() => setCurrentView('main')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-900 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Makanan Tersimpan</h2>
                </div>
                <SavedItems 
                    items={savedItems} 
                    onDelete={(ids) => setSavedItems(prev => prev.filter(i => !ids.has(i.id)))}
                    onDetail={(saved) => {
                        const food = availableFoodForDetail.find(f => f.id === saved.id);
                        if (food) setSelectedFoodItem(food);
                        else toast.info("Item ini sudah tidak tersedia di inventory.");
                    }}
                />
            </div>
        );
    }

    if (currentView === 'history') {
        // Jika ada item riwayat yang dipilih, tampilkan detail
        if (selectedHistoryItem && role !== 'volunteer') {
            return (
                <>
                    <ClaimHistoryDetail 
                        item={selectedHistoryItem}
                        onBack={() => setSelectedHistoryItem(null)}
                        onComplete={handleCompleteClaim}
                        onReport={() => setReportModalOpen(true)}
                        onReview={() => setReviewModalOpen(true)}
                    />
                    {reportModalOpen && (
                        <ReportModal 
                            item={selectedHistoryItem} 
                            onClose={() => setReportModalOpen(false)}
                            onSubmit={handleReportSubmit}
                        />
                    )}
                    {reviewModalOpen && (
                        <ReviewModal 
                            item={selectedHistoryItem} 
                            onClose={() => setReviewModalOpen(false)}
                            onSubmit={handleReviewSubmit}
                        />
                    )}
                </>
            );
        }

        return (
            <div className="pb-32 bg-[#FDFBF7] dark:bg-stone-950 min-h-screen">
                <div className="px-6 pt-8 pb-2 md:px-8 bg-[#FDFBF7] dark:bg-stone-900 sticky top-0 z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-stone-900 dark:text-white leading-none tracking-tight">
                            {role === 'volunteer' ? 'Riwayat Misi' : 'Riwayat Makanan'}
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 mt-1 text-xs font-bold">
                            {role === 'volunteer' ? 'Jejak kontribusi kebaikan Anda.' : 'Surplus makanan yang telah diselamatkan.'}
                        </p>
                    </div>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isHistoryLoading}
                            className="w-10 h-10 bg-white dark:bg-stone-800 text-stone-500 hover:text-orange-500 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-90 disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${isHistoryLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>
                
                {role === 'volunteer' ? (
                    <div className="px-4 md:px-8 pt-4">
                        <HistoryList 
                            history={claimHistory
                                .filter(c => c.courierName === currentUser?.name && c.status === 'completed')
                                .map(c => {
                                    const providerAddr = allAddresses.find(a => String(a.userId) === String(c.providerId));
                                    const receiverAddr = allAddresses.find(a => String(a.userId) === String(c.receiverId));

                                    return { 
                                        // FIX: ensure id is treated as string before regex
                                        id: parseInt(String(c.id).replace(/\D/g, '') || String(Date.now())), 
                                        originalId: c.id,
                                        date: c.date, 
                                        from: providerAddr ? providerAddr.label : c.providerName, 
                                        to: receiverAddr ? receiverAddr.label : 'Penerima', 
                                        items: c.foodName, 
                                        points: 150,
                                        distance: 2.5 
                                    };
                                })
                            }
                            onFindMissions={() => onNavigate('dashboard')} 
                        />
                    </div>
                ) : (
                    <ClaimHistory 
                        history={claimHistory} 
                        onSelectItem={setSelectedHistoryItem} 
                        onSubmitReview={onSubmitReview}
                        onSubmitReport={onSubmitReport}
                        isLoading={isHistoryLoading} 
                        onRefresh={onRefresh} 
                    />
                )}
            </div>
        );
    }

    return (
        <div className="pb-32 animate-in fade-in">
            {/* MOBILE ONLY POINT HISTORY VIEW */}
            {currentView === 'point_history' && (
                <div className="lg:hidden animate-view-enter">
                    <PointHistory 
                        currentUser={userData} 
                        onBack={() => setCurrentView('main')} 
                    />
                </div>
            )}

            {/* MAIN DASHBOARD LAYOUT (Hidden on mobile if viewing point history) */}
            <div className={`${currentView === 'point_history' ? 'hidden lg:block' : ''} animate-perspective-enter`}>
                {/* FULL-WIDTH PROFILE HEADER */}
                <div className="mx-auto max-w-6xl md:px-0 lg:px-8">
                    {userData && (
                        <div className="md:mt-0 md:overflow-hidden md:rounded-xl md:border md:border-stone-200 md:shadow-desktop-card lg:mt-8 lg:rounded-[2rem] dark:md:border-stone-800 dark:lg:border-stone-800 lg:shadow-lg">
                            <ProfileHeader 
                                userData={userData} 
                                role={role} 
                                bannerImage={null} 
                                onEditBanner={() => {}} 
                                onEditAvatar={onEditAvatar || (() => {})} 
                                stats={stats}
                                onUpdateUser={handleUpdateUser}
                                socialSystem={socialSystem}
                            />
                        </div>
                    )}
                </div>

                {/* CONTENT AREA: 2-COLUMN GRID ON PC */}
                <div className="mx-auto mt-6 max-w-6xl px-4 md:mt-8 md:px-0 lg:px-8 lg:mt-10">
                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-5 md:gap-8 lg:gap-8">
                        
                        {/* LEFT COLUMN: GAMIFICATION & EXTRAS (2/5) */}
                        <div className="space-y-5 md:col-span-2">
                            {currentView === 'point_history' ? (
                                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden animate-in fade-in">
                                    <header className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Riwayat Poin</h3>
                                        <button onClick={() => setCurrentView('main')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline transition-all">Tutup</button>
                                    </header>
                                    <div className="p-0 animate-view-enter">
                                        <PointHistory 
                                            currentUser={userData} 
                                            onBack={() => setCurrentView('main')}
                                            isEmbedded={true}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <GamificationSummary 
                                    currentUser={userData} 
                                    currentPoints={typeof stats?.value3 === 'number' ? stats.value3 : 0} 
                                    onViewHistory={() => setCurrentView('point_history')}
                                />
                            )}


                        </div>

                    {/* RIGHT COLUMN: MENUS (3/5) */}
                    <div className="space-y-5 md:col-span-3">
                        {/* Aktivitas (Recipient only) */}
                        {role === 'recipient' && (
                            <div>
                                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1">Aktivitas</h3>
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                                    <MenuButton icon={Heart} label="Makanan Tersimpan" subtitle="Lihat daftar makanan yang disimpan" onClick={() => setCurrentView('saved')} last />
                                </div>
                            </div>
                        )}

                        {/* Akun Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1">Akun</h3>
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                                <MenuButton icon={User} label="Edit Profil" subtitle="Perbarui nama, email, dan foto" onClick={() => setCurrentView('edit')} />
                                {role !== 'volunteer' && (
                                    <MenuButton icon={MapPin} label="Alamat Tersimpan" subtitle="Kelola alamat pengiriman" onClick={() => setCurrentView('address')} />
                                )}
                                <MenuButton icon={Shield} label="Keamanan & Privasi" subtitle="Password dan verifikasi" onClick={() => setCurrentView('security')} />
                                {role !== 'volunteer' && (
                                    <MenuButton icon={Sparkles} label="Pengaturan API AI" subtitle="Konfigurasi kunci API" onClick={() => setCurrentView('ai_settings')} />
                                )}
                            </div>
                        </div>

                        {/* Preferensi Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1">Preferensi</h3>
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                                <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all duration-200 group border-b border-stone-100 dark:border-stone-800">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-colors">
                                            {isDarkMode ? <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-orange-400" /> : <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />}
                                        </div>
                                        <div className="text-left">
                                            <span className="text-stone-900 dark:text-stone-200 text-sm font-semibold block">Tema Aplikasi</span>
                                            <span className="text-[10px] text-stone-400 font-medium hidden lg:block">Aktifkan mode {isDarkMode ? 'terang' : 'gelap'}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full font-semibold">{isDarkMode ? 'Gelap' : 'Terang'}</span>
                                </button>
                                <MenuButton icon={HelpCircle} label="Bantuan & FAQ" subtitle="Pertanyaan umum dan panduan" onClick={() => setCurrentView('faq')} last />
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="pt-2">
                            <button 
                                onClick={onLogout} 
                                className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-stone-900 border border-red-100 dark:border-red-900/30 text-red-600 rounded-2xl font-semibold text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 active:scale-95"
                            >
                                <LogOut className="w-4 h-4" /> 
                                Keluar Akun
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

