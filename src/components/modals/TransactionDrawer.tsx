import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  Send,
  RotateCcw,
  ExternalLink,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { PixIcon, BoletoIcon, CreditCardBadgeIcon } from '../icons/CustomIcons';
import { Transaction } from '../../types';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onRefund: (tx: Transaction) => void;
  onSendReceipt: (tx: Transaction) => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onRefund,
  onSendReceipt,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(transaction.amount);

  const getStatusBanner = () => {
    switch (transaction.status) {
      case 'Aprovado':
        return (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex items-center gap-3.5 text-emerald-900">
            <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-emerald-900 leading-tight">Pagamento Aprovado</p>
              <p className="text-xs text-emerald-700 mt-0.5 font-medium">Transação concluída com sucesso.</p>
            </div>
          </div>
        );
      case 'Pendente':
        return (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 flex items-center gap-3.5 text-amber-900">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-900 leading-tight">Aguardando Pagamento</p>
              <p className="text-xs text-amber-700 mt-0.5 font-medium">Aguardando confirmação do emissor ou compensação.</p>
            </div>
          </div>
        );
      case 'Reembolsado':
        return (
          <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-4 flex items-center gap-3.5 text-rose-900">
            <div className="w-10 h-10 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-rose-900 leading-tight">Transação Reembolsada</p>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">O valor total foi estornado ao comprador.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 flex items-center gap-3.5 text-rose-900">
            <div className="w-10 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-rose-900 leading-tight">{transaction.status}</p>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">Esta transação não foi finalizada.</p>
            </div>
          </div>
        );
    }
  };

  const getMethodDisplay = () => {
    switch (transaction.method) {
      case 'pix':
        return (
          <div className="flex items-center gap-2">
            <PixIcon className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-800">PIX</span>
          </div>
        );
      case 'cartao':
        return (
          <div className="flex items-center gap-2">
            <CreditCardBadgeIcon className="w-4 h-4 text-primary-600" />
            <span className="font-semibold text-slate-800">
              Cartão {transaction.cardBrand ? `(${transaction.cardBrand})` : ''}
            </span>
          </div>
        );
      case 'boleto':
        return (
          <div className="flex items-center gap-2">
            <BoletoIcon className="w-4 h-4 text-slate-800" />
            <span className="font-semibold text-slate-800">Boleto Bancário</span>
          </div>
        );
      default:
        return <span className="font-semibold text-slate-800">Outros</span>;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Detalhes da Transação
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Status Banner */}
          {getStatusBanner()}

          {/* Details Table List */}
          <div className="space-y-3.5 text-xs">
            {/* ID da Transação */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">ID da Transação</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 font-mono">{transaction.code}</span>
                <button
                  onClick={handleCopyId}
                  className="text-primary-600 hover:text-primary-700 p-1 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Copiar ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Data e Hora</span>
              <span className="font-semibold text-slate-900">
                {transaction.date} {transaction.time}
              </span>
            </div>

            {/* Valor */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Valor</span>
              <span className="font-extrabold text-slate-900 text-sm">{formattedAmount}</span>
            </div>

            {/* Método de Pagamento */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Método de Pagamento</span>
              {getMethodDisplay()}
            </div>

            {/* Cliente */}
            <div className="flex items-start justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Cliente</span>
              <div className="text-right">
                <p className="font-bold text-slate-900">{transaction.customerName}</p>
                <p className="text-slate-500 text-[11px]">{transaction.customerEmail}</p>
                {transaction.customerPhone && (
                  <p className="text-slate-400 text-[11px]">{transaction.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Documento */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Documento</span>
              <span className="font-semibold text-slate-800 font-mono">
                {transaction.customerDocument || '480.015.828-17'}
              </span>
            </div>

            {/* Campanha */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Campanha</span>
              <a
                href="#campanha"
                className="font-semibold text-[#07A33E] hover:underline"
              >
                {transaction.campaign}
              </a>
            </div>

            {/* Origem */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Origem</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-[200px]">
                {transaction.origin}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  transaction.status === 'Aprovado'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : transaction.status === 'Pendente'
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : transaction.status === 'Reembolsado'
                    ? 'bg-[#FFE4E6] text-[#BE123C]'
                    : 'bg-[#FEE2E2] text-[#B91C1C]'
                }`}
              >
                {transaction.status}
              </span>
            </div>

            {/* Código da Autorização */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Código da Autorização</span>
              <span className="font-mono font-semibold text-slate-800">
                {transaction.authCode}
              </span>
            </div>

            {/* IP */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">IP</span>
              <span className="font-mono font-semibold text-slate-800">{transaction.ip}</span>
            </div>

            {/* Dispositivo */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Dispositivo</span>
              <span className="font-semibold text-slate-800">{transaction.device}</span>
            </div>

            {/* Observações */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 font-medium">Observações</span>
              <span className="text-slate-600">{transaction.notes}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 pt-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
          <button
            onClick={() => onSendReceipt(transaction)}
            className="w-full py-3 px-4 rounded-xl bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary-500/25 transition-all transform active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Comprovante</span>
          </button>

          <button
            onClick={() => onRefund(transaction)}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#07A33E] text-[#07A33E] hover:bg-primary-50 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reembolsar</span>
          </button>

          <button
            onClick={() => window.open(transaction.origin, '_blank')}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#07A33E] text-[#07A33E] hover:bg-primary-50 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver no Gateway</span>
          </button>
        </div>
      </div>
    </>
  );
};
