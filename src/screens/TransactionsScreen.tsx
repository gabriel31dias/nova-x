import React, { useCallback, useEffect, useState } from 'react';
import {
  Download,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Landmark,
  ShieldCheck,
  XCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
  X,
  Copy,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PixIcon, BoletoIcon, CreditCardBadgeIcon } from '../components/icons/CustomIcons';
import { api, getToken } from '../lib/api';

// Shape of GET /api/user-sales
export interface Sale {
  id: number;
  payment_code: string;
  status: string;
  status_label: string;
  data: string;
  approved_at: string | null;
  expires_at: string | null;
  forma_pagamento: string;
  tipo_produto: string;
  comprador: string;
  comprador_email: string;
  produto: string;
  valor: number;
  sua_comissao: number;
  comissao_status: string;
  pix_copia_cola: string | null;
}

interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface Summary {
  total: number;
  total_value: number;
  approved: number;
  approved_percentage: number;
  refused: number;
  refused_percentage: number;
  total_growth: number;
  value_growth: number;
  approved_growth: number;
  refused_growth: number;
}

const TABS = [
  { label: 'Todos', status: '', dot: '' },
  { label: 'Aprovadas', status: 'approved', dot: 'bg-emerald-500' },
  { label: 'Concluídas', status: 'completed', dot: 'bg-emerald-700' },
  { label: 'Pendentes', status: 'pending', dot: 'bg-amber-500' },
  { label: 'Recusadas', status: 'refused', dot: 'bg-rose-500' },
  { label: 'Canceladas', status: 'canceled', dot: 'bg-slate-400' },
  { label: 'Reembolsadas', status: 'refunded', dot: 'bg-rose-300' },
];

export const STATUS_CLS: Record<string, string> = {
  PAID: 'bg-[#DCFCE7] text-[#15803D]',
  COMPLETED: 'bg-[#DCFCE7] text-[#15803D]',
  PENDING: 'bg-[#FEF3C7] text-[#B45309]',
  REFUNDED: 'bg-[#FFE4E6] text-[#BE123C]',
};

// Filters shown in the side panel ("Mais filtros"); all are partial matches on the API side.
const ADVANCED: [keyof typeof EMPTY_FILTERS, string, string][] = [
  ['order_code', 'Código do pedido', 'Ex.: PED-123'],
  ['product', 'Produto', 'Nome do produto'],
  ['customer_name', 'Nome do cliente', 'Fulano de Tal'],
  ['customer_email', 'E-mail do cliente', 'cliente@email.com'],
  ['customer_cpf', 'CPF do cliente', '000.000.000-00'],
  ['src', 'SRC', 'Origem (src)'],
  ['utm', 'UTM', 'Qualquer parâmetro UTM'],
  ['utm_source', 'UTM Source', 'facebook, google...'],
  ['utm_medium', 'UTM Medium', 'cpc, email...'],
  ['utm_content', 'UTM Content', 'Criativo / anúncio'],
];

const EMPTY_FILTERS = {
  start_date: '', end_date: '', payment_method: '', search: '', value: '',
  order_code: '', product: '', customer_name: '', customer_email: '', customer_cpf: '',
  src: '', utm: '', utm_source: '', utm_medium: '', utm_content: '',
};
const PER_PAGE = 10;

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const pct = (v: number) => `${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

const MethodCell: React.FC<{ method: string }> = ({ method }) => {
  const m = method.toUpperCase();
  return (
    <div className="flex items-center gap-2">
      {m === 'PIX' ? (
        <PixIcon className="w-3.5 h-3.5 text-teal-600" />
      ) : m === 'BOLETO' ? (
        <BoletoIcon className="w-3.5 h-3.5 text-slate-800" />
      ) : (
        <CreditCardBadgeIcon className="w-3.5 h-3.5 text-primary-600" />
      )}
      <span className="font-semibold text-slate-700">{m === 'CARD' ? 'Cartão' : m === 'BOLETO' ? 'Boleto' : m}</span>
    </div>
  );
};

const StatusBadge: React.FC<{ sale: Sale }> = ({ sale }) => (
  <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${STATUS_CLS[sale.status] ?? 'bg-[#FEE2E2] text-[#B91C1C]'}`}>
    {sale.status_label}
  </span>
);

const SummaryCard: React.FC<{
  icon: React.FC<{ className?: string }>;
  iconBg?: string;
  label: string;
  value: string;
  growth: number;
  hint?: string;
  lowerIsBetter?: boolean;
  dark?: boolean;
}> = ({ growth, hint, lowerIsBetter, ...card }) => {
  const good = lowerIsBetter ? growth <= 0 : growth >= 0;
  return (
    <StatCard {...card}>
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-1 font-bold ${good ? (card.dark ? 'text-emerald-400' : 'text-emerald-600') : 'text-rose-500'}`}>
          {growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {pct(growth)}
        </span>
        {hint && <span className="text-slate-400 font-medium">{hint}</span>}
      </div>
    </StatCard>
  );
};

export const TransactionsScreen: React.FC = () => {
  const [tab, setTab] = useState(TABS[0]);
  const [draft, setDraft] = useState(EMPTY_FILTERS); // what's typed in the filter bar
  const [filters, setFilters] = useState(EMPTY_FILTERS); // what's applied
  const [page, setPage] = useState(1);
  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeAdvanced = ADVANCED.filter(([k]) => filters[k]).length;

  const query = useCallback(
    (extra: Record<string, string | number>) => {
      const params = new URLSearchParams();
      Object.entries({ ...filters, status: tab.status, ...extra }).forEach(([k, v]) => v !== '' && params.set(k, String(v)));
      return api(`/user-sales?${params}`, { token: getToken() });
    },
    [filters, tab]
  );

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    query({ page, per_page: PER_PAGE })
      .then((r) => {
        setSales(r.data);
        setPagination(r.pagination);
        setSummary(r.summary);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, page]);

  useEffect(load, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFilters(draft);
    setShowAdvanced(false);
  };

  const clearAdvanced = () => {
    const cleared = { ...draft, ...Object.fromEntries(ADVANCED.map(([k]) => [k, ''])) };
    setDraft(cleared);
    setFilters(cleared);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setTab(TABS[0]);
    setPage(1);
  };

  // ponytail: the API has no export endpoint, so the CSV is built client-side from one big page (capped at 1000 rows).
  const exportCsv = async () => {
    setExporting(true);
    try {
      const r = await query({ page: 1, per_page: 1000 });
      const cols: (keyof Sale)[] = ['payment_code', 'data', 'comprador', 'comprador_email', 'produto', 'forma_pagamento', 'valor', 'sua_comissao', 'status_label'];
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const csv = [cols.join(';'), ...r.data.map((s: Sale) => cols.map((c) => esc(s[c])).join(';'))].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      a.download = `transacoes-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#07A33E]';
  const setField = (k: keyof typeof EMPTY_FILTERS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));
  // Dates apply immediately (like the official panel's range picker), without waiting for "Filtrar".
  const setDate = (k: 'start_date' | 'end_date') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDraft((d) => ({ ...d, [k]: v }));
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Transações</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Acompanhe e gerencie todas as suas transações em tempo real.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/25 transition-all"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard dark icon={Wallet} label="Total de Transações" value={summary.total.toLocaleString('pt-BR')} growth={summary.total_growth} />
          <SummaryCard icon={Landmark} label="Volume Total" value={brl(summary.total_value)} growth={summary.value_growth} />
          <SummaryCard icon={ShieldCheck} label="Aprovadas" value={summary.approved.toLocaleString('pt-BR')} growth={summary.approved_growth} hint={`${pct(summary.approved_percentage)} do total`} />
          <SummaryCard icon={XCircle} label="Recusadas" value={summary.refused.toLocaleString('pt-BR')} growth={summary.refused_growth} hint={`${pct(summary.refused_percentage)} do total`} lowerIsBetter />
        </div>
      )}

      {/* Filters */}
      <form onSubmit={applyFilters} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <label className="lg:col-span-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">De</span>
            <input type="date" value={draft.start_date} onChange={setDate('start_date')} className={inputCls} />
          </label>
          <label className="lg:col-span-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Até</span>
            <input type="date" value={draft.end_date} onChange={setDate('end_date')} className={inputCls} />
          </label>
          <label className="lg:col-span-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Método</span>
            <select value={draft.payment_method} onChange={setField('payment_method')} className={inputCls}>
              <option value="">Todos</option>
              <option value="pix">PIX</option>
              <option value="card">Cartão</option>
              <option value="boleto">Boleto</option>
            </select>
          </label>
          <label className="lg:col-span-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Buscar</span>
            <input
              type="text"
              placeholder="Código, cliente, e-mail ou produto..."
              value={draft.search}
              onChange={setField('search')}
              className={inputCls + ' font-medium placeholder:text-slate-400'}
            />
          </label>
          <label className="lg:col-span-1">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Valor</span>
            <input type="text" inputMode="decimal" placeholder="97,00" value={draft.value} onChange={setField('value')} className={inputCls} />
          </label>
          <div className="lg:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="relative bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Mais filtros</span>
              {activeAdvanced > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#07A33E] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeAdvanced}
                </span>
              )}
            </button>
            <button className="flex-1 bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-primary-500/20 transition-all">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Limpar Filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1 border-t border-slate-100">
          {TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === t ? 'bg-[#07A33E] text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {t.dot && <span className={`w-2 h-2 rounded-full ${t.dot}`} />}
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#07A33E]" />
            </div>
          )}
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 font-semibold">Código</th>
                <th className="py-4 px-3 font-semibold">Data</th>
                <th className="py-4 px-3 font-semibold">Cliente</th>
                <th className="py-4 px-3 font-semibold">Produto</th>
                <th className="py-4 px-3 font-semibold">Método</th>
                <th className="py-4 px-3 font-semibold">Valor</th>
                <th className="py-4 px-3 font-semibold">Sua comissão</th>
                <th className="py-4 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((s) => (
                <tr key={s.id} onClick={() => setSelected(s)} className="hover:bg-slate-50/90 transition-colors cursor-pointer">
                  <td className="py-4 px-4 font-mono font-bold text-slate-800">{s.payment_code}</td>
                  <td className="py-4 px-3 text-slate-600 font-medium whitespace-nowrap">{s.data}</td>
                  <td className="py-4 px-3">
                    <p className="font-bold text-slate-900 leading-tight">{s.comprador}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.comprador_email}</p>
                  </td>
                  <td className="py-4 px-3 text-slate-700 font-medium max-w-[200px] truncate">{s.produto}</td>
                  <td className="py-4 px-3 whitespace-nowrap"><MethodCell method={s.forma_pagamento} /></td>
                  <td className="py-4 px-3 font-extrabold text-slate-900 whitespace-nowrap">{brl(s.valor)}</td>
                  <td className="py-4 px-3 font-bold text-emerald-700 whitespace-nowrap">{brl(s.sua_comissao)}</td>
                  <td className="py-4 px-3 whitespace-nowrap"><StatusBadge sale={s} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !sales.length && (
            <p className="py-16 text-center text-xs text-slate-400">{error || 'Nenhuma transação encontrada.'}</p>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span>
              Mostrando {pagination.from} a {pagination.to} de {pagination.total.toLocaleString('pt-BR')} transações
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="font-bold text-slate-700">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.last_page}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="fixed inset-0 !mt-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdvanced(false)}>
          <form
            onSubmit={applyFilters}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm h-full bg-white shadow-modal flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Mais filtros</h2>
              <button type="button" onClick={() => setShowAdvanced(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {ADVANCED.map(([k, label, placeholder]) => (
                <label key={k} className="block">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">{label}</span>
                  <input
                    type="text"
                    value={draft[k]}
                    onChange={setField(k)}
                    placeholder={placeholder}
                    className={inputCls + ' font-medium placeholder:text-slate-400'}
                  />
                </label>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={clearAdvanced} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Limpar
              </button>
              <button className="flex-1 bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Aplicar filtros
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && <SaleDetails sale={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const SaleDetails: React.FC<{ sale: Sale; onClose: () => void }> = ({ sale, onClose }) => {
  const [copied, setCopied] = useState(false);
  const rows: [string, React.ReactNode][] = [
    ['Código', <span className="font-mono">{sale.payment_code}</span>],
    ['Status', <StatusBadge sale={sale} />],
    ['Data', sale.data],
    ['Aprovada em', sale.approved_at],
    ['Expira em', sale.expires_at],
    ['Método', <MethodCell method={sale.forma_pagamento} />],
    ['Cliente', <>{sale.comprador}<br /><span className="text-slate-400 font-medium">{sale.comprador_email}</span></>],
    ['Produto', <>{sale.produto} <span className="text-slate-400 font-medium">({sale.tipo_produto})</span></>],
    ['Valor', brl(sale.valor)],
    ['Sua comissão', <>{brl(sale.sua_comissao)} <span className="text-slate-400 font-medium">{sale.comissao_status}</span></>],
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-modal overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Detalhes da transação</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <dl className="p-5 divide-y divide-slate-50 text-xs">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-slate-500 font-medium">{k}</dt>
              <dd className="text-slate-900 font-bold text-right">{v}</dd>
            </div>
          ))}
        </dl>
        {sale.status === 'PENDING' && sale.pix_copia_cola && (
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[11px] font-bold text-slate-600">PIX copia e cola</p>
            <p className="text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 break-all">{sale.pix_copia_cola}</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(sale.pix_copia_cola!);
                setCopied(true);
              }}
              className="w-full bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> {copied ? 'Copiado!' : 'Copiar código PIX'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
