import React, { useEffect, useState } from 'react';
import { Percent, Calculator, Send, Loader2, CalendarClock, ShieldAlert } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PixIcon, BoletoIcon, CreditCardBadgeIcon } from '../components/icons/CustomIcons';
import { api, getToken } from '../lib/api';
import { simulateSale, simulateWithdrawal, releaseDate } from '../lib/fees';

// GET /api/fees -> data (numbers come as strings)
type Fees = Record<string, string | number | null>;

type Method = 'pix' | 'card' | 'boleto';

const METHODS: { id: Method; label: string; icon: React.FC<{ className?: string }>; iconCls: string; pct: string; fixed: string; days: string }[] = [
  { id: 'pix', label: 'PIX', icon: PixIcon, iconCls: 'text-teal-600', pct: 'pix', fixed: 'fixed_fee_pix', days: 'days_release_money_sale_pix' },
  { id: 'card', label: 'Cartão', icon: CreditCardBadgeIcon, iconCls: 'text-primary-600', pct: 'card', fixed: 'fixed_fee_card', days: 'days_release_money_sale_card' },
  { id: 'boleto', label: 'Boleto', icon: BoletoIcon, iconCls: 'text-slate-800', pct: 'boleto', fixed: 'fixed_fee_boleto', days: 'days_release_money_sale_boleto' },
];

const num = (v: unknown) => Number(v) || 0;
const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const pct = (v: number) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
const parseBRL = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;

// Per-method fee config, falling back to the generic fixed_fee when the method-specific one is missing.
const feeFor = (fees: Fees, m: (typeof METHODS)[number]) => ({
  percent: num(fees[m.pct]),
  fixed: num(fees[m.fixed] ?? fees.fixed_fee),
  days: num(fees[m.days]),
});

const Row: React.FC<{ label: React.ReactNode; value: string; strong?: boolean; muted?: boolean }> = ({ label, value, strong, muted }) => (
  <div className={`flex justify-between py-2 text-sm ${strong ? 'border-t border-slate-200 mt-1 pt-3' : ''}`}>
    <span className={muted ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
    <span className={strong ? 'font-extrabold text-slate-900 text-base' : 'font-bold text-slate-800'}>{value}</span>
  </div>
);

export const FeesScreen: React.FC = () => {
  const [fees, setFees] = useState<Fees | null>(null);
  const [withdrawalFee, setWithdrawalFee] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [method, setMethod] = useState<Method>('pix');
  const [saleStr, setSaleStr] = useState('100,00');
  const [withdrawStr, setWithdrawStr] = useState('500,00');

  useEffect(() => {
    const token = getToken();
    api('/fees', { token }).then((r) => setFees(r.data)).catch((e) => setError(e.message));
    api('/fees/global', { token })
      .then((r) => setWithdrawalFee(num(r.data.withdrawal_fee)))
      .catch(() => setWithdrawalFee(0));
  }, []);

  if (!fees) {
    return (
      <div className="py-32 flex justify-center text-sm text-rose-600">
        {error || <Loader2 className="w-6 h-6 animate-spin text-[#07A33E]" />}
      </div>
    );
  }

  const reservePercent = num(fees.pix_reserve_percentage);
  const m = METHODS.find((x) => x.id === method)!;
  const cfg = feeFor(fees, m);
  const saleValue = parseBRL(saleStr);
  const sim = simulateSale(saleValue, cfg.percent, cfg.fixed, method === 'pix' ? reservePercent : 0);
  const release = releaseDate(cfg.days);
  const withdrawValue = parseBRL(withdrawStr);
  const wFee = withdrawalFee ?? 0;

  const inputCls =
    'w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-base focus:border-[#07A33E] outline-none placeholder:text-slate-400';

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Taxas</h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Suas taxas de processamento e simuladores de venda e saque. Plano: <strong className="text-slate-700">{String(fees.plan ?? '—')}</strong>
        </p>
      </div>

      {/* Fee cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METHODS.map((x) => {
          const c = feeFor(fees, x);
          return (
            <StatCard key={x.id} icon={x.icon} label={x.label} value={pct(c.percent)}>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <span className="text-slate-500">+ {brl(c.fixed)}/venda</span> · <CalendarClock className="w-3.5 h-3.5" /> D+{c.days}
              </span>
            </StatCard>
          );
        })}
        <StatCard icon={Send} label="Saque" value={withdrawalFee === null ? '…' : brl(wFee)}>
          <span className="text-slate-500 font-medium">por saque via PIX</span>
        </StatCard>
      </div>

      {reservePercent > 0 && (
        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Reserva PIX: {pct(reservePercent)} do valor líquido de cada venda PIX fica retido por {num(fees.pix_reserve_days)} dias.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale simulator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Simular venda</h3>
              <p className="text-xs text-slate-500">Quanto você recebe por uma venda</p>
            </div>
          </div>

          <label className="text-xs font-bold text-slate-700 block mb-1.5">Valor da venda</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
            <input inputMode="decimal" value={saleStr} onChange={(e) => setSaleStr(e.target.value.replace(/[^\d.,]/g, ''))} className={inputCls} placeholder="0,00" />
          </div>

          <label className="text-xs font-bold text-slate-700 block mt-4 mb-1.5">Método de pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((x) => (
              <button
                key={x.id}
                onClick={() => setMethod(x.id)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  method === x.id ? 'bg-[#07A33E] text-white shadow-sm' : 'bg-[#F8FAFC] border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <x.icon className={`w-3.5 h-3.5 ${method === x.id ? '' : x.iconCls}`} />
                {x.label}
              </button>
            ))}
          </div>

          <div className="mt-5 bg-[#F8FAFC] border border-slate-100 rounded-xl px-4 py-2">
            <Row label="Valor da venda" value={brl(saleValue)} />
            <Row label={`Taxa ${pct(cfg.percent)} + ${brl(cfg.fixed)}`} value={`- ${brl(sim.fee)}`} />
            {sim.reserve > 0 && <Row label={`Reserva PIX (${num(fees.pix_reserve_days)} dias)`} value={`- ${brl(sim.reserve)}`} muted />}
            <Row label="Você recebe" value={brl(sim.reserve > 0 ? sim.availableNow : sim.net)} strong />
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-[#07A33E]" />
            {cfg.days === 0 ? 'Disponível na hora' : `Disponível em D+${cfg.days} (${release.toLocaleDateString('pt-BR')}, se vender hoje)`}
          </p>
          {sim.reserve > 0 && (
            <p className="text-xs text-slate-400 mt-1 ml-5">
              + {brl(sim.reserve)} da reserva liberados após {num(fees.pix_reserve_days)} dias ({brl(sim.net)} no total)
            </p>
          )}
        </div>

        {/* Withdrawal simulator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Simular saque</h3>
              <p className="text-xs text-slate-500">Quanto cai na sua conta ao sacar</p>
            </div>
          </div>

          <label className="text-xs font-bold text-slate-700 block mb-1.5">Valor do saque</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
            <input inputMode="decimal" value={withdrawStr} onChange={(e) => setWithdrawStr(e.target.value.replace(/[^\d.,]/g, ''))} className={inputCls} placeholder="0,00" />
          </div>

          <div className="mt-5 bg-[#F8FAFC] border border-slate-100 rounded-xl px-4 py-2">
            <Row label="Valor solicitado" value={brl(withdrawValue)} />
            <Row label="Taxa de saque" value={`- ${brl(wFee)}`} />
            <Row label="Você recebe" value={brl(simulateWithdrawal(withdrawValue, wFee))} strong />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            A taxa é fixa por saque: juntar o valor em menos saques sai mais barato.
          </p>
        </div>
      </div>
    </div>
  );
};
