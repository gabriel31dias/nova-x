import React, { useState } from 'react';
import { Key, X, User, Mail, Phone, Building2, Save } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { PixIcon } from '../icons/CustomIcons';
import { TwoFactorModal } from './TwoFactorModal';

// Shape of GET /api/pix-keys -> data.pix_keys[]
export interface ApiPixKey {
  id: number;
  pix_key: string;
  pix_type: PixType;
  label: string | null;
  is_default: boolean;
}

export type PixType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';

export const PIX_TYPES: { id: PixType; label: string; icon: React.FC<{ className?: string }>; placeholder: string }[] = [
  { id: 'CPF', label: 'CPF', icon: User, placeholder: '000.000.000-00' },
  { id: 'CNPJ', label: 'CNPJ', icon: Building2, placeholder: '00.000.000/0001-00' },
  { id: 'EMAIL', label: 'E-mail', icon: Mail, placeholder: 'seuemail@exemplo.com' },
  { id: 'PHONE', label: 'Telefone', icon: Phone, placeholder: '+5511999999999' },
  { id: 'RANDOM', label: 'Aleatória', icon: Key, placeholder: '00000000-0000-0000-0000-000000000000' },
];

export const pixTypeLabel = (t: string) => PIX_TYPES.find((p) => p.id === t)?.label ?? t;

const inputCls =
  'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:border-[#07A33E] outline-none transition-all placeholder:text-slate-400';

interface PixKeyModalProps {
  editing?: ApiPixKey | null; // present = edit (PUT), absent = create (POST)
  onClose: () => void;
  onSaved: (message: string) => void;
}

export const PixKeyModal: React.FC<PixKeyModalProps> = ({ editing, onClose, onSaved }) => {
  const [pixType, setPixType] = useState<PixType>(editing?.pix_type ?? 'CPF');
  const [pixKey, setPixKey] = useState(editing?.pix_key ?? '');
  const [label, setLabel] = useState(editing?.label ?? '');
  const [isDefault, setIsDefault] = useState(editing?.is_default ?? false);
  const [asking2fa, setAsking2fa] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAsking2fa(true);
  };

  const save = async (code: string) => {
    const body = { pix_key: pixKey.trim(), label: label.trim() || undefined, is_default: isDefault };
    const opts = { token: getToken(), headers: { 'X-2FA-Code': code } };
    const r = editing
      ? await api(`/pix-keys/${editing.id}`, { ...opts, method: 'PUT', body })
      : await api('/pix-keys', { ...opts, body: { ...body, pix_type: pixType } });
    onSaved(r.message);
  };

  return (
    <>
    {asking2fa && (
      <TwoFactorModal
        description={`Confirme ${editing ? 'a alteração da' : 'o cadastro da'} chave PIX com o código de 6 dígitos do seu app autenticador.`}
        confirmLabel={editing ? 'Salvar alterações' : 'Cadastrar chave'}
        onConfirm={save}
        onClose={() => setAsking2fa(false)}
      />
    )}
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <PixIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{editing ? 'Editar Chave PIX' : 'Nova Chave PIX'}</h3>
              <p className="text-xs text-slate-500">
                {editing ? 'Altere o valor, o rótulo ou defina como padrão.' : 'Cadastre até 4 chaves PIX para receber seus saques.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {!editing && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Tipo de chave</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PIX_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setPixType(t.id);
                      setPixKey('');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      pixType === t.id ? 'bg-[#07A33E] text-white shadow-sm' : 'bg-[#F8FAFC] border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Chave ({pixTypeLabel(pixType)})</span>
            <input
              required
              maxLength={255}
              placeholder={PIX_TYPES.find((t) => t.id === pixType)?.placeholder}
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Rótulo (opcional)</span>
            <input maxLength={100} placeholder="Ex.: Conta Nubank" value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} />
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
            Usar como chave padrão para saques
          </label>

          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

          <div className="pt-1 flex items-center gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              disabled={!pixKey.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editing ? 'Salvar alterações' : 'Cadastrar chave'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
