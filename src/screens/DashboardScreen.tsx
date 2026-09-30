import React, { useCallback, useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Loader2,
  ShoppingCart,
  Receipt,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart2,
  CreditCard,
  Layers,
  Link2,
} from 'lucide-react';
import { SalesLineChart } from '../components/charts/SalesLineChart';
import { PaymentMethodsDonut } from '../components/charts/PaymentMethodsDonut';
import { PixIcon, BoletoIcon, CreditCardBadgeIcon, HandDrawnCrown } from '../components/icons/CustomIcons';
import { ScreenId } from '../types';
import { api, getToken } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { DateRangePicker, PRESETS } from '../components/DateRangePicker';
import { Sale, STATUS_CLS } from './TransactionsScreen';

// The API compares against the previous period of the same length.
const COMPARE = 'vs. período anterior';

interface DashboardScreenProps {
  userName: string;
  onNavigate: (screen: ScreenId) => void;
  onOpenWithdrawModal: () => void;
  onOpenCreateLinkModal: () => void;
}

// Shape of GET /api/dashboard-overview -> data
interface Overview {
  metrics: {
    availableBalance: number; totalVolume: number; approvedTransactions: number; averageTicket: number;
    balanceGrowth: number; volumeGrowth: number; transactionsGrowth: number; ticketGrowth: number;
  };
  volumeChart: { data: { date: string; volume: number; prevVolume: number }[] };
  activeLinks: { id: string; name: string; url: string; status: string; revenue: number; salesCount: number }[];
  paymentMethods: { name: string; value: number; percentage: number }[];
  clientsByLocation: { city: string; clients: number; growth: string }[];
}

interface MeStatus {
  email_verified: boolean;
  documentsRefused: { id: number; type: string; motive_unapproved: string }[];
}


const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const Growth: React.FC<{ value: number; label: string; dark?: boolean }> = ({ value, label, dark }) => (
  <div className="flex items-center gap-1.5 mt-2 text-xs first:mt-0">
    <span className={`font-bold flex items-center gap-0.5 ${value >= 0 ? (dark ? 'text-emerald-400' : 'text-emerald-600') : 'text-rose-500'}`}>
      {value >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
    </span>
    <span className="text-slate-400 font-medium">{label}</span>
  </div>
);

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName,
  onNavigate,
  onOpenWithdrawModal,
  onOpenCreateLinkModal,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [period, setPeriod] = useState(PRESETS[2].get); // Últimos 30 dias
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [me, setMe] = useState<MeStatus | null>(null);
  const [recent, setRecent] = useState<Sale[] | null>(null);

  const load = useCallback(() => {
    setError('');
    api(`/dashboard-overview?start_date=${period.start_date}&end_date=${period.end_date}`, { token: getToken() })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
    // Same source as the Transactions screen: carries the buyer's name and the API's own status label.
    api(`/user-sales?page=1&per_page=6&start_date=${period.start_date}&end_date=${period.end_date}`, { token: getToken() })
      .then((r) => setRecent(r.data))
      .catch(() => setRecent([]));
  }, [period]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // doc: refetch every 5 min
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    api('/me/status', { token: getToken() }).then(setMe).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-sm text-slate-500">
        {error ? (
          <>
            <span>{error}</span>
            <button onClick={load} className="text-xs font-bold text-[#07A33E] hover:underline">Tentar novamente</button>
          </>
        ) : (
          <Loader2 className="w-6 h-6 animate-spin text-[#07A33E]" />
        )}
      </div>
    );
  }

  const m = data.metrics;

  return (
    <div className="space-y-6 pb-8">
      {me && <AccountAlerts me={me} onKycSent={() => api('/me/status', { token: getToken() }).then(setMe)} />}
      {/* Greeting + period filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Olá, {userName.split(' ')[0]}!
        </h1>
        <DateRangePicker value={period} onChange={setPeriod} />
      </div>

      {/* 4 Metric KPI Cards matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Volume Total (Dark Navy Accent Card) */}
        <div className="rounded-2xl p-5 bg-[#080C0A] text-white border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">Volume Total</span>
              <div className="flex items-center justify-end gap-1 mt-0.5 text-[#00D15F]">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight font-display">
              {showBalance ? brl(m.totalVolume) : 'R$ ••••••••'}
            </h3>
            <Growth value={m.volumeGrowth} label={COMPARE} dark />
          </div>
        </div>

        <StatCard icon={ShoppingCart} label="Transações" value={m.approvedTransactions.toLocaleString('pt-BR')}>
          <Growth value={m.transactionsGrowth} label={COMPARE} />
        </StatCard>
        <StatCard icon={Receipt} label="Ticket Médio" value={brl(m.averageTicket)}>
          <Growth value={m.ticketGrowth} label={COMPARE} />
        </StatCard>

        {/* Card 4: Saldo Disponível (White Card with Action Button) */}
        <div className="rounded-2xl p-5 bg-white text-slate-900 border border-slate-100 shadow-sm relative flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-right flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Saldo Disponível</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title={showBalance ? 'Ocultar Saldo' : 'Mostrar Saldo'}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
              {showBalance ? brl(m.availableBalance) : 'R$ ••••••••'}
            </h3>

            <button
              onClick={onOpenWithdrawModal}
              className="mt-3 w-full bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/25 transition-all transform active:scale-98"
            >
              <span>Solicitar Saque</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Sales Line Chart (2/3) + Payment Methods Donut (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesLineChart data={data.volumeChart.data} subtitle={period.label} />
        </div>
        <div className="lg:col-span-1">
          <PaymentMethodsDonut data={data.paymentMethods} totalTransactions={m.approvedTransactions} />
        </div>
      </div>

      {/* Lower Section: Recent Transactions (2/3) + Right Side Promo & Top Products (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Recent Transactions Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Atividade Recente
            </h3>
            <button
              onClick={() => onNavigate('transacoes')}
              className="text-xs font-bold text-[#07A33E] hover:text-primary-700 flex items-center gap-1 group"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {recent?.length === 0 && (
            <p className="py-10 text-center text-xs text-slate-400">Nenhuma atividade no período.</p>
          )}
          {!recent && (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />
            </div>
          )}
          <div className="divide-y divide-slate-50">
            {recent?.map((s) => {
              const method = s.forma_pagamento.toLowerCase();
              return (
                <div key={s.id} className="flex items-center gap-3 py-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    {method.includes('pix') ? (
                      <PixIcon className="w-4 h-4 text-teal-600" />
                    ) : method.includes('boleto') ? (
                      <BoletoIcon className="w-4 h-4 text-slate-800" />
                    ) : (
                      <CreditCardBadgeIcon className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{s.comprador}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {s.produto} · {s.data}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${STATUS_CLS[s.status] ?? 'bg-[#FEE2E2] text-[#B91C1C]'}`}>
                    {s.status_label}
                  </span>
                  <span className="font-bold text-slate-900 w-24 text-right">{brl(s.valor)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1/3: Promo Banner + Top Products */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Links de Pagamento Promo Banner matching Screenshot 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1A10] via-[#0C2415] to-[#050A07] border border-primary-500/30 p-5 text-white shadow-md group">
            <div className="absolute top-3 left-3 opacity-90">
              <HandDrawnCrown className="w-6 h-5" color="#00D15F" />
            </div>

            {/* Neon Blue Chain Graphics on the right */}
            <div className="absolute -right-2 -bottom-2 w-28 h-28 opacity-70 group-hover:scale-105 transition-transform">
              <Link2 className="w-24 h-24 text-[#07A33E] stroke-[1.5]" />
            </div>

            <div className="relative z-10 pt-4">
              <h4 className="text-base font-extrabold text-white tracking-tight">
                Links de Pagamento
              </h4>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-snug max-w-[190px]">
                Crie, compartilhe e receba em segundos.
              </p>

              <button
                onClick={onOpenCreateLinkModal}
                className="mt-4 bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-primary-500/30 transition-all transform active:scale-98"
              >
                <span>Criar Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Top Produtos / Serviços matching Screenshot 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Links Ativos
              </h4>
              <button
                onClick={() => onNavigate('links')}
                className="text-xs font-bold text-[#07A33E] hover:text-primary-700 flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {data.activeLinks.length === 0 && <p className="text-xs text-slate-400">Nenhum link ativo.</p>}
              {data.activeLinks.slice(0, 5).map((l, i) => (
                <div key={l.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">{l.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{l.salesCount} vendas</span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full bg-[#07A33E]" style={{ width: `${(l.revenue / Math.max(...data.activeLinks.map((l) => l.revenue), 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-xs shrink-0">{brl(l.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clientes por cidade */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Clientes por Cidade</h4>
            {data.clientsByLocation.length === 0 && <p className="text-xs text-slate-400">Sem dados no período.</p>}
            <div className="space-y-3">
              {data.clientsByLocation.slice(0, 5).map((c) => (
                <div key={c.city} className="flex items-center gap-2.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="flex-1 font-semibold text-slate-800 truncate">{c.city}</span>
                  <span className="font-bold text-slate-900">{c.clients}</span>
                  <span className={`w-14 text-right font-bold ${c.growth.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'}`}>{c.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Avisos de e-mail não verificado e documentos de KYC recusados (GET /api/me/status).
const AccountAlerts: React.FC<{ me: MeStatus; onKycSent: () => void }> = ({ me, onKycSent }) => {
  const [msg, setMsg] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const [files, setFiles] = useState<Record<number, File>>({});
  const [sending, setSending] = useState(false);

  const resendEmail = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 60_000);
    api('/me/email/resend-verification', { method: 'POST', token: getToken() })
      .then((r) => setMsg(r.message))
      .catch((e) => setMsg(e.message));
  };

  const resendKyc = () => {
    const fd = new FormData();
    Object.entries(files).forEach(([id, f]) => fd.append(`documents[${id}]`, f));
    setSending(true);
    api('/me/kyc/resend', { body: fd, token: getToken() })
      .then((r) => { setMsg(r.message); setFiles({}); onKycSent(); })
      .catch((e) => setMsg(e.message))
      .finally(() => setSending(false));
  };

  if (me.email_verified && !me.documentsRefused.length) return null;

  return (
    <div className="space-y-3">
      {!me.email_verified && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1 font-semibold">Confirme seu e-mail pelo link que enviamos para liberar todos os recursos.</span>
          <button disabled={cooldown} onClick={resendEmail} className="font-bold underline disabled:opacity-50 disabled:no-underline">
            {cooldown ? 'E-mail enviado' : 'Reenviar e-mail'}
          </button>
        </div>
      )}
      {me.documentsRefused.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" /> Alguns documentos foram recusados. Envie novamente:
          </div>
          {me.documentsRefused.map((d) => (
            <label key={d.id} className="flex flex-wrap items-center gap-3">
              <span className="font-semibold min-w-[160px]">{d.type} — <span className="font-normal">{d.motive_unapproved}</span></span>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFiles((p) => ({ ...p, [d.id]: f }));
                }}
                className="text-[11px] file:mr-2 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-rose-100 file:font-semibold"
              />
            </label>
          ))}
          <button
            disabled={!Object.keys(files).length || sending}
            onClick={resendKyc}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Reenviar documentos'}
          </button>
        </div>
      )}
      {msg && <p className="text-xs font-semibold text-slate-600">{msg}</p>}
    </div>
  );
};
