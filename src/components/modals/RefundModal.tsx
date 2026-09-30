import React, { useState } from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Transaction } from '../../types';

interface RefundModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tx: Transaction, reason: string) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Solicitação do cliente dentro dos 7 dias');

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Confirmar Reembolso</h3>
              <p className="text-xs text-slate-500">Transação {transaction.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-relaxed">
            Esta ação estornará <strong>R$ {transaction.amount.toFixed(2).replace('.', ',')}</strong> integralmente para{' '}
            <strong>{transaction.customerName}</strong> via {transaction.method.toUpperCase()}.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Motivo do estorno
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
          >
            <option value="Solicitação do cliente dentro dos 7 dias">Solicitação do cliente (Direito de arrependimento)</option>
            <option value="Cobrança em duplicidade">Cobrança em duplicidade</option>
            <option value="Problema no acesso ao produto">Problema técnico / entrega do produto</option>
            <option value="Acordo comercial amigável">Acordo comercial amigável</option>
            <option value="Outros">Outros motivos</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              onConfirm(transaction, reason);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
          >
            Confirmar Estorno
          </button>
        </div>
      </div>
    </div>
  );
};
