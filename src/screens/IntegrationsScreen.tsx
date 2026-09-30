import React, { useEffect, useState } from 'react';
import { Key, Webhook, Copy, Check, ExternalLink, Eye, EyeOff, Plus, Trash2, Loader2, X, ShieldCheck, Globe } from 'lucide-react';
import { api, getToken } from '../lib/api';

// GET /api/api-keys -> data[]
interface ApiKey {
  id: number;
  name: string;
  public_key: string;
  secret_key: string;
}

// GET /api/webhooks -> data[]
interface ApiWebhook {
  id: number;
  name: string;
  url: string;
  product: { id: number; name: string } | null;
  events: { id: number; name: string }[];
}

interface Product {
  id: number;
  name: string;
}

// ponytail: the API has no endpoint listing events; ids copied from the official panel (ApiPage bundle).
const EVENTS = [
  { id: 3, label: 'Pagamento Aprovado' },
  { id: 4, label: 'Pagamento Recusado' },
  { id: 2, label: 'Pagamento Pendente' },
  { id: 5, label: 'Pagamento Reembolsado' },
];

const TABS = [
  { id: 'keys', label: 'Chaves de API', icon: Key },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'pixout', label: 'PIX Out', icon: Globe },
] as const;

const eventLabel = (e: { id: number; name: string }) => EVENTS.find((x) => x.id === e.id)?.label ?? e.name;

const KeyField: React.FC<{ label: string; value: string; secret?: boolean }> = ({ label, value, secret }) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(!secret);
  return (
    <div>
      <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={visible ? 'text' : 'password'}
          readOnly
          value={value}
          className="w-full font-mono text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800"
        />
        {secret && (
          <button
            onClick={() => setVisible(!visible)}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
            title={visible ? 'Ocultar' : 'Mostrar'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
          title="Copiar"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export const IntegrationsScreen: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [webhooks, setWebhooks] = useState<ApiWebhook[] | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('keys');

  const loadWebhooks = () =>
    api('/webhooks', { token: getToken() })
      .then((r) => setWebhooks(r.data))
      .catch((e) => setError(e.message));

  useEffect(() => {
    api('/api-keys', { token: getToken() })
      .then((r) => setKeys(r.data))
      .catch((e) => setError(e.message));
    loadWebhooks();
  }, []);

  const deleteWebhook = async (w: ApiWebhook) => {
    if (!confirm(`Remover o webhook "${w.name}"?`)) return;
    setDeletingId(w.id);
    try {
      await api(`/webhooks/${w.id}`, { method: 'DELETE', token: getToken() });
      setWebhooks((list) => list?.filter((x) => x.id !== w.id) ?? null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Integrações & API</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Use suas chaves de API e receba eventos das vendas via webhooks.
          </p>
        </div>

        <button
          onClick={() => window.open('/docs', '_blank')}
          className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4 text-primary-500" />
          <span>Documentação da API</span>
        </button>
      </div>

      {error && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit max-w-full overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-white text-[#07A33E] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* API Keys */}
      {tab === 'keys' && <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Chaves de Acesso à API</h3>
            <p className="text-xs text-slate-400">Envie nos headers X-Public-Key e X-Secret-Key</p>
          </div>
        </div>

        {!keys ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />
        ) : (
          keys.map((k) => (
            <div key={k.id} className="space-y-3">
              {keys.length > 1 && <p className="text-xs font-bold text-slate-500">{k.name}</p>}
              <KeyField label="Chave Pública (Public Key)" value={k.public_key} />
              <KeyField label="Chave Secreta (Secret Key)" value={k.secret_key} secret />
            </div>
          ))
        )}
      </div>}

      {/* Webhooks */}
      {tab === 'webhooks' && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center">
              <Webhook className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Webhooks</h3>
              <p className="text-xs text-slate-400">Receba notificações das suas vendas em tempo real</p>
            </div>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-primary-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Webhook</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-y border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Nome</th>
                <th className="py-3.5 px-3 font-semibold">URL</th>
                <th className="py-3.5 px-3 font-semibold">Produto</th>
                <th className="py-3.5 px-3 font-semibold">Eventos</th>
                <th className="py-3.5 px-6 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {webhooks?.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{w.name}</td>
                  <td className="py-4 px-3 font-mono text-slate-600 max-w-[280px] truncate" title={w.url}>{w.url}</td>
                  <td className="py-4 px-3 text-slate-700 font-medium">{w.product?.name ?? 'Todos os produtos'}</td>
                  <td className="py-4 px-3">
                    <div className="flex flex-wrap gap-1">
                      {w.events.length ? (
                        w.events.map((e) => (
                          <span key={e.id} className="px-2 py-0.5 rounded-md bg-primary-50 text-[#07A33E] text-[10px] font-bold">{eventLabel(e)}</span>
                        ))
                      ) : (
                        <span className="text-slate-400">Todos</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => deleteWebhook(w)}
                      disabled={deletingId === w.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Remover webhook"
                    >
                      {deletingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!webhooks && <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" /></div>}
          {webhooks?.length === 0 && (
            <p className="py-10 text-center text-xs text-slate-400">
              Nenhum webhook configurado ainda. Crie o primeiro para receber os eventos das suas vendas.
            </p>
          )}
        </div>
      </div>}

      {tab === 'pixout' && <AllowedIpsCard />}

      {creating && (
        <CreateWebhookModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            loadWebhooks();
          }}
        />
      )}
    </div>
  );
};

const CreateWebhookModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<number[]>([]);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Same as the official panel: no params, so only the API's first page of products.
    api('/products', { token: getToken() })
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]));
  }, []);

  const toggle = (list: number[], set: (v: number[]) => void, id: number) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/webhooks', {
        token: getToken(),
        body: { name, url, events, ...(productIds.length ? { products: productIds } : {}) },
      });
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:border-[#07A33E] outline-none placeholder:text-slate-400';
  const chipCls = (on: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
      on ? 'bg-[#07A33E] border-[#07A33E] text-white' : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <form onSubmit={submit} className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Novo Webhook</h3>
              <p className="text-xs text-slate-500">Enviaremos um POST para a URL a cada evento.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Nome</span>
            <input required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Meu ERP" className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">URL</span>
            <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://seusite.com/webhook" className={inputCls} />
          </label>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Eventos</span>
            <div className="flex flex-wrap gap-2">
              {EVENTS.map((ev) => (
                <button key={ev.id} type="button" onClick={() => toggle(events, setEvents, ev.id)} className={chipCls(events.includes(ev.id))}>
                  {ev.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5">
              Produtos <span className="font-medium text-slate-400">(nenhum selecionado = todos)</span>
            </span>
            {!products ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#07A33E]" />
            ) : products.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum produto encontrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {products.map((p) => (
                  <button key={p.id} type="button" onClick={() => toggle(productIds, setProductIds, p.id)} className={chipCls(productIds.includes(p.id))}>
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              disabled={saving || !events.length}
              className="flex-1 py-3 rounded-xl bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Criar Webhook
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// GET /api/pix-out/allowed-ips -> data.ips[]
interface AllowedIp {
  id: number;
  ip: string;
  description: string | null;
  created_at: string;
}

const AllowedIpsCard: React.FC = () => {
  const [ips, setIps] = useState<AllowedIp[] | null>(null);
  const [currentIp, setCurrentIp] = useState('');
  const [ip, setIp] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () =>
    api('/pix-out/allowed-ips', { token: getToken() })
      .then((r) => {
        setIps(r.data.ips);
        setCurrentIp(r.data.current_ip);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const r = await api('/pix-out/allowed-ips', {
        token: getToken(),
        headers: { 'X-2FA-Code': code },
        body: { ip: ip.trim(), description: description.trim() || null },
      });
      setMessage(r.message);
      setIp('');
      setDescription('');
      setCode('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AllowedIp) => {
    // ponytail: native prompt for the 2FA code; swap for a modal if it bothers anyone.
    const c = prompt(`Remover ${item.ip}?\nInforme o código do app autenticador:`)?.replace(/\D/g, '');
    if (!c) return;
    setError('');
    setMessage('');
    setDeletingId(item.id);
    try {
      const r = await api(`/pix-out/allowed-ips/${item.id}`, { method: 'DELETE', token: getToken(), headers: { 'X-2FA-Code': c } });
      setMessage(r.message);
      setIps((list) => list?.filter((x) => x.id !== item.id) ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:border-[#07A33E] outline-none placeholder:text-slate-400';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 pb-4 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">IPs autorizados para PIX Out</h3>
            <p className="text-xs text-slate-400">A rota /v1/pix-out só aceita chamadas destes IPs (máx. 20). Aceita IPv4, IPv6 ou faixa CIDR.</p>
          </div>
        </div>

        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-2 items-end">
          <label className="block">
            <span className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
              IP ou faixa CIDR
              {currentIp && (
                <button type="button" onClick={() => setIp(currentIp)} className="text-[11px] font-semibold text-[#07A33E] hover:underline">
                  Usar meu IP ({currentIp})
                </button>
              )}
            </span>
            <input required maxLength={64} value={ip} onChange={(e) => setIp(e.target.value)} placeholder="203.0.113.10 ou 203.0.113.0/24" className={inputCls + ' font-mono'} />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Descrição (opcional)</span>
            <input maxLength={255} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Servidor produção" className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Código 2FA
            </span>
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={inputCls + ' tracking-[0.3em] text-center font-bold'}
            />
          </label>
          <button
            disabled={saving || code.length !== 6}
            className="bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/25 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Autorizar IP
          </button>
        </form>

        {error && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>}
        {message && <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">{message}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-y border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6 font-semibold">IP</th>
              <th className="py-3.5 px-3 font-semibold">Descrição</th>
              <th className="py-3.5 px-3 font-semibold">Cadastrado em</th>
              <th className="py-3.5 px-6 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ips?.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">{i.ip}</td>
                <td className="py-4 px-3 text-slate-700 font-medium">{i.description ?? '—'}</td>
                <td className="py-4 px-3 text-slate-500">{new Date(i.created_at).toLocaleString('pt-BR')}</td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => remove(i)}
                    disabled={deletingId === i.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Remover IP"
                  >
                    {deletingId === i.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!ips && !error && <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" /></div>}
        {ips?.length === 0 && (
          <p className="py-10 text-center text-xs text-slate-400">
            Nenhum IP autorizado. Enquanto a lista estiver vazia, a API de PIX Out responde 403 PIX_OUT_IP_NOT_CONFIGURED.
          </p>
        )}
      </div>
    </div>
  );
};
