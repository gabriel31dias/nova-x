import React, { useState } from 'react';
import { Link2, Plus, Copy, Check, ExternalLink, QrCode, ArrowUpRight } from 'lucide-react';
import { initialPaymentLinks } from '../data/mockData';
import { PaymentLink } from '../types';

interface PaymentLinksScreenProps {
  onOpenCreateLinkModal: () => void;
}

export const PaymentLinksScreen: React.FC<PaymentLinksScreenProps> = ({
  onOpenCreateLinkModal,
}) => {
  const [links, setLinks] = useState<PaymentLink[]>(initialPaymentLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Links de Pagamento
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Crie checkouts instantâneos para vender por WhatsApp, redes sociais e e-mail.
          </p>
        </div>

        <button
          onClick={onOpenCreateLinkModal}
          className="bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/20 transition-all transform active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Link</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {link.status}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Criado em {link.createdAt}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">{link.title}</h3>

              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-display">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(link.amount)}
                </span>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600 font-mono truncate">
                <span className="truncate mr-2">{link.url}</span>
                <button
                  onClick={() => handleCopy(link.url, link.id)}
                  className="p-1 text-primary-600 hover:text-primary-800"
                  title="Copiar Link"
                >
                  {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Cliques</span>
                  <span className="text-xs font-bold text-slate-800">{link.clicks}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Vendas</span>
                  <span className="text-xs font-bold text-slate-800">{link.salesCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(link.revenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => handleCopy(link.url, link.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
