
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserRole, FoodItem, ClaimHistoryItem, SavedItem, UserData, FAQItem, SocialImpactData, BroadcastMessage, Address } from './types';
import { isFoodExpired } from './utils/transformers';
import { checkAndExpireItems } from './utils/expiryChecker';
import { LoginView } from './view/auth/Login';
import { RegisterView } from './view/auth/Register';
import { ForgotPasswordView } from './view/auth/ForgotPassword';
import { ProviderIndex } from './view/provider';
import { ReceiverIndex } from './view/receiver';
import { VolunteerIndex } from './view/volunteer';
import { AdminIndex } from './view/admin';
import { ProfileIndex } from './view/profile';
import { NotificationsPage } from './view/common/Notifications';
import { InventoryManager } from './view/provider/components/Inventory';
import { ReportsView } from './view/provider/components/Reports';
import { getSocialSystem } from './utils/socialSystem';
import { ReviewsView } from './view/provider/components/Reviews';
import { VerificationPendingModal } from './view/common/VerificationPendingModal'; 
import { VerificationRejectedModal } from './view/common/VerificationRejectedModal';
import { DesktopLayout } from './view/common/DesktopLayout';
import type { SidebarNavAction } from './view/common/sidebarNavConfig';
import { Home, User, Box, Loader2, History } from 'lucide-react';
import { db } from './services/db';
import { MaintenancePage } from './view/common/MaintenancePage';
import { LandingPage } from './view/landing/LandingPage';
import { ToastContainer } from './view/common/ToastContext';
import { toast } from './view/common/ToastContext';
import { DashboardSkeleton } from './view/components/Skeleton';



const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [role, setRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  
  // State for Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State for Profile Initial Tab (Main vs Address vs History)
  const [profileInitialTab, setProfileInitialTab] = useState<'main' | 'address' | 'history' | 'faq'>('main');

  // State for Deep Linking (Redirect to specific order detail)
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  
  // State for History Filter Deep Linking (Reported/Rated)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'rated' | 'reported' | null>(null);

  const [isSubNavOpen, setIsSubNavOpen] = useState(false);
  const [providerPendingTool, setProviderPendingTool] = useState<'kitchen' | 'kitchen-history' | 'csr' | 'packaging' | null>(null);
  const [inventoryOpenAdd, setInventoryOpenAdd] = useState(false);
  const [volunteerTab, setVolunteerTab] = useState<'available' | 'active' | 'history' | 'validation'>('available');
  
  // DATA STATE
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [claimHistory, setClaimHistory] = useState<ClaimHistoryItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [allAddresses, setAllAddresses] = useState<Address[]>([]); 
  
  const [globalUsers, setGlobalUsers] = useState<UserData[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);

  const [globalFAQs, setGlobalFAQs] = useState<FAQItem[]>([
      { id: 'f1', question: 'Apa itu Food AI Rescue?', answer: 'Platform penyelamatan surplus pangan berbasis AI yang menghubungkan bisnis makanan dengan komunitas yang membutuhkan untuk mengurangi pemborosan makanan.', category: 'Umum' },
      { id: 'f2', question: 'Bagaimana cara kerja sistem reputasi (poin)?', answer: 'Sistem reputasi dihitung berdasarkan keaktifan dan integritas Anda:\n- **Donatur:** Mendapat poin dari jumlah makanan yang diselamatkan dan rating ulasan.\n- **Penerima:** Mendapat poin dari ulasan yang diberikan dan ketepatan waktu penukaran.\n- **Relawan:** Mendapat poin dari jarak tempuh dan keberhasilan misi.', category: 'Umum' }
  ]);

  const [appSettings, setAppSettings] = useState<{ 
      appName?: string;
      appSlogan?: string;
      supportPhone?: string;
      disableExpiryLogic: boolean;
      maintenance: boolean;
      disable_signup: boolean;
      readonly_mode: boolean;
      [key: string]: any;
  }>({ 
      appName: 'Food AI Rescue',
      appSlogan: 'Selamatkan Makanan, Selamatkan Bumi',
      supportPhone: '628123456789',
      disableExpiryLogic: false,
      maintenance: false,
      disable_signup: false,
      readonly_mode: false,
      require_otp_verification: true,
      require_admin_verification: false
  });

  // Dynamically update document title based on App Name
  useEffect(() => {
      document.title = appSettings.appName || 'Food AI Rescue';
  }, [appSettings.appName]);


  const [rankLevels, setRankLevels] = useState<any[]>([]);

  // --- SESSION CHECK ON MOUNT ---
  useEffect(() => {
    const checkSession = async () => {
        // Cek Local Storage (Remember Me) atau Session Storage (Sementara)
        const savedSession = localStorage.getItem('far_session') || sessionStorage.getItem('far_session');
        
        if (savedSession) {
            try {
                const parsedUser = JSON.parse(savedSession);
                setRole(parsedUser.role);
                setCurrentUser(parsedUser);
                setCurrentView('dashboard');

                // RE-FETCH FRESH DATA (Check for status updates like ACTIVE)
                const freshUser = await db.getUser(parsedUser.id);
                if (freshUser) {
                    setCurrentUser(freshUser);
                    setRole(freshUser.role);
                    // Update session storage with fresh data
                    const freshSession = JSON.stringify(freshUser);
                    if (localStorage.getItem('far_session')) localStorage.setItem('far_session', freshSession);
                    else sessionStorage.setItem('far_session', freshSession);
                }
            } catch (e) {
                console.error("Session re-verification error", e);
                // Only clear on parse error, not network error
                if (e instanceof SyntaxError) {
                    localStorage.removeItem('far_session');
                    sessionStorage.removeItem('far_session');
                }
            }
        }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'verify') {
      setCurrentView('register');
    }
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Compute social system dynamically
  const socialSystem = useMemo(() => getSocialSystem(rankLevels), [rankLevels]);

    const fetchData = useCallback(async (forceRefresh: boolean = false) => {
        if (!role || !currentUser) return; 
        
        // --- REAL-TIME NOTIFICATIONS (NO CACHE) ---
        db.getNotifications(currentUser.id, role).then(notifData => {
            if (notifData) setUserNotifications(notifData);
        }).catch(err => console.error("Real-time Notification Fetch Error:", err));

        db.getRankLevels().then(levels => setRankLevels(levels)).catch(e => console.error(e));


        setIsGlobalLoading(true);
        try {
            const providerIdFilter = (role === 'individual_donor' || role === 'corporate_donor') ? currentUser.id : undefined;
            const claimsFilters = (role === 'individual_donor' || role === 'corporate_donor') 
                ? { providerId: currentUser.id } 
                : (role === 'recipient' ? { receiverId: currentUser.id } : {});

            console.log("Fetching Data with Filters:", { providerIdFilter, claimsFilters });

            // Execute requests sequentially to prevent Vercel Serverless cold-start connection pool exhaustion
            const settingsData = await db.getSettings();
            const latestUser = currentUser?.id ? await db.getUser(currentUser.id) : null;
            const faqData = await db.getFAQs();
            const inventoryData = await db.getInventory(providerIdFilter);
            const claimsData = await db.getClaims(claimsFilters);

            if (settingsData) {
                const normalizedSettings = {
                    ...settingsData,
                    disableExpiryLogic: settingsData.disableExpiryLogic || settingsData.disable_expiry_logic || false
                };
                setAppSettings(normalizedSettings);
            }
            if (inventoryData) {
                const isBypass = settingsData?.disableExpiryLogic || settingsData?.disable_expiry_logic;
                const rawItems = Array.isArray(inventoryData) ? inventoryData : [];
                const processed = isBypass 
                    ? rawItems 
                    : await checkAndExpireItems(rawItems);
                setFoodItems(processed);
            }
            if (faqData) setGlobalFAQs(faqData);
            
            // Sync current user status if changed (e.g. Activated by Admin)
            if (latestUser && currentUser) {
                const hasStatusChanged = latestUser.status?.toLowerCase() !== currentUser.status?.toLowerCase();
                if (hasStatusChanged) {
                    const updatedUser = { ...currentUser, status: latestUser.status.toLowerCase() };
                    setCurrentUser(updatedUser);
                    console.log("[AUTH] User status updated via refresh:", updatedUser.status);
                    
                    // Update persistence
                    if (localStorage.getItem('far_session')) {
                        localStorage.setItem('far_session', JSON.stringify(updatedUser));
                    } else if (sessionStorage.getItem('far_session')) {
                        sessionStorage.setItem('far_session', JSON.stringify(updatedUser));
                    }
                }
            }

            let finalClaims = claimsData || [];
            if (role === 'recipient' && claimsData) {
                finalClaims = claimsData.filter(c => c.receiverId === currentUser?.id);
            }
            setClaimHistory(finalClaims);



            if (role === 'volunteer') {
                const allAddrs = await db.getAddresses();
                setAllAddresses(allAddrs);
            } 

            if (role === 'admin' || role === 'super_admin' || role === 'volunteer') {
                const users = await db.getUsers();
                setGlobalUsers(users);
            }
            
        } catch (error) {
            console.error("Failed to load initial data:", error);
        } finally {
            setIsGlobalLoading(false);
        }
  }, [role, currentUser]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]); 

  const profileStats = useMemo(() => {
    const completedHistory = claimHistory.filter(c => c.status === 'completed');
    const activeHistory = claimHistory.filter(c => c.status === 'active');

    if (role === 'individual_donor' || role === 'corporate_donor') {
        const ratingSum = completedHistory.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const avgRating = completedHistory.length ? (ratingSum / completedHistory.length).toFixed(1) : '5.0';
        
        const pointsFromHistory = completedHistory.reduce((acc, curr) => acc + (curr.socialImpact?.totalPoints || 0), 0);
        
        return {
            label1: 'Donasi', value1: foodItems.length + completedHistory.length,
            label2: 'Rating', value2: parseFloat(avgRating),
            label3: 'Poin', value3: pointsFromHistory + (currentUser?.points || 0)
        };
    } 
    else if (role === 'volunteer') {
        if (!currentUser || !currentUser.id) {
             return { label1: 'Misi', value1: 0, label2: 'Jam', value2: 0, label3: 'Poin', value3: 0 };
        }

        const myCompletedMissions = completedHistory.filter(c => 
            c.deliveryMethod !== 'pickup' && 
            (
                (c.volunteerId && String(c.volunteerId) === String(currentUser.id)) || 
                (c.courierName && c.courierName === currentUser.name)
            )
        );
        
        const missionsCount = myCompletedMissions.length;
        const basePoints = currentUser.points || 0;
        
        const estimatedHours = missionsCount > 0 ? Math.ceil(missionsCount * 0.8) : 0;

        return {
            label1: 'Misi', value1: missionsCount,
            label2: 'Jam', value2: estimatedHours, 
            label3: 'Poin', value3: (missionsCount * 150) + basePoints
        };
    } 
    else { 
        const claims = completedHistory.length + activeHistory.length;
        const basePoints = currentUser?.points || 0;
        return {
            label1: 'Klaim', value1: claims,
            label2: 'Disimpan', value2: savedItems.length,
            label3: 'Poin', value3: (claims * 10) + basePoints
        };
    }
  }, [role, claimHistory, foodItems, savedItems, currentUser]);

  const handleLogin = (data: Partial<UserData> & { role: UserRole; email?: string }, remember: boolean = false) => {
      setRole(data.role);
      
      let finalName = data.name;
      if (!finalName) {
          finalName = (data.role === 'individual_donor' || data.role === 'corporate_donor') ? 'Restoran Berkah' : 
                      data.role === 'volunteer' ? 'Budi Santoso' : 
                      (data.role === 'admin' || data.role === 'super_admin') ? 'Admin Manager' : 
                      'Siti Aminah';
      }

      const userObject: UserData = {
          id: data.id || '1',
          name: finalName,
          email: data.email || 'user@foodairescue.com',
          role: data.role || 'recipient',
          status: (data.status as any) || 'active',
          points: data.points !== undefined ? data.points : 0, 
          joinDate: data.joinDate || '2025-01-01',
          phone: data.phone || '08123456789',
          address: data.address || '',
          avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=random`,
          isNewUser: data.isNewUser // Capture isNewUser from login/register response
      };

      setCurrentUser(userObject);
      
      // PERSIST SESSION
      const sessionString = JSON.stringify(userObject);
      if (remember) {
          localStorage.setItem('far_session', sessionString);
      } else {
          sessionStorage.setItem('far_session', sessionString);
      }

      setCurrentView('dashboard');
  };

  const handleRegister = (formData: any, remember: boolean = false) => {
      // Auto Login after register
      handleLogin(formData, remember);
  };

  const handleUpdateUser = (data: UserData) => {
      setCurrentUser(data);
      // Update session storage if exists
      if (localStorage.getItem('far_session')) {
          localStorage.setItem('far_session', JSON.stringify(data));
      } else if (sessionStorage.getItem('far_session')) {
          sessionStorage.setItem('far_session', JSON.stringify(data));
      }
  };

  const handleEditAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && currentUser) {
          setIsGlobalLoading(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              try {
                  const url = await db.uploadImage(base64, `avatar_${currentUser.id}_${Date.now()}.jpg`, 'profiles');
                  const updatedUser = { ...currentUser, avatar: url };
                  await db.upsertUser(updatedUser);
                  handleUpdateUser(updatedUser);
                  toast.success("Foto profil berhasil diperbarui!");
              } catch (error) {
                  console.error("Avatar upload failed", error);
                  toast.error("Gagal mengunggah foto profil. Periksa koneksi.");
              } finally {
                  setIsGlobalLoading(false);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleLogout = async () => {
      // Panggil backend untuk kill session (menutup connection pool di sisi Vercel instance)
      try {
          if (currentUser?.id) {
              await fetch('/api', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'LOGOUT_USER', data: { userId: currentUser.id } })
              });
          }
      } catch (e) {
          console.warn("Gagal kill session backend:", e);
      }

      // Clear Sessions
      localStorage.removeItem('far_session');
      sessionStorage.removeItem('far_session');

      setRole(null);
      setCurrentUser(null);
      setCurrentView('login');
      setFoodItems([]);
      setClaimHistory([]);
      setGlobalUsers([]); 
  };

  // UPDATE user status after tour completion
  const handleCompleteTour = async () => {
      if (!currentUser) return;
      
      // 1. Optimistic Update Local State
      const updatedUser = { ...currentUser, isNewUser: false };
      setCurrentUser(updatedUser);
      
      // Update session storage as well to keep state consistent on refresh
      const sessionKey = localStorage.getItem('far_session') ? 'far_session' : 'far_session'; // Check where it is stored
      if (localStorage.getItem('far_session')) localStorage.setItem('far_session', JSON.stringify(updatedUser));
      else sessionStorage.setItem('far_session', JSON.stringify(updatedUser));

      // 2. Persist to DB (Send false, backend handles 0 conversion)
      try {
          await db.upsertUser(updatedUser);
          console.log("User tour status updated.");
      } catch (error) {
          console.error("Failed to update user tour status:", error);
      }
  };

  const handleAcceptMission = (claimId: string, volunteerName: string) => {
      const generatedPickupCode = `PICKUP-${Math.floor(1000 + Math.random() * 9000)}`;
      
      setClaimHistory(prev => prev.map(c => 
          c.id === claimId 
            ? { ...c, status: 'get_provider' as any, courierName: volunteerName, courierStatus: 'picking_up', volunteerId: currentUser?.id, pickupCode: generatedPickupCode } 
            : c
      ));

      db.updateClaimStatus(claimId, 'get_provider', { 
          courierName: volunteerName, 
          courierStatus: 'picking_up',
          volunteerId: currentUser?.id,
          pickupCode: generatedPickupCode
      });
  };

  const handleCancelMission = async (claimId: string) => {
      if (!currentUser?.id) return;
      try {
          await db.cancelMission(claimId, currentUser.id);
          setClaimHistory(prev => prev.map(c => 
              c.id === claimId 
                  ? { ...c, courierName: undefined, courierStatus: undefined, volunteerId: undefined, pickupCode: undefined, status: 'pending_approval' } 
                  : c
          ));
          toast.success("Misi berhasil dibatalkan.");
      } catch (error: any) {
          console.error("Failed to cancel mission:", error);
          toast.info(error.message || "Gagal membatalkan misi. Coba lagi.");
      }
  };

  const handleUpdateStatus = async (claimId: string, newStatus: string, extraData?: any) => {
      let generatedCode: string | undefined;

      setClaimHistory(prev => prev.map(c => {
          if (c.id === claimId) {
              const updated = { ...c, status: newStatus as any, ...extraData };
              if (extraData && extraData.isScanned) {
                  updated.isScanned = true;
              }
              if (newStatus === 'completed') {
                  updated.isScanned = true; 
                  if (c.deliveryMethod !== 'pickup') {
                      updated.courierStatus = 'completed';
                  }
              }
              // Generate code for in_progress (pickup) or waiting_provider (delivery)
              if ((newStatus === 'in_progress' || newStatus === 'waiting_provider' || newStatus === 'active') && (!updated.uniqueCode || updated.uniqueCode === 'PENDING')) {
                  generatedCode = `FAR-${Math.floor(1000 + Math.random() * 9000)}`;
                  updated.uniqueCode = generatedCode;
              }
              return updated;
          }
          return c;
      }));

      try {
          const payload = { ...extraData };
          if (newStatus === 'completed') {
              payload.isScanned = true;
              payload.courierStatus = 'completed'; 
          }
          if (generatedCode) {
              payload.uniqueCode = generatedCode;
          }
          await db.updateClaimStatus(claimId, newStatus, payload);
          

      } catch (error) {
          console.error("Failed to update status in DB:", error);
          toast.error("Gagal menyimpan status ke server. Coba lagi.");
      }
  };

  const handleClaimFood = async (item: FoodItem, quantityStr: string, method: 'pickup' | 'delivery'): Promise<string | null> => {
      const isAlreadyClaimed = claimHistory.some(c => 
          c.status === 'active' && 
          c.foodName === item.name && 
          c.providerName === item.providerName
      );

      if (isAlreadyClaimed) {
          toast.info("Anda sudah memiliki klaim aktif untuk produk ini. Selesaikan dulu pesanan tersebut sebelum mengambil lagi.");
          return null;
      }

      const quantityNum = parseInt(quantityStr.replace(/\D/g, '')) || 1;
      
      let proportionalImpact: SocialImpactData | undefined;
      if (item.socialImpact) {
          const ratio = quantityNum / item.initialQuantity;
          proportionalImpact = {
              ...item.socialImpact,
              totalPoints: Math.round(item.socialImpact.totalPoints * ratio),
              co2Saved: parseFloat((item.socialImpact.co2Saved * ratio).toFixed(2)),
              waterSaved: Math.round(item.socialImpact.waterSaved * ratio),
              landSaved: parseFloat((item.socialImpact.landSaved * ratio).toFixed(2)),
              wasteReduction: parseFloat((item.socialImpact.wasteReduction * ratio).toFixed(2))
          };
      }

      const newClaim: ClaimHistoryItem = {
          id: `CLM-${Date.now()}`,
          foodId: item.id, 
          providerId: item.providerId, 
          receiverId: currentUser?.id, 
          providerName: item.providerName,
          foodName: item.name,
          date: new Date().toISOString(),
          status: 'pending_approval',
          isScanned: false,
          imageUrl: item.imageUrl,
          uniqueCode: 'PENDING', 
          claimedQuantity: quantityStr,
          deliveryMethod: method, 
          location: item.location,
          distributionHours: { start: '18:00', end: '21:00' },
          description: item.description,
          socialImpact: proportionalImpact 
      };

      try {
          await db.processClaimTransaction(item.id, quantityNum, newClaim);
          const updatedInventory = await db.getInventory();
          const updatedClaims = await db.getClaims({ receiverId: currentUser?.id }); 
          
          setFoodItems(updatedInventory);
          
          if (updatedClaims) {
              setClaimHistory(updatedClaims);
          }
          

          
          return 'PENDING';

      } catch (error: any) {
          console.error("Claim Transaction Failed:", error);
          toast.error(`Gagal melakukan klaim: ${error.message}`);
          return null;
      }
  };

  const handleSubmitReview = async (claimId: string, rating: number, comment: string, media: string[]) => {
      try {
          await db.submitReview(claimId, rating, comment, media);
          setClaimHistory(prev => prev.map(c => 
              c.id === claimId ? { ...c, rating, review: comment, reviewMedia: media } : c
          ));
      } catch (error) {
          console.error("Failed to submit review:", error);
          toast.error("Gagal mengirim ulasan ke database. Coba lagi.");
      }
  };

  const handleSubmitReport = async (claimId: string, reason: string, description: string, evidence: string[]) => {
      try {
          await db.submitReport(claimId, reason, description, evidence);
          const evidenceStr = JSON.stringify(evidence);
          setClaimHistory(prev => prev.map(c => 
              c.id === claimId ? { ...c, isReported: true, reportReason: reason, reportDescription: description, reportEvidence: evidenceStr } : c
          ));
      } catch (error) {
          console.error("Failed to submit report:", error);
          toast.error("Gagal mengirim laporan ke database. Coba lagi.");
      }
  };

  const handleSidebarAction = useCallback((action: SidebarNavAction) => {
      if (action.kind === 'provider') {
          if (action.tool === 'add-donation' || action.tool === 'audit') {
              setCurrentView('inventory');
              setInventoryOpenAdd(action.tool === 'add-donation');
              return;
          }
          setCurrentView('dashboard');
          if (action.tool === 'kitchen') setProviderPendingTool('kitchen');
          else if (action.tool === 'kitchen-history') setProviderPendingTool('kitchen-history');
          else if (action.tool === 'csr') setProviderPendingTool('csr');
          else if (action.tool === 'packaging') setProviderPendingTool('packaging');
          return;
      }
      if (action.kind === 'volunteer') {
          setCurrentView('dashboard');
          setVolunteerTab(action.tab);
          return;
      }
      if (action.kind === 'footer') {
          setProfileInitialTab(action.target === 'support' ? 'faq' : 'main');
          setCurrentView('profile');
      }
  }, []);

  const volunteerActiveMission = useMemo(() => {
      if (role !== 'volunteer' || !currentUser?.name) return null;
      const active = claimHistory.find(
          (c) => c.volunteerName === currentUser.name && ['ACTIVE', 'IN_PROGRESS', 'CLAIMED'].includes(c.status?.toUpperCase() || '')
      );
      return active ? `#${String(active.id).slice(-4)}` : null;
  }, [role, currentUser?.name, claimHistory]);

  const handleProviderNavigation = (view: string) => {
      if (view === 'inventory-reported') {
          setCurrentView('reports'); 
      } else if (view === 'inventory-rated') {
          setCurrentView('reviews'); 
      } else if (view === 'inventory-orders' || view === 'inventory-history') {
          setHistoryFilter(null);
          setCurrentView(view);
      } else {
          setHistoryFilter(null);
          setCurrentView(view);
      }
  };

  const renderContent = () => {
      if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
      if (currentView === 'login') return <LoginView onLogin={handleLogin} onNavigate={setCurrentView as any} />;
      if (currentView === 'register') return <RegisterView onNavigate={setCurrentView as any} onRegister={handleRegister} disableSignup={appSettings.disable_signup} requireOtpVerification={appSettings.require_otp_verification} />;
      if (currentView === 'forgot-password') return <ForgotPasswordView onNavigate={setCurrentView as any} />;
      
      // CHECK ACCOUNT STATUS HERE
      if (currentUser && role !== 'admin' && role !== 'super_admin') {
          // Intercept for Maintenance Mode (only bypass if logged in as admin)
          if (appSettings?.maintenance && role !== 'admin' && role !== 'super_admin') {
              return <MaintenancePage appSettings={appSettings} />;
          }

          if (currentUser.status?.toUpperCase() === 'SUSPENDED') {
              return <VerificationRejectedModal onLogout={handleLogout} userName={currentUser.name} />;
          }
          if (currentUser.status?.toUpperCase() === 'PENDING') {
              return <VerificationPendingModal onLogout={handleLogout} onRefresh={() => fetchData(true)} userName={currentUser.name} />;
          }
      }


      if (isGlobalLoading && !foodItems.length && role !== 'recipient' && role !== 'volunteer') {
          return (
              <div className="flex justify-center min-h-[80vh] w-full pt-8">
                  <DashboardSkeleton />
              </div>
          );
      }

      if (currentView === 'notifications') return (
        <NotificationsPage 
          role={role} 
          onBack={() => setCurrentView('dashboard')} 
          userName={currentUser?.name}
          notifications={userNotifications}
          currentUserId={currentUser?.id} 
          onRefresh={() => fetchData(true)}
        />
      );
      
      if (currentView === 'profile') return (
          <ProfileIndex 
            role={role!} 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme}
            onNavigate={setCurrentView} 
            initialView={profileInitialTab as any} 
            savedItems={savedItems}
            setSavedItems={setSavedItems}
            claimHistory={claimHistory}
            setClaimHistory={setClaimHistory}
            availableFoodForDetail={foodItems}
            onClaim={(item, qty) => handleClaimFood(item, qty, 'pickup')} 
            globalFAQs={globalFAQs} 
            stats={profileStats}
            onSubmitReview={handleSubmitReview} 
            onSubmitReport={handleSubmitReport} 
            onRefresh={() => fetchData(true)} 
            allAddresses={allAddresses}
            onUpdateUser={handleUpdateUser}
            onEditAvatar={handleEditAvatar}
            socialSystem={socialSystem}
          />
      );

      if (role === 'individual_donor' || role === 'corporate_donor') {
          if (currentView === 'inventory' || currentView === 'inventory-orders' || currentView === 'inventory-history') return (
            <InventoryManager 
                foodItems={foodItems} 
                setFoodItems={setFoodItems} 
                claimHistory={claimHistory} 
                setClaimHistory={setClaimHistory}
                targetOrderId={targetOrderId}
                clearTargetOrder={() => setTargetOrderId(null)}
                initialFilter={historyFilter} 
                onUpdateStatus={handleUpdateStatus} 
                currentUser={currentUser}
                onRefresh={() => fetchData(true)}
                initialView={currentView === 'inventory-orders' ? 'orders' : currentView === 'inventory-history' ? 'history' : 'stock'}
                onNavigate={(view) => {
                    if (view === 'profile-address') {
                        setProfileInitialTab('address');
                        setCurrentView('profile');
                    } else {
                        setCurrentView(view);
                    }
                }} 
                isReadOnly={appSettings.readonly_mode}
                disableExpiryLogic={appSettings.disableExpiryLogic}
                openAddForm={inventoryOpenAdd}
                onAddFormOpened={() => setInventoryOpenAdd(false)}
            />
          );


          if (currentView === 'reports') return (
              <div className="mx-auto max-w-5xl p-6 pb-32 md:max-w-none md:p-0 md:pb-8">
                  <div className="mb-6 flex items-center gap-4">
                      <button onClick={() => setCurrentView('dashboard')} className="rounded-full p-2 hover:bg-stone-100 md:hidden">
                          <Box className="h-5 w-5 text-stone-500" />
                      </button>
                      <h1 className="text-2xl font-black uppercase italic">Pusat Masalah</h1>
                  </div>
                  <ReportsView 
                    onNavigateToOrder={(orderId) => { setTargetOrderId(orderId); setCurrentView('inventory-history'); }} 
                    claims={claimHistory} 
                  />
              </div>
          );

          if (currentView === 'reviews') return (
              <div className="mx-auto max-w-5xl p-6 pb-32 md:max-w-none md:p-0 md:pb-8">
                  <div className="mb-6 flex items-center gap-4">
                      <button onClick={() => setCurrentView('dashboard')} className="rounded-full p-2 hover:bg-stone-100 md:hidden">
                          <Box className="h-5 w-5 text-stone-500" />
                      </button>
                      <h1 className="text-2xl font-black uppercase italic">Ulasan Diterima</h1>
                  </div>
                  <ReviewsView 
                    onNavigateToOrder={(orderId) => { setTargetOrderId(orderId); setCurrentView('inventory-history'); }} 
                    claims={claimHistory}
                  />
              </div>
          );
          
          return (
            <ProviderIndex 
                onOpenNotifications={() => setCurrentView('notifications')} 
                onNavigate={handleProviderNavigation} 
                isSubNavOpen={isSubNavOpen} 
                onToggleSubNav={() => setIsSubNavOpen(!isSubNavOpen)}
                foodItems={foodItems}
                claimHistory={claimHistory}
                currentUser={currentUser}
                onCompleteOnboarding={handleCompleteTour} 
                notifications={userNotifications}
                onRefresh={() => fetchData(true)}
                socialSystem={socialSystem}
                disableExpiryLogic={appSettings?.disableExpiryLogic}
                pendingProviderTool={providerPendingTool}
                onClearPendingProviderTool={() => setProviderPendingTool(null)}
            />
          );
      }

      if (role?.toLowerCase() === 'recipient') {
          // Filter out expired items for receivers, unless disabled by admin
          const isBypassActive = appSettings?.disableExpiryLogic || (appSettings as any)?.disable_expiry_logic;
          
          const activeFoodItems = isBypassActive 
              ? foodItems.filter(item => (item.currentQuantity ?? 0) > 0 && item.status?.toLowerCase() !== 'completed' && item.status?.toLowerCase() !== 'claimed')
              : foodItems.filter(item => (item.status?.toLowerCase() === 'available' || !item.status) && !isFoodExpired(item.distributionEnd, item.expiryTime));
          
          return (
            <ReceiverIndex 
                onOpenNotifications={() => setCurrentView('notifications')} 
                onNavigateToHistory={() => { setProfileInitialTab('history'); setCurrentView('profile'); }}
                foodItems={activeFoodItems}
                savedItems={savedItems}
                disableExpiryLogic={appSettings.disableExpiryLogic}
                isReadOnly={appSettings.readonly_mode}

                onToggleSave={(item) => {
                    if (savedItems.some(s => s.id === item.id)) {
                        setSavedItems(savedItems.filter(s => s.id !== item.id));
                    } else {
                        setSavedItems([...savedItems, { id: item.id, name: item.name, provider: item.providerName, image: item.imageUrl, status: 'available' }]);
                    }
                }}
                onClaim={handleClaimFood} 
                claimHistory={claimHistory} 
                currentUser={currentUser} 
                isLoading={isGlobalLoading} 
                onRefresh={() => fetchData(true)} 
                notifications={userNotifications}
                socialSystem={socialSystem}
            />
          );
      }

      if (role === 'volunteer') {
          return (
            <VolunteerIndex 
                onOpenNotifications={() => setCurrentView('notifications')} 
                activeClaims={claimHistory}
                onAcceptMission={handleAcceptMission}
                onCancelMission={handleCancelMission}
                onUpdateStatus={handleUpdateStatus} 
                currentUser={currentUser}
                allAddresses={allAddresses} 
                isLoading={isGlobalLoading} 
                onRefresh={() => fetchData(true)} 
                globalUsers={globalUsers}
                inventory={foodItems}
                notifications={userNotifications}
                socialSystem={socialSystem}
                initialTab={volunteerTab}
                onTabChange={setVolunteerTab}
            />
          );
      }

      if (role === 'admin' || role === 'super_admin') {
          return (
            <AdminIndex 
                role={role} 
                onLogout={handleLogout} 
                currentUser={currentUser} 
                globalUsers={globalUsers} 
                setGlobalUsers={setGlobalUsers} 
                globalInventory={foodItems}
                globalClaims={claimHistory}
                globalFAQs={globalFAQs} 
                setGlobalFAQs={setGlobalFAQs} 
                broadcastMessages={userNotifications.filter(n => String(n.id).includes('broadcast'))}
                setBroadcastMessages={setUserNotifications as any}
                allAddresses={allAddresses}
                socialSystem={socialSystem}
                appSettings={appSettings}
                setAppSettings={setAppSettings}
                onRefresh={() => fetchData(true)}
            />
          );
      }

      return <div>Unknown Role</div>;
  };

  const showNavigation = role && !['login', 'register', 'forgot-password', 'landing'].includes(currentView) && !role.includes('admin') && currentUser?.status?.toUpperCase() === 'ACTIVE';
  const showBottomNav = showNavigation;

  const bottomNav = showBottomNav ? (
    <nav className="safe-area-bottom sticky bottom-0 left-0 right-0 z-50 flex justify-around border-t border-stone-200 bg-white/95 py-3.5 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 md:hidden">
      <button
        onClick={() => { setProfileInitialTab('main'); setCurrentView('dashboard'); }}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'dashboard' ? 'text-orange-600' : 'text-stone-400'}`}
      >
        <Home className={`h-5 w-5 ${currentView === 'dashboard' ? 'fill-orange-600/10' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
      </button>

      {(role === 'individual_donor' || role === 'corporate_donor') && (
        <>
          <button
            onClick={() => { setHistoryFilter(null); setCurrentView('inventory'); }}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'inventory' ? 'text-orange-600' : 'text-stone-400'}`}
          >
            <Box className={`h-5 w-5 ${currentView === 'inventory' ? 'fill-orange-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Stok</span>
          </button>
          <button
            onClick={() => { setHistoryFilter(null); setCurrentView('inventory-orders'); }}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'inventory-orders' ? 'text-orange-600' : 'text-stone-400'}`}
          >
            <Box className={`h-5 w-5 ${currentView === 'inventory-orders' ? 'fill-orange-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pesanan</span>
          </button>
          <button
            onClick={() => { setHistoryFilter(null); setCurrentView('inventory-history'); }}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'inventory-history' ? 'text-orange-600' : 'text-stone-400'}`}
          >
            <History className={`h-5 w-5 ${currentView === 'inventory-history' ? 'fill-orange-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Riwayat</span>
          </button>
        </>
      )}

      {role === 'recipient' && (
        <button
          onClick={() => { setProfileInitialTab('history'); setCurrentView('profile'); }}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'profile' && profileInitialTab === 'history' ? 'text-orange-600' : 'text-stone-400'}`}
        >
          <History className={`h-5 w-5 ${currentView === 'profile' && profileInitialTab === 'history' ? 'fill-orange-600/10' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Riwayat</span>
        </button>
      )}

      <button
        onClick={() => { setProfileInitialTab('main'); setCurrentView('profile'); }}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'profile' && profileInitialTab !== 'history' ? 'text-orange-600' : 'text-stone-400'}`}
      >
        <User className={`h-5 w-5 ${currentView === 'profile' && profileInitialTab !== 'history' ? 'fill-orange-600/10' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Profil</span>
      </button>
    </nav>
  ) : null;

  const mainContent = (
    <div key={currentView} className="animate-view-enter">
      {renderContent()}
    </div>
  );

  if (showNavigation) {
    return (
      <>
      <DesktopLayout
        currentView={currentView}
        setCurrentView={setCurrentView}
        profileInitialTab={profileInitialTab}
        setProfileInitialTab={setProfileInitialTab as (tab: string) => void}
        role={role}
        currentUser={currentUser}
        onLogout={handleLogout}
        notificationsCount={userNotifications.filter((n) => !n.isRead).length}
        appSettings={appSettings}
        onSidebarAction={handleSidebarAction}
        volunteerTab={volunteerTab}
        sidebarContext={
          volunteerActiveMission ? (
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Misi Aktif: {volunteerActiveMission}
              </p>
            </div>
          ) : undefined
        }
        bottomNav={bottomNav}
      >
        {mainContent}
      </DesktopLayout>
      <ToastContainer />
      </>
    );
  }

  return (
    <>
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] font-sans text-stone-900 dark:bg-stone-950 dark:text-white">
      <main className="flex-1">{mainContent}</main>
    </div>
    <ToastContainer />
    </>
  );
};

export default App;
