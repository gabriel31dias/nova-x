import React, { useEffect, useState } from 'react';
import { Landmark, Star, LifeBuoy, FlaskConical, Loader2, Save, Play, Square, Check } from 'lucide-react';
import { api, getToken } from '../lib/api';

// GET /api/gateway-accounts -> data[]
interface GatewayAccount {
  id: number;
  name: string;
  default?: boolean;
  gateway?: { id: number; name: string; show_in_front?: boolean } | null;
}

// GET /api/gateway-accounts/backups -> data[]
interface Backup {
  id: number;
  gateway_account_id: number;
  priority: number;
  gateway_account?: GatewayAccount;
}

// GET /api/gateway-ab-tests/active -> data
interface AbTest {
  id: number;
  name: string;
  status: string;
  created_at?: string;
  items: {
    id: number;
    gateway_account_id: number;
    pix_quantity: number;
    pix_generated: number;
    pix_paid: number;
    conversion_rate: number;
    gateway_account?: GatewayAccount;
  }[];
}

const SLOTS = [1, 2, 3];

// The admin picks which acquirers sellers see (gateway.show_in_front); the API still returns all active ones.
const isVisible = (a: GatewayAccount) => a.gateway?.show_in_front !== false;

// Visible accounts plus the one already in use, so a hidden-but-selected acquirer still shows in its select.
const withCurrent = (list: GatewayAccount[], current?: GatewayAccount | null) =>
  current && !list.some((a) => a.id === current.id) ? [...list, current] : list;

const accLabel = (a?: GatewayAccount | null) => a?.gateway?.name ?? a?.name ?? '—';

const Card: React.FC<{ icon: React.FC<{ className?: string }>; title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = '',
}) => (
  <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Feedback: React.FC<{ error?: string; success?: string }> = ({ error, success }) =>
  error ? (
    <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
  ) : success ? (
    <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-1.5">
      <Check className="w-4 h-4" />
      {success}
    </p>
  ) : null;

const Loading = () => (
  <div className="py-10 flex justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />
  </div>
);

const selectCls =
  'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:border-[#07A33E] outline-none disabled:bg-slate-50';
const btnCls =
  'bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/25 transition-all';

export const AcquirersScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<GatewayAccount[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/gateway-accounts', { token: getToken() })
      .then((r) => setAccounts((r.data ?? []).filter(isVisible)))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Adquirentes</h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Escolha por qual adquirente seus Pix são gerados, defina contingências e compare adquirentes com testes A/B.
        </p>
      </div>

      <Feedback error={error} />

      {!accounts ? (
        !error && <Loading />
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
          <Landmark className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700 mt-3">Nenhuma adquirente ativa</p>
          <p className="text-xs text-slate-400 mt-1">Fale com o suporte para habilitar adquirentes na sua conta.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DefaultPixCard accounts={accounts} />
            <BackupsCard accounts={accounts} />
          </div>
          <AbTestCard accounts={accounts} />
        </>
      )}
    </div>
  );
};

const DefaultPixCard: React.FC<{ accounts: GatewayAccount[] }> = ({ accounts }) => {
  const [current, setCurrent] = useState<{ source: string; data: GatewayAccount | null } | null>(null);
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api('/gateway-accounts/default-pix', { token: getToken() })
      .then((r) => {
        setCurrent({ source: r.source, data: r.data });
        if (r.source === 'user') setSelected(String(r.data.id));
      })
      .catch((e) => (e.status === 404 ? setCurrent({ source: 'none', data: null }) : setError(e.message)));
  }, []);

  const save = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const r = await api('/gateway-accounts/default-pix', { method: 'PUT', token: getToken(), body: { gateway_account_id: Number(selected) } });
      setCurrent({ source: 'user', data: r.data });
      setSuccess('Adquirente padrão do Pix atualizada.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const unchanged = current?.source === 'user' && String(current.data?.id) === selected;

  return (
    <Card icon={Star} title="Adquirente padrão do Pix" subtitle="Usada para gerar todos os seus Pix">
      {!current ? (
        !error ? <Loading /> : <Feedback error={error} />
      ) : (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="rounded-2xl bg-[#080C0A] text-white p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#07A33E] flex items-center justify-center shrink-0 shadow-md shadow-primary-500/30">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#00D15F] uppercase tracking-wider">Em uso agora</p>
              <p className="text-lg font-bold font-display truncate">{current.data ? accLabel(current.data) : 'Nenhuma configurada'}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 whitespace-nowrap">
              {current.source === 'user' ? 'Escolhida por você' : current.source === 'system' ? 'Padrão da plataforma' : 'Sem padrão'}
            </span>
          </div>

          <div className="mt-auto space-y-3">
            <label className="block">
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Trocar adquirente</span>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} className={selectCls}>
                <option value="" disabled>
                  Selecione uma adquirente
                </option>
                {withCurrent(accounts, current.source === 'user' ? current.data : null).map((a) => (
                  <option key={a.id} value={a.id}>
                    {accLabel(a)}
                  </option>
                ))}
              </select>
            </label>
            <Feedback error={error} success={success} />
            <button onClick={save} disabled={saving || !selected || unchanged} className={btnCls + ' w-full'}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar adquirente padrão
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

const BackupsCard: React.FC<{ accounts: GatewayAccount[] }> = ({ accounts }) => {
  const [saved, setSaved] = useState<Record<number, number> | null>(null); // priority -> gateway_account_id
  const [savedAccounts, setSavedAccounts] = useState<Record<number, GatewayAccount | undefined>>({}); // priority -> account
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apply = (list: Backup[]) => {
    const map: Record<number, number> = {};
    list.forEach((b) => (map[b.priority] = b.gateway_account_id));
    setSaved(map);
    setSavedAccounts(Object.fromEntries(list.map((b) => [b.priority, b.gateway_account])));
    setSlots(Object.fromEntries(SLOTS.map((p) => [p, map[p] ? String(map[p]) : ''])));
  };

  useEffect(() => {
    api('/gateway-accounts/backups', { token: getToken() })
      .then((r) => apply(r.data ?? []))
      .catch((e) => setError(e.message));
  }, []);

  const chosen = SLOTS.filter((p) => slots[p]);
  const duplicated = new Set(chosen.map((p) => slots[p])).size !== chosen.length;
  const dirty = saved && SLOTS.some((p) => (saved[p] ? String(saved[p]) : '') !== slots[p]);

  const save = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const r = await api('/gateway-accounts/backups', {
        method: 'PUT',
        token: getToken(),
        body: { backups: chosen.map((p) => ({ gateway_account_id: Number(slots[p]), priority: p })) },
      });
      apply(r.data ?? []);
      setSuccess('Contingências atualizadas.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card icon={LifeBuoy} title="Adquirentes de contingência" subtitle="Usadas em ordem se a principal falhar (até 3)">
      {!saved ? (
        !error ? <Loading /> : <Feedback error={error} />
      ) : (
        <div className="space-y-3 flex-1 flex flex-col">
          {SLOTS.map((p) => (
            <div key={p} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center justify-center shrink-0">{p}º</span>
              <select value={slots[p]} onChange={(e) => setSlots({ ...slots, [p]: e.target.value })} className={selectCls}>
                {/* ponytail: the API only writes the priorities sent, so a saved slot can be swapped but not emptied. */}
                <option value="" disabled={!!saved[p]}>
                  Nenhuma
                </option>
                {withCurrent(accounts, savedAccounts[p]).map((a) => (
                  <option key={a.id} value={a.id}>
                    {accLabel(a)}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <p className="text-[11px] text-slate-400">Uma posição já salva pode ser trocada, mas não esvaziada.</p>

          <div className="mt-auto space-y-3">
            <Feedback error={error || (duplicated ? 'A mesma adquirente não pode ocupar duas posições.' : '')} success={success} />
            <button onClick={save} disabled={saving || !dirty || duplicated || !chosen.length} className={btnCls + ' w-full'}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar contingências
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

const AbTestCard: React.FC<{ accounts: GatewayAccount[] }> = ({ accounts }) => {
  const [test, setTest] = useState<AbTest | null | undefined>(undefined); // undefined = loading, null = none running
  const [name, setName] = useState('');
  const [qty, setQty] = useState<Record<number, string>>({}); // gateway_account_id -> pix_quantity ('' = not in test)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    api('/gateway-ab-tests/active', { token: getToken() })
      .then((r) => setTest(r.has_active_test ? r.data : null))
      .catch((e) => {
        setTest(null);
        setError(e.message);
      });

  useEffect(() => {
    load();
  }, []);

  const picked = accounts.filter((a) => qty[a.id] !== undefined);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const r = await api('/gateway-ab-tests', {
        token: getToken(),
        body: { name: name.trim(), gateways: picked.map((a) => ({ gateway_account_id: a.id, pix_quantity: Number(qty[a.id]) })) },
      });
      setSuccess(r.message);
      setName('');
      setQty({});
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!test || !confirm(`Encerrar o teste "${test.name}"? Essa ação não pode ser desfeita.`)) return;
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const r = await api(`/gateway-ab-tests/${test.id}/cancel`, { method: 'PUT', token: getToken() });
      setSuccess(r.message);
      setTest(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const best = test && Math.max(...test.items.map((i) => i.conversion_rate));

  return (
    <Card
      icon={FlaskConical}
      title="Teste A/B de adquirentes"
      subtitle="Divida seus Pix entre adquirentes e compare a conversão de cada uma"
      action={
        test && (
          <button
            onClick={cancel}
            disabled={busy}
            className="border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
            Encerrar teste
          </button>
        )
      }
    >
      <div className="space-y-4">
        <Feedback error={error} success={success} />

        {test === undefined ? (
          <Loading />
        ) : test ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-slate-900">{test.name}</span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Em execução
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {test.items.map((i) => {
                const pct = i.pix_quantity ? Math.min(100, (i.pix_generated / i.pix_quantity) * 100) : 0;
                const leader = test.items.length > 1 && i.pix_generated > 0 && i.conversion_rate === best;
                return (
                  <div key={i.id} className={`rounded-2xl border p-4 ${leader ? 'border-[#07A33E] bg-primary-50/40' : 'border-slate-100 bg-[#F8FAFC]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{accLabel(i.gateway_account ?? accounts.find((a) => a.id === i.gateway_account_id))}</p>
                      {leader && <span className="px-2 py-0.5 rounded-md bg-[#07A33E] text-white text-[10px] font-bold">Liderando</span>}
                    </div>
                    <p className="text-3xl font-extrabold font-display text-slate-900 mt-3">
                      {Number(i.conversion_rate).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400">conversão</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                        <span>
                          {i.pix_generated} de {i.pix_quantity} Pix gerados
                        </span>
                        <span className="text-slate-700">{i.pix_paid} pagos</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-[#07A33E] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <form onSubmit={create} className="space-y-4">
            <label className="block max-w-md">
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Nome do teste</span>
              <input
                required
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Pagarme x Asaas"
                className={selectCls + ' font-medium placeholder:text-slate-400'}
              />
            </label>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Adquirentes no teste (mínimo 2) e quantidade de Pix de cada uma</span>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {accounts.map((a) => {
                  const on = qty[a.id] !== undefined;
                  return (
                    <div key={a.id} className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${on ? 'border-[#07A33E] bg-primary-50/40' : 'border-slate-200 bg-white'}`}>
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => {
                            const next = { ...qty };
                            if (on) delete next[a.id];
                            else next[a.id] = '50';
                            setQty(next);
                          }}
                          className="w-4 h-4 rounded border-slate-300 accent-[#07A33E]"
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">{accLabel(a)}</span>
                      </label>
                      {on && (
                        <div className="flex items-center gap-1.5">
                          <input
                            required
                            type="number"
                            min={1}
                            value={qty[a.id]}
                            onChange={(e) => setQty({ ...qty, [a.id]: e.target.value })}
                            className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right outline-none focus:border-[#07A33E]"
                          />
                          <span className="text-[11px] font-semibold text-slate-400">Pix</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {accounts.length < 2 && <p className="text-[11px] text-slate-400 mt-2">Você precisa de pelo menos 2 adquirentes ativas para criar um teste.</p>}
            </div>

            <button disabled={busy || picked.length < 2} className={btnCls}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Iniciar teste A/B
            </button>
          </form>
        )}
      </div>
    </Card>
  );
};
