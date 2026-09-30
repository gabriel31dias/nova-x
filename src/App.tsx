import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';

// Modals & Drawers
import { WithdrawModal } from './components/modals/WithdrawModal';
import { TransactionDrawer } from './components/modals/TransactionDrawer';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { CreatePaymentLinkModal } from './components/modals/CreatePaymentLinkModal';
import { RefundModal } from './components/modals/RefundModal';
import { ReceiptModal } from './components/modals/ReceiptModal';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { WithdrawalsScreen } from './screens/WithdrawalsScreen';
import { FeesScreen } from './screens/FeesScreen';
import { ReceivablesScreen } from './screens/ReceivablesScreen';
import { ChargebacksScreen } from './screens/ChargebacksScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { PaymentLinksScreen } from './screens/PaymentLinksScreen';
import { SubscriptionsScreen } from './screens/SubscriptionsScreen';
import { IntegrationsScreen } from './screens/IntegrationsScreen';
import { AcquirersScreen } from './screens/AcquirersScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AuthScreen, AuthUser } from './screens/AuthScreen';
import { getToken, clearToken, api } from './lib/api';

// Data & Types
import {
  initialTransactions,
  initialPaymentLinks,
} from './data/mockData';
import { ScreenId, Transaction, PaymentLink } from './types';

export function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      return getToken() ? JSON.parse(localStorage.getItem('bc_user') || 'null') : null;
    } catch {
      return null;
    }
  });

  // ponytail: the API doc lists no logout endpoint, so the token is only dropped client-side.
  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('bc_user');
    setUser(null);
  };

  // Drop a stored session the API no longer accepts (expired/revoked token or 2FA pending).
  useEffect(() => {
    if (!user) return;
    api('/user/is-admin', { token: getToken() }).catch(() => {}); // api() logs out on 401/2FA_REQUIRED
  }, [user]);

  const getInitialScreen = (): ScreenId => {
    const hash = window.location.hash.replace('#', '') as ScreenId;
    const validScreens: ScreenId[] = [
      'inicio',
      'transacoes',
      'recebimentos',
      'saques',
      'taxas',
      'chargebacks',
      'produtos',
      'links',
      'assinaturas',
      'integracoes',
      'adquirentes',
      'relatorios',
      'configuracoes',
    ];
    if (validScreens.includes(hash)) {
      return hash;
    }
    return 'inicio';
  };

  const [currentScreen, setCurrentScreenState] = useState<ScreenId>(getInitialScreen());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const setCurrentScreen = (screen: ScreenId) => {
    setCurrentScreenState(screen);
    window.location.hash = screen;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (hash) {
        setCurrentScreenState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Core States
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(initialPaymentLinks);

  // Modals & Drawers
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [refundModalTx, setRefundModalTx] = useState<Transaction | null>(null);
  const [receiptModalTx, setReceiptModalTx] = useState<Transaction | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleCreatePaymentLink = (linkData: Omit<PaymentLink, 'id' | 'salesCount' | 'revenue' | 'clicks' | 'status' | 'createdAt'>) => {
    const newLink: PaymentLink = {
      ...linkData,
      id: `link-${Date.now()}`,
      salesCount: 0,
      revenue: 0,
      clicks: 1,
      status: 'Ativo',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    setPaymentLinks([newLink, ...paymentLinks]);
    addToast('success', 'Link criado com sucesso!', 'Link copiado para a área de transferência.');
    navigator.clipboard.writeText(newLink.url);
  };

  const handleRefundConfirmed = (tx: Transaction, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === tx.id ? { ...t, status: 'Reembolsado', notes: reason } : t))
    );
    if (selectedTransaction?.id === tx.id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: 'Reembolsado', notes: reason } : null));
    }
    addToast(
      'info',
      'Transação Reembolsada',
      `O valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)} foi estornado ao cliente.`
    );
  };

  const handleSendReceipt = (target: string, channel: 'email' | 'whatsapp') => {
    addToast('success', 'Comprovante Enviado', `Enviado com sucesso para ${target} via ${channel.toUpperCase()}.`);
  };

  if (!user) {
    return (
      <AuthScreen
        onAuthenticated={(u) => {
          localStorage.setItem('bc_user', JSON.stringify(u));
          setUser(u);
          setCurrentScreen('inicio');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F6FA] text-slate-900 selection:bg-primary-500 selection:text-white">
      {/* Fixed Dark Sidebar on the left */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenCreateLinkModal={() => setIsCreateLinkModalOpen(true)}
      />

      {/* Main Container with Fixed Header and Scrollable Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Fixed Top Header (Never scrolls away) */}
        <Header
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          onNavigate={setCurrentScreen}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Scrollable Page Content Area ONLY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between scrollbar-thin">
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {currentScreen === 'inicio' && (
              <DashboardScreen
                userName={user.name}
                onNavigate={setCurrentScreen}
                onOpenWithdrawModal={() => setIsWithdrawModalOpen(true)}
                onOpenCreateLinkModal={() => setIsCreateLinkModalOpen(true)}
              />
            )}

            {currentScreen === 'transacoes' && <TransactionsScreen />}

            {currentScreen === 'saques' && (
              <WithdrawalsScreen onNotify={(msg) => addToast('success', msg)} />
            )}

            {currentScreen === 'recebimentos' && <ReceivablesScreen />}
            {currentScreen === 'chargebacks' && <ChargebacksScreen />}
            {currentScreen === 'produtos' && <ProductsScreen />}
            {currentScreen === 'links' && (
              <PaymentLinksScreen
                onOpenCreateLinkModal={() => setIsCreateLinkModalOpen(true)}
              />
            )}
            {currentScreen === 'assinaturas' && <SubscriptionsScreen />}
            {currentScreen === 'taxas' && <FeesScreen />}
            {currentScreen === 'integracoes' && <IntegrationsScreen />}
            {currentScreen === 'adquirentes' && <AcquirersScreen />}
            {currentScreen === 'relatorios' && <ReportsScreen />}
            {currentScreen === 'configuracoes' && <SettingsScreen />}
          </main>

          {/* Footer at the bottom of the page content */}
          <Footer />
        </div>
      </div>

      {/* Slide-over Transaction Details Drawer matching Screenshot 2 */}
      <TransactionDrawer
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onRefund={(tx) => setRefundModalTx(tx)}
        onSendReceipt={(tx) => setReceiptModalTx(tx)}
      />

      {/* Solicitar Saque Modal matching Screenshot 3 */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onDone={(msg) => {
          setIsWithdrawModalOpen(false);
          addToast('success', msg);
        }}
      />


      {/* Criar Link de Pagamento Modal */}
      <CreatePaymentLinkModal
        isOpen={isCreateLinkModalOpen}
        onClose={() => setIsCreateLinkModalOpen(false)}
        onCreateLink={handleCreatePaymentLink}
      />

      {/* Global Search Modal Ctrl+K */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        transactions={transactions}
        onSelectTransaction={(tx) => setSelectedTransaction(tx)}
        onNavigate={setCurrentScreen}
      />

      {/* Refund Confirmation Modal */}
      <RefundModal
        transaction={refundModalTx}
        isOpen={!!refundModalTx}
        onClose={() => setRefundModalTx(null)}
        onConfirm={handleRefundConfirmed}
      />

      {/* Send Receipt Modal */}
      <ReceiptModal
        transaction={receiptModalTx}
        isOpen={!!receiptModalTx}
        onClose={() => setReceiptModalTx(null)}
        onSend={handleSendReceipt}
      />

      {/* Interactive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
