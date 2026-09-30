import React from 'react';
import {
  Home,
  SlidersHorizontal,
  Layers,
  Wallet,
  Percent,
  ShieldCheck,
  Box,
  Link2,
  RefreshCw,
  Network,
  Landmark,
  FileText,
  Settings,
  ArrowRight,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { HandDrawnCrown } from './icons/CustomIcons';
import { ScreenId } from '../types';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCreateLinkModal?: () => void;
}

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'transacoes', label: 'Transações', icon: SlidersHorizontal },
  // { id: 'recebimentos', label: 'Recebimentos', icon: Layers },
  { id: 'saques', label: 'Saques', icon: Wallet },
  { id: 'taxas', label: 'Taxas', icon: Percent },
  // { id: 'chargebacks', label: 'Chargebacks', icon: ShieldCheck },
  // { id: 'produtos', label: 'Produtos', icon: Box },
  // { id: 'links', label: 'Links de Pagamento', icon: Link2 },
  // { id: 'assinaturas', label: 'Assinaturas', icon: RefreshCw },
  { id: 'adquirentes', label: 'Adquirentes', icon: Landmark },
  { id: 'integracoes', label: 'Integrações', icon: Network },
  // { id: 'relatorios', label: 'Relatórios', icon: FileText },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenCreateLinkModal,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-[260px] h-screen bg-[#080C0A] text-white flex flex-col justify-between border-r border-slate-800/60 rounded-r-[48px] overflow-hidden transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => onNavigate('inicio')}>
            <Logo variant="dark" size="xl" />
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#07A33E] text-white shadow-[0_4px_16px_rgba(7, 163, 62,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Version Footer */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-400">Valen Finance</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
