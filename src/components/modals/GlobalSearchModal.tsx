import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, ShoppingBag, Link2, SlidersHorizontal } from 'lucide-react';
import { ScreenId, Transaction } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectTransaction,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTxs = transactions.filter(
    (t) =>
      t.code.toLowerCase().includes(query.toLowerCase()) ||
      t.customerName.toLowerCase().includes(query.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(query.toLowerCase()) ||
      t.campaign.toLowerCase().includes(query.toLowerCase())
  );

  const quickNav: { label: string; screen: ScreenId; icon: React.ElementType }[] = [
    { label: 'Ir para Dashboard', screen: 'inicio', icon: SlidersHorizontal },
    { label: 'Gerenciar Transações', screen: 'transacoes', icon: SlidersHorizontal },
    { label: 'Ver Saques e Contas', screen: 'saques', icon: SlidersHorizontal },
    { label: 'Criar Link de Pagamento', screen: 'links', icon: Link2 },
    { label: 'Catálogo de Produtos', screen: 'produtos', icon: ShoppingBag },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-primary-500 shrink-0 ml-2" />
          <input
            type="text"
            placeholder="Digite para buscar transações, clientes, links, configurações..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm md:text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {query.trim() === '' ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Navegação Rápida
              </p>
              <div className="space-y-1">
                {quickNav.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        onNavigate(n.screen);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{n.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Transações ({filteredTxs.length})
              </p>
              {filteredTxs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Nenhum resultado encontrado para "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTxs.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => {
                        onSelectTransaction(tx);
                        onClose();
                      }}
                      className="p-3 rounded-xl hover:bg-primary-50/60 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-primary-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                          {tx.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {tx.customerName} • <span className="font-mono text-slate-500">{tx.code}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {tx.method.toUpperCase()} • {tx.fullDate} • {tx.campaign}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          R$ {tx.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            tx.status === 'Aprovado'
                              ? 'text-emerald-600'
                              : tx.status === 'Pendente'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
