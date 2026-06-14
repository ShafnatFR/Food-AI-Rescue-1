
import React, { useMemo, useState } from 'react';
import { Bell, Sparkles, Utensils } from 'lucide-react'; 
import { DashboardStats } from './components/Dashboard';
import { FoodItem, ClaimHistoryItem, UserData } from '../../types';
import { NotificationsPage } from '../common/Notifications';
import { OnboardingTour } from '../common/OnboardingTour';
import { ImpactWidget } from './components/Dashboard/ImpactWidget';
import { NearbyRequests } from './components/Dashboard/NearbyRequests';
import { CorporateAIWidgets } from './components/CorporateAIWidgets';
import { KitchenScanner } from '../common/KitchenScanner';
import { EcoPackagingEditor } from '../common/EcoPackagingEditor';
import { CSRWriterEditor } from '../common/CSRWriterEditor';
import { KitchenHistory } from './components/KitchenHistory';
import { db } from '../../services/db';
import { SOCIAL_SYSTEM } from '../../constants';
import { RankDetailsModal } from './components/Dashboard/RankDetailsModal';

interface ProviderIndexProps {
  onOpenNotifications: () => void;
  isSubNavOpen: boolean;
  onToggleSubNav: () => void;
  onNavigate: (view: string) => void;
  foodItems?: FoodItem[];
  claimHistory?: ClaimHistoryItem[];
  currentUser?: UserData | null;
  onCompleteOnboarding?: () => void; 
  notifications?: any[];
  onRefresh?: () => void;
  socialSystem?: any;
  disableExpiryLogic?: boolean;
  pendingProviderTool?: 'kitchen' | 'kitchen-history' | 'csr' | 'packaging' | null;
  onClearPendingProviderTool?: () => void;
}

export const ProviderIndex: React.FC<ProviderIndexProps> = ({ 
    onOpenNotifications,
    onNavigate, 
    foodItems = [], 
    claimHistory = [], 
    currentUser,
    onCompleteOnboarding,
    notifications = [],
    onRefresh,
    socialSystem,
    pendingProviderTool,
    onClearPendingProviderTool,
}) => {
  const [socialImpact, setSocialImpact] = useState<any>(null);
  const [isLoadingImpact, setIsLoadingImpact] = useState(true);
  const [showKitchenScanner, setShowKitchenScanner] = useState(false);
  const [kitchenInitialTab, setKitchenInitialTab] = useState<'scan' | 'history'>('scan');
  const [showPackagingEditor, setShowPackagingEditor] = useState(false);
  const [showCSREditor, setShowCSREditor] = useState(false);
  
  const userName = currentUser?.name || 'Restoran Berkah';

  // Fetch Aggregate Social Impact Data
  React.useEffect(() => {
      if (currentUser?.id) {
          const fetchImpact = async () => {
              setIsLoadingImpact(true);
              try {
                  const data = await db.getSocialImpact(currentUser.id);
                  setSocialImpact(data);
              } catch (e) {
                  console.error("Failed to fetch social impact:", e);
              } finally {
                  setIsLoadingImpact(false);
              }
          };
          fetchImpact();
      }
  }, [currentUser]);

  const handleFinishTour = () => {
      if (onCompleteOnboarding) {
          onCompleteOnboarding();
      }
  };

  React.useEffect(() => {
      if (!pendingProviderTool) return;
      if (pendingProviderTool === 'kitchen') {
          setKitchenInitialTab('scan');
          setShowKitchenScanner(true);
      } else if (pendingProviderTool === 'kitchen-history') {
          setKitchenInitialTab('history');
          setShowKitchenScanner(true);
      } else if (pendingProviderTool === 'csr') {
          setShowCSREditor(true);
      } else if (pendingProviderTool === 'packaging') {
          setShowPackagingEditor(true);
      }
      onClearPendingProviderTool?.();
  }, [pendingProviderTool, onClearPendingProviderTool]);

  const stats = useMemo(() => {
      const myClaims = claimHistory; // ALREADY FILTERED in App.tsx by providerId
      const completedOrders = myClaims.filter(h => h.status?.toLowerCase() === 'completed');
      
      // Hitung Pesanan Masuk (Aktif)
      const activeOrdersCount = myClaims.filter(h => ['PENDING_APPROVAL', 'WAITING_PROVIDER', 'PENDING', 'IN_PROGRESS', 'ACTIVE', 'CLAIMED'].includes(h.status?.toUpperCase() || '')).length;

      // REAL RATING CALCULATION
      const ratedOrders = completedOrders.filter(h => h.rating && h.rating > 0);
      const totalRating = ratedOrders.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      const avgRating = ratedOrders.length > 0 ? parseFloat((totalRating / ratedOrders.length).toFixed(1)) : 5.0;

      const pendingReports = myClaims.filter(h => h.isReported).length;
      
      return {
          totalPoints: socialImpact?.totalPoints || 0,
          totalPotentialPoints: socialImpact?.totalPotentialPoints || 0,
          activeStock: foodItems.length,
          completedOrders: completedOrders.length,
          activeOrders: activeOrdersCount, // NEW
          pendingReports,
          avgRating
      };
  }, [foodItems, claimHistory, userName, socialImpact]);

  const renderContent = () => {
      if (showKitchenScanner) return <KitchenScanner currentUser={currentUser} onBack={() => setShowKitchenScanner(false)} initialTab={kitchenInitialTab} />;
      if (showPackagingEditor) return <EcoPackagingEditor currentUser={currentUser} foodItems={foodItems} onBack={() => setShowPackagingEditor(false)} />;
      if (showCSREditor) return <CSRWriterEditor currentUser={currentUser} foodItems={foodItems} onBack={() => setShowCSREditor(false)} />;

      return (
          <div className="mx-auto max-w-5xl p-6 pb-32 md:max-w-none md:p-0 md:pb-8">
              <header className="mb-8 flex items-start justify-between md:mb-6">
                  <div className="animate-in slide-in-from-left duration-500">
                      <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter leading-none italic uppercase">Dashboard Donatur</h1>
                      <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-2 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-lg w-fit">Integritas Pangan AI</p>
                  </div>
                  
                  <button 
                      onClick={onOpenNotifications} 
                      className="relative rounded-2xl border border-stone-200 bg-white p-3 text-stone-500 shadow-sm transition-all hover:text-orange-600 active:scale-95 group md:hidden dark:border-stone-800 dark:bg-stone-900"
                  >
                      <Bell className="w-6 h-6" />
                      {notifications.filter((n: any) => !n.isRead).length > 0 && (
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-600 border-2 border-white rounded-full animate-pulse"></span>
                      )}
                  </button>
              </header>

              {/* Kitchen AI Promo removed as per user request */}
              
              <DashboardStats 
                  setActiveTab={onNavigate} 
                  stats={stats}
                  userId={String(currentUser?.id || '')}
                  socialSystem={socialSystem}
              />

              <div className="mt-10">
                  <NearbyRequests />
              </div>

              {currentUser?.role === 'corporate_donor' && (
                  <CorporateAIWidgets 
                      currentUser={currentUser} 
                      foodItems={foodItems} 
                      onOpenTool={(tool) => {
                          if (tool === 'recipe') {
                              setKitchenInitialTab('scan');
                              setShowKitchenScanner(true);
                          }
                          if (tool === 'packaging') setShowPackagingEditor(true);
                          if (tool === 'csr') setShowCSREditor(true);
                      }}
                  />
              )}

              {/* AI Tools Section */}
              <div className="mt-10 space-y-4">
                  <div className="flex items-center justify-between px-2">
                      <h2 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest italic">Peralatan AI Kreatif</h2>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Kreativitas Tanpa Batas</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <button 
                          onClick={() => {
                              setKitchenInitialTab('scan');
                              setShowKitchenScanner(true);
                          }}
                          className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] flex flex-col items-center text-center gap-3 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 transition-all group"
                      >
                          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-7 h-7" />
                          </div>
                          <div>
                              <p className="text-xs font-black text-stone-900 dark:text-white uppercase italic tracking-tight">Eksplor Kitchen AI</p>
                              <p className="text-[9px] text-stone-500 font-medium uppercase mt-0.5">Mulai Scan Bahan</p>
                          </div>
                      </button>

                      <button 
                          onClick={() => {
                              setKitchenInitialTab('history');
                              setShowKitchenScanner(true);
                          }}
                          className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] flex flex-col items-center text-center gap-3 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 transition-all group"
                      >
                          <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-orange-600 group-hover:scale-110 transition-transform">
                               <Utensils className="w-7 h-7" />
                          </div>
                          <div>
                              <p className="text-xs font-black text-stone-900 dark:text-white uppercase italic tracking-tight">Riwayat Resep</p>
                              <p className="text-[9px] text-stone-500 font-medium uppercase mt-0.5">Lihat Koleksi Anda</p>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <>
        {currentUser?.isNewUser && (
            <OnboardingTour role={currentUser.role as any} onFinish={handleFinishTour} />
        )}
        
        {renderContent()}
    </>
  );
};
