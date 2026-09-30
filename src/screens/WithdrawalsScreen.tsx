import React, { useCallback, useEffect, useState } from 'react';
import {
  Wallet,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  User,
  Percent,
  History,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { WithdrawModal } from '../components/modals/WithdrawModal';
import { pixTypeLabel } from '../components/modals/PixKeyModal';
import { api, getToken } from '../lib/api';

interface WithdrawalsScreenProps {
  onNotify: (message: string) => void;
}

// GET /api/withdrawals/balance -> data
interface Balance {
  availableAmount: number;
  pendingAmount: number;
  totalWithdrawn: number;
  minimumWithdrawal: number;
  withdrawalFee: number;
}

// GET /api/withdrawals/history -> data.withdrawals[]
interface ApiWithdrawal {
  id: number;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  status: string;
  requested_at: string;
  confirmed_at: string | null;
  pix_data: { pix_key: string; pix_type: string; label: string | null } | null;
}

interface Limits {
  enabled: boolean;
  limits: { min: number; max: number };
}

interface BankData {
  name: string;
  email: string;
  cpf_cnpj: string;
  type: string;
  pix_key: { key: string; type: string } | null;
}

type Fees = Record<string, string | number | null>;

const STATUS: Record<string, [string, string]> = {
  PENDING: ['Pendente', 'bg-[#FEF3C7] text-[#B45309]'],
  EXECUTED: ['Concluído', 'bg-[#DCFCE7] text-[#15803D]'],
  EXECUTED_MANUALLY: ['Concluído', 'bg-[#DCFCE7] text-[#15803D]'],
  FAILED: ['Falhou', 'bg-[#FEE2E2] text-[#B91C1C]'],
};

const brl = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
const pctFmt = (v: string | number | null | undefined) => `${(Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
const dateFmt = (s: string | null) => (s && !isNaN(Date.parse(s)) ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : s ?? '—');

const TABS = [
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'bank', label: 'Dados bancários', icon: User },
  { id: 'fees', label: 'Taxas', icon: Percent },
] as const;

export const WithdrawalsScreen: React.FC<WithdrawalsScreenProps> = ({ onNotify }) => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [history, setHistory] = useState<ApiWithdrawal[] | null>(null);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [bank, setBank] = useState<BankData | null>(null);
  const [fees, setFees] = useState<Fees | null>(null);
  const [withdrawalFee, setWithdrawalFee] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('history');
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const load = useCallback(() => {
    const token = getToken();
    const fail = (e: Error) => setError(e.message);
    api('/withdrawals/balance', { token }).then((r) => setBalance(r.data)).catch(fail);
    api('/withdrawals/history', { token }).then((r) => setHistory(r.data.withdrawals)).catch(fail);
    api('/transfer-limits', { token }).then((r) => setLimits(r.data)).catch(fail);
    api('/bank-data', { token }).then((r) => setBank(r.data)).catch(fail);
    api('/fees', { token }).then((r) => setFees(r.data)).catch(fail);
    api('/fees/global', { token }).then((r) => setWithdrawalFee(parseFloat(r.data.withdrawal_fee))).catch(fail);
  }, []);

  useEffect(load, [load]);

  const fee = withdrawalFee ?? balance?.withdrawalFee ?? 0;
  const executed = history?.filter((w) => w.status.startsWith('EXECUTED')).length ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Saques</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Solicite e acompanhe seus saques de forma rápida e segura.</p>
        </div>
        <button
          onClick={() => setWithdrawOpen(true)}
          disabled={limits?.enabled === false}
          className="bg-[#07A33E] hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/25 transition-all transform active:scale-98"
        >
          <Send className="w-4 h-4" />
          <span>Solicitar Saque</span>
        </button>
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
      )}
      {limits?.enabled === false && (
        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Saques estão desabilitados para sua conta. Fale com o suporte.
        </p>
      )}

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Saldo Disponível', value: balance?.availableAmount, icon: Wallet, hint: 'Liberado para saque', hintCls: 'text-emerald-600 font-bold' },
          { label: 'A Liberar', value: balance?.pendingAmount, icon: Clock, hint: 'Vendas aguardando o prazo de liberação', hintCls: 'text-slate-400' },
          { label: 'Total Sacado', value: balance?.totalWithdrawn, icon: CheckCircle2, hint: `${executed} saque(s) concluído(s)`, hintCls: 'text-slate-400' },
        ].map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={balance ? brl(c.value) : <Loader2 className="w-5 h-5 animate-spin text-slate-300" />}>
            <span className={c.hintCls}>{c.hint}</span>
          </StatCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-4 border-b border-slate-100 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 pb-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id ? 'border-[#07A33E] text-[#07A33E]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4 font-semibold">ID</th>
                  <th className="py-4 px-4 font-semibold">Solicitado em</th>
                  <th className="py-4 px-4 font-semibold">Valor</th>
                  <th className="py-4 px-4 font-semibold">Taxa</th>
                  <th className="py-4 px-4 font-semibold">Líquido</th>
                  <th className="py-4 px-4 font-semibold">Destino (PIX)</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history?.map((w) => {
                  const [label, cls] = STATUS[w.status] ?? [w.status, 'bg-slate-100 text-slate-600'];
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">#{w.id}</td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">{dateFmt(w.requested_at)}</td>
                      <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">{brl(w.gross_amount)}</td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">- {brl(w.fee_amount)}</td>
                      <td className="py-4 px-4 font-extrabold text-slate-900 whitespace-nowrap">{brl(w.net_amount)}</td>
                      <td className="py-4 px-4">
                        {w.pix_data ? (
                          <>
                            <p className="font-bold text-slate-800 font-mono">{w.pix_data.pix_key}</p>
                            <p className="text-[11px] text-slate-400">{pixTypeLabel(w.pix_data.pix_type)}{w.pix_data.label ? ` • ${w.pix_data.label}` : ''}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${cls}`}>{label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!history && <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" /></div>}
            {history?.length === 0 && <p className="py-12 text-center text-xs text-slate-400">Nenhum saque realizado ainda.</p>}
          </div>
        )}

        {tab === 'bank' && (
          <dl className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {bank ? (
              [
                ['Titular', bank.name],
                ['E-mail', bank.email],
                [bank.type === 'PJ' ? 'CNPJ' : 'CPF', bank.cpf_cnpj],
                ['Tipo de conta', bank.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'],
                ['Chave PIX padrão', bank.pix_key ? `${bank.pix_key.key} (${pixTypeLabel(bank.pix_key.type)})` : 'Nenhuma'],
              ].map(([k, v]) => (
                <div key={k} className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
                  <dt className="text-slate-500 font-medium">{k}</dt>
                  <dd className="text-slate-900 font-bold mt-1 break-all">{v}</dd>
                </div>
              ))
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />
            )}
          </dl>
        )}

        {tab === 'fees' && (
          <div className="p-5 space-y-4 text-xs">
            {fees ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ['PIX', fees.pix, fees.fixed_fee_pix, fees.days_release_money_sale_pix],
                    ['Cartão', fees.card, fees.fixed_fee_card, fees.days_release_money_sale_card],
                    ['Boleto', fees.boleto, fees.fixed_fee_boleto, fees.days_release_money_sale_boleto],
                  ].map(([name, pct, fixed, days]) => (
                    <div key={name as string} className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{name}</p>
                      <p className="text-2xl font-extrabold text-slate-900 font-display mt-2">{pctFmt(pct)}</p>
                      <p className="text-slate-500 mt-1">+ {brl(fixed ?? fees.fixed_fee)} por venda</p>
                      <p className="text-slate-500">Liberação em D+{days ?? 0}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
                  <span>Plano: <strong>{fees.plan}</strong></span>
                  <span>Taxa de saque: <strong>{brl(fee)}</strong></span>
                  {Number(fees.pix_reserve_percentage) > 0 && (
                    <span>Reserva PIX: <strong>{pctFmt(fees.pix_reserve_percentage)} por {fees.pix_reserve_days} dias</strong></span>
                  )}
                </div>
              </>
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />
            )}
          </div>
        )}
      </div>

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onDone={(msg) => {
          setWithdrawOpen(false);
          onNotify(msg);
          load();
        }}
      />
    </div>
  );
};
