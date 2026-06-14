import {
  Home,
  Box,
  History,
  User,
  Bell,
  Sparkles,
  Settings,
  HelpCircle,
  Compass,
  ClipboardCheck,
  BookOpen,
  Truck,
  Camera,
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';

export type SidebarNavAction =
  | { kind: 'view'; view: string; profileTab?: 'main' | 'history' | 'address' | 'faq' }
  | { kind: 'provider'; tool: 'kitchen' | 'kitchen-history' | 'add-donation' | 'audit' | 'csr' | 'packaging' }
  | { kind: 'volunteer'; tab: 'available' | 'active' | 'history' | 'validation' }
  | { kind: 'footer'; target: 'settings' | 'support' };

export interface SidebarNavItemDef {
  id: string;
  label: string;
  icon: LucideIcon;
  action: SidebarNavAction;
  showBadge?: boolean;
}

export interface SidebarRoleConfig {
  portalLabel: string;
  cta?: {
    label: string;
    action: SidebarNavAction;
  };
  items: SidebarNavItemDef[];
}

const donorBaseItems: SidebarNavItemDef[] = [
  { id: 'dashboard', label: 'Impact Dashboard', icon: LayoutDashboard, action: { kind: 'view', view: 'dashboard' } },
  { id: 'inventory-stock', label: 'Stok Makanan', icon: Box, action: { kind: 'view', view: 'inventory' } },
  { id: 'inventory-orders', label: 'Pesanan Masuk', icon: ShoppingBag, action: { kind: 'view', view: 'inventory-orders' } },
  { id: 'inventory-history', label: 'Riwayat Pemesanan', icon: History, action: { kind: 'view', view: 'inventory-history' } },
];

export const SIDEBAR_CONFIG: Record<string, SidebarRoleConfig> = {
  individual_donor: {
    portalLabel: 'Donor Portal',
    cta: { label: 'Donasi Baru', action: { kind: 'provider', tool: 'add-donation' } },
    items: donorBaseItems,
  },
  corporate_donor: {
    portalLabel: 'Corporate Donor Portal',
    cta: { label: 'Donasi Baru', action: { kind: 'provider', tool: 'add-donation' } },
    items: donorBaseItems,
  },
  recipient: {
    portalLabel: 'Recipient Portal',
    items: [
      { id: 'dashboard', label: 'Home', icon: Home, action: { kind: 'view', view: 'dashboard' } },
      { id: 'history', label: 'Riwayat Klaim', icon: History, action: { kind: 'view', view: 'profile', profileTab: 'history' } },
      { id: 'notifications', label: 'Notifikasi', icon: Bell, action: { kind: 'view', view: 'notifications' }, showBadge: true },
      { id: 'profile', label: 'Profil Saya', icon: User, action: { kind: 'view', view: 'profile', profileTab: 'main' } },
    ],
  },
  volunteer: {
    portalLabel: 'Volunteer Portal',
    cta: { label: 'Misi Baru', action: { kind: 'volunteer', tab: 'available' } },
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: { kind: 'view', view: 'dashboard' } },
      { id: 'notifications', label: 'Notifikasi', icon: Bell, action: { kind: 'view', view: 'notifications' }, showBadge: true },
      { id: 'profile', label: 'Profil Saya', icon: User, action: { kind: 'view', view: 'profile', profileTab: 'main' } },
    ],
  },
};

export const SIDEBAR_FOOTER: { id: string; label: string; icon: LucideIcon; action: SidebarNavAction }[] = [];

export function getSidebarConfig(role: string | null): SidebarRoleConfig | null {
  if (!role || role.includes('admin')) return null;
  return SIDEBAR_CONFIG[role] ?? null;
}

export function isSidebarItemActive(
  item: SidebarNavItemDef,
  currentView: string,
  profileInitialTab: string,
  volunteerTab?: string
): boolean {
  const { action } = item;
  if (action.kind === 'view') {
    if (action.view === 'profile') {
      return currentView === 'profile' && profileInitialTab === (action.profileTab || 'main');
    }
    if (action.view === 'dashboard' && item.id === 'explore') {
      return currentView === 'dashboard';
    }
    if (action.view === 'dashboard' && item.id === 'dashboard') {
      return currentView === 'dashboard';
    }
    return currentView === action.view;
  }
  if (action.kind === 'volunteer') {
    return currentView === 'dashboard' && volunteerTab === action.tab;
  }
  if (action.kind === 'provider') {
    if (action.tool === 'add-donation' || action.tool === 'audit') {
      return currentView === 'inventory';
    }
    if (action.tool === 'kitchen' || action.tool === 'kitchen-history' || action.tool === 'csr' || action.tool === 'packaging') {
      return currentView === 'dashboard';
    }
  }
  return false;
}
