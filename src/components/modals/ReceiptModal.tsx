import React, { useState } from 'react';
import { Send, X, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../../types';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailOrPhone: string, channel: 'email' | 'whatsapp') => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSend,
}) => {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [target, setTarget] = useState(transaction?.customerEmail || '');

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 text-[#07A33E] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Enviar Comprovante</h3>
              <p className="text-xs text-slate-500">Transação {transaction.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setChannel('email');
              setTarget(transaction.customerEmail);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              channel === 'email'
                ? 'bg-primary-50 border-primary-500 text-[#07A33E]'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Por E-mail</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChannel('whatsapp');
              setTarget(transaction.customerPhone || '(11) 99999-9999');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              channel === 'whatsapp'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Por WhatsApp</span>
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            {channel === 'email' ? 'E-mail do destinatário' : 'WhatsApp do destinatário'}
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSend(target, channel);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20"
          >
            Enviar Agora
          </button>
        </div>
      </div>
    </div>
  );
};
