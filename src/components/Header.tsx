import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Key,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { initialNotifications } from '../data/mockData';
import { NotificationItem, ScreenId } from '../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (screen: ScreenId) => void;
  onToggleMobileSidebar: () => void;
  user: { name: string; email: string };
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onNavigate,
  onToggleMobileSidebar,
  user,
  onLogout,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-[76px] bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Mobile menu toggle + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 bg-[#F8FAFC] hover:bg-slate-100/80 border border-slate-200/80 text-slate-400 hover:text-slate-600 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group shadow-xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
          <span className="text-xs md:text-sm font-medium text-slate-500 truncate">
            Buscar transações, clientes, IDs, e-mails...
          </span>
          <div className="hidden sm:flex items-center ml-auto">
            <kbd className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side: Theme switch, Notifications, Profile */}
      <div className="flex items-center gap-3 md:gap-4 ml-4">
        {/* Theme Toggle matching screenshots */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="relative w-14 h-8 bg-[#07A33E] rounded-full p-1 flex items-center justify-between shadow-xs transition-colors hover:bg-primary-600"
          title="Alternar tema claro/escuro"
        >
          <div className="flex items-center justify-between w-full px-1 text-white text-xs">
            <Sun className="w-3.5 h-3.5 text-white" />
            <Moon className="w-3.5 h-3.5 text-primary-200 opacity-70" />
          </div>
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notificações</h4>
                  {unreadCount > 0 && (
                    <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3 items-start ${
                      !n.read ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !n.read ? 'bg-primary-500 ring-4 ring-primary-100' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:ring-2 group-hover:ring-primary-400 transition-all">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-none">{user.name}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
                {user.email}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* User Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 md:hidden">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  onNavigate('configuracoes');
                  setShowUserDropdown(false);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Meu Perfil</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('configuracoes');
                  setShowUserDropdown(false);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Configurações</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('integracoes');
                  setShowUserDropdown(false);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Chaves de API</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sair da conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
