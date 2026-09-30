import React, { useState } from 'react';
import { Link2, X, Check, Copy, Sparkles, CreditCard, QrCode } from 'lucide-react';
import { PaymentLink } from '../../types';
import { PixIcon } from '../icons/CustomIcons';

interface CreatePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLink: (link: Omit<PaymentLink, 'id' | 'salesCount' | 'revenue' | 'clicks' | 'status' | 'createdAt'>) => void;
}

export const CreatePaymentLinkModal: React.FC<CreatePaymentLinkModalProps> = ({
  isOpen,
  onClose,
  onCreateLink,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [slug, setSlug] = useState('');
  const [allowPix, setAllowPix] = useState(true);
  const [allowCard, setAllowCard] = useState(true);
  const [allowBoleto, setAllowBoleto] = useState(true);
  const [maxInstallments, setMaxInstallments] = useState(12);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Informe o título do link.');
      return;
    }
    const val = parseFloat(amountStr.replace(/\./g, '').replace(',', '.')) || 0;
    if (val <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    const finalSlug = slug.trim()
      ? slug.toLowerCase().replace(/\s+/g, '-')
      : title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    onCreateLink({
      title,
      amount: val,
      url: `https://poppay.com.br/pay/${finalSlug}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Criar Link de Pagamento</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere um checkout de alta conversão em segundos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Título do Produto ou Cobrança
            </label>
            <input
              type="text"
              placeholder="Ex: Consultoria Exclusiva / Assinatura Mensal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Valor (R$)
              </label>
              <input
                type="text"
                placeholder="199,90"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Parcelas Máximas
              </label>
              <select
                value={maxInstallments}
                onChange={(e) => setMaxInstallments(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {[1, 2, 3, 6, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    Até {n}x {n === 1 ? '(À vista)' : 'no cartão'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Formas de Pagamento Aceitas
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAllowPix(!allowPix)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  allowPix
                    ? 'border-teal-500 bg-teal-50/50 text-teal-700'
                    : 'border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <PixIcon className="w-3.5 h-3.5" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setAllowCard(!allowCard)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  allowCard
                    ? 'border-primary-500 bg-primary-50/50 text-primary-700'
                    : 'border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setAllowBoleto(!allowBoleto)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  allowBoleto
                    ? 'border-slate-800 bg-slate-100 text-slate-800'
                    : 'border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span>Boleto</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-500/25 transition-all"
            >
              Gerar Link de Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
