import React, { useEffect, useState } from 'react';
import { Mail, IdCard, Phone, FileCheck2, Monitor, Smartphone, MapPin, Globe, Clock, History, X, Loader2, ShieldCheck } from 'lucide-react';
import { api, getToken } from '../lib/api';
import { StatCard } from '../components/StatCard';

// GET /api/user/document-info
interface DocumentInfo {
  email: string;
  cpf: string | null;
  phone: string | null;
  documents_approved: boolean;
  documents_count: number;
  documents_by_status: { approved: number; pending: number; refused: number; checking: number };
}

// GET /api/user/access-history -> last_login, history.data[]
interface Access {
  id: number;
  device: string;
  location: string | null;
  ip: string;
  logged_at: string;
}
interface AccessHistory {
  last_login: Access | null;
  history: { data: Access[]; meta: { page: number; per_page: number; total: number; has_next_page: boolean } };
}

const formatDoc = (v: string | null) => {
  if (!v) return 'Não informado';
  const d = v.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return v;
};

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const DeviceIcon: React.FC<{ device: string; className?: string }> = ({ device, className }) =>
  /android|iphone|ipad|ios|mobile/i.test(device) ? <Smartphone className={className} /> : <Monitor className={className} />;

const DOC_STATUS = [
  { key: 'approved', label: 'Aprovados', cls: 'bg-[#DCFCE7] text-[#15803D]' },
  { key: 'pending', label: 'Pendentes', cls: 'bg-[#FEF3C7] text-[#B45309]' },
  { key: 'checking', label: 'Em análise', cls: 'bg-primary-50 text-primary-700' },
  { key: 'refused', label: 'Recusados', cls: 'bg-[#FEE2E2] text-[#B91C1C]' },
] as const;

const Badge: React.FC<{ ok: boolean; yes: string; no: string }> = ({ ok, yes, no }) => (
  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ok ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'}`}>{ok ? yes : no}</span>
);

const InfoRow: React.FC<{ icon: React.FC<{ className?: string }>; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-3 py-3.5">
    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">{label}</span>
    <div className="flex-1 min-w-0 text-right text-xs font-bold text-slate-900 truncate">{children}</div>
  </div>
);

const AccessItem: React.FC<{ a: Access }> = ({ a }) => (
  <div className="flex items-center gap-3 py-3">
    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
      <DeviceIcon device={a.device} className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-900 truncate">{a.device}</p>
      <p className="text-[11px] text-slate-400 truncate">
        {a.location ?? 'Local desconhecido'} · <span className="font-mono">{a.ip}</span>
      </p>
    </div>
    <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">{formatDate(a.logged_at)}</span>
  </div>
);

const Loading = () => (
  <div className="py-10 flex justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />
  </div>
);

export const SettingsScreen: React.FC = () => {
  const [info, setInfo] = useState<DocumentInfo | null>(null);
  const [access, setAccess] = useState<AccessHistory | null>(null);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    // Accept both the documented bare body and the usual { success, data } envelope.
    api('/user/document-info', { token: getToken() })
      .then((r) => setInfo(r.data ?? r))
      .catch((e) => setError(e.message));
    api('/user/access-history?page=1&per_page=10', { token: getToken() })
      .then((r) => {
        const d = r.data?.history ? r.data : r;
        setAccess({ last_login: d.last_login ?? null, history: { data: d.history?.data ?? [], meta: d.history?.meta ?? { page: 1, per_page: 10, total: 0, has_next_page: false } } });
      })
      .catch((e) => setError(e.message));
  }, []);

  const docs = info?.documents_by_status;
  const last = access?.last_login;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Configurações</h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Seus dados cadastrais, documentos e acessos à conta.</p>
      </div>

      {error && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>}

      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard dark icon={FileCheck2} label="Documentos" value={info ? (info.documents_approved ? 'Aprovados' : 'Em análise') : '—'}>
          {info && <span className="text-slate-400 font-medium">{docs?.approved ?? 0} de {info.documents_count} aprovados</span>}
        </StatCard>
        <StatCard icon={IdCard} label="CPF / CNPJ" value={<span className="text-xl">{info ? formatDoc(info.cpf) : '—'}</span>}>
          <span className="text-slate-400 font-medium">Documento do titular</span>
        </StatCard>
        <StatCard icon={Mail} label="E-mail" value={<span className="text-lg block truncate">{info?.email ?? '—'}</span>}>
          <span className="text-slate-400 font-medium">E-mail de acesso</span>
        </StatCard>
        <StatCard icon={Clock} label="Último acesso" value={<span className="text-xl">{last ? formatDate(last.logged_at) : '—'}</span>}>
          <span className="text-slate-400 font-medium truncate block">{last ? `${last.device} · ${last.location ?? 'Local desconhecido'}` : 'Sem acessos registrados'}</span>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados cadastrais */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dados cadastrais</h3>
              <p className="text-xs text-slate-400">Informações vinculadas à sua conta</p>
            </div>
          </div>

          {!info ? (
            <Loading />
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                <InfoRow icon={Mail} label="E-mail">{info.email}</InfoRow>
                <InfoRow icon={IdCard} label="CPF / CNPJ">{formatDoc(info.cpf)}</InfoRow>
                <InfoRow icon={Phone} label="Telefone">{info.phone ? formatPhone(info.phone) : <span className="text-slate-400 font-medium">Não informado</span>}</InfoRow>
                <InfoRow icon={FileCheck2} label="Documentos">
                  <Badge ok={info.documents_approved} yes="Aprovados" no="Em análise" />
                </InfoRow>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {DOC_STATUS.map((s) => (
                  <div key={s.key} className={`rounded-xl px-3 py-2.5 ${s.cls}`}>
                    <p className="text-lg font-extrabold font-display leading-none">{docs?.[s.key] ?? 0}</p>
                    <p className="text-[11px] font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sessões de login */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sessões de login</h3>
                <p className="text-xs text-slate-400">Acessos recentes à sua conta</p>
              </div>
            </div>
            {!!access?.history.data.length && (
              <button onClick={() => setHistoryOpen(true)} className="text-xs font-bold text-[#07A33E] hover:underline whitespace-nowrap">
                Ver histórico
              </button>
            )}
          </div>

          {!access ? (
            <Loading />
          ) : !last ? (
            <p className="py-10 text-center text-xs text-slate-400">Nenhum acesso registrado ainda.</p>
          ) : (
            <>
              <div className="rounded-2xl bg-[#080C0A] text-white p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#07A33E] flex items-center justify-center shrink-0 shadow-md shadow-primary-500/30">
                  <DeviceIcon device={last.device} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#00D15F] uppercase tracking-wider">Último login</p>
                  <p className="text-sm font-bold truncate">{last.device}</p>
                  <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{last.location ?? 'Local desconhecido'}</span>
                    <span className="flex items-center gap-1 font-mono"><Globe className="w-3 h-3" />{last.ip}</span>
                  </p>
                </div>
                <span className="text-[11px] text-slate-300 whitespace-nowrap self-start">{formatDate(last.logged_at)}</span>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {access.history.data.slice(1, 5).map((a) => (
                  <AccessItem key={a.id} a={a} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {historyOpen && access && <HistoryModal access={access} onClose={() => setHistoryOpen(false)} />}
    </div>
  );
};

// Reuses the page-1 data already loaded by the screen (no extra request).
const HistoryModal: React.FC<{ access: AccessHistory; onClose: () => void }> = ({ access, onClose }) => {
  const { data, meta } = access.history;
  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Histórico de acessos</h3>
              <p className="text-xs text-slate-500">
                Mostrando {data.length} de {meta.total} acessos. O IP é exibido mascarado.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-y border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Dispositivo</th>
                <th className="py-3.5 px-3 font-semibold">Local</th>
                <th className="py-3.5 px-3 font-semibold">IP</th>
                <th className="py-3.5 px-6 font-semibold text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <DeviceIcon device={a.device} className="w-4 h-4 text-slate-400 shrink-0" />
                      {a.device}
                      {i === 0 && <span className="px-2 py-0.5 rounded-md bg-primary-50 text-[#07A33E] text-[10px] font-bold">Último</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{a.location ?? '—'}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">{a.ip}</td>
                  <td className="py-3.5 px-6 text-right text-slate-500 whitespace-nowrap">{formatDate(a.logged_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
