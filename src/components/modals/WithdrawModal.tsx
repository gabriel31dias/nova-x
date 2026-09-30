import React, { useEffect, useState } from 'react';
import { Send, X, Loader2, AlertTriangle } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { ApiPixKey, PixKeyModal, pixTypeLabel } from './PixKeyModal';
import { TwoFactorModal } from './TwoFactorModal';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (message: string) => void;
}

interface Ctx {
  available: number;
  fee: number;
  min: number;
  max: number | null;
  enabled: boolean;
  keys: ApiPixKey[];
}

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const parseBRL = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
const toBRLString = (v: number) => v.toFixed(2).replace('.', ',');

export const WithdrawModal: React.FC<WithdrawModalProps> = (props) => (props.isOpen ? <WithdrawModalBody {...props} /> : null);

const WithdrawModalBody: React.FC<WithdrawModalProps> = ({ onClose, onDone }) => {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [keyId, setKeyId] = useState<number | null>(null);
  const [asking2fa, setAsking2fa] = useState(false);
  const [error, setError] = useState('');
  const [addingKey, setAddingKey] = useState(false);

  const load = () => {
    const token = getToken();
    Promise.all([
      api('/withdrawals/balance', { token }),
      api('/pix-keys', { token }),
      api('/transfer-limits', { token }),
      api('/fees/global', { token }).catch(() => null), // fee also comes in /balance; this one is just the preferred source
    ])
      .then(([bal, keys, lim, glob]) => {
        const b = bal.data;
        const l = lim.data;
        const list: ApiPixKey[] = keys.data.pix_keys;
        setCtx({
          available: b.availableAmount,
          fee: parseFloat(glob?.data?.withdrawal_fee ?? b.withdrawalFee) || 0,
          min: l.limits?.min ?? b.minimumWithdrawal,
          max: l.limits?.max ?? null,
          enabled: l.enabled,
          keys: list,
        });
        setKeyId((cur) => cur ?? list.find((k) => k.is_default)?.id ?? list[0]?.id ?? null);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const amount = parseBRL(amountStr);
  const validation = !ctx
    ? ''
    : !ctx.enabled
    ? 'Saques estão desabilitados para sua conta.'
    : amount && amount < ctx.min
    ? `O valor mínimo para saque é ${brl(ctx.min)}.`
    : ctx.max && amount > ctx.max
    ? `O valor máximo por saque é ${brl(ctx.max)}.`
    : amount > ctx.available
    ? 'Valor maior que o saldo disponível.'
    : '';

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAsking2fa(true);
  };

  const send = async (code: string) => {
    const r = await api('/withdrawals', {
      token: getToken(),
      headers: { 'X-2FA-Code': code },
      body: { amount: toBRLString(amount), wallet: 'PIX', selectedPixKey: { id: keyId } },
    });
    onDone(r.msg === 'Withdrawal created successfully' ? `Saque de ${brl(amount)} solicitado.` : r.msg);
  };

  if (addingKey) {
    return (
      <PixKeyModal
        onClose={() => setAddingKey(false)}
        onSaved={() => {
          setAddingKey(false);
          load();
        }}
      />
    );
  }

  return (
    <>
    {asking2fa && (
      <TwoFactorModal
        description={`Confirme o saque de ${brl(amount)} com o código de 6 dígitos do seu app autenticador.`}
        confirmLabel="Confirmar saque"
        onConfirm={send}
        onClose={() => setAsking2fa(false)}
      />
    )}
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleConfirm}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
      >
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Solicitar Saque</h3>
              <p className="text-xs text-slate-500">Transfira seu saldo disponível via PIX.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!ctx ? (
          <div className="px-6 pb-6 flex justify-center text-xs text-rose-600">
            {error || <Loader2 className="w-5 h-5 animate-spin text-[#07A33E]" />}
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Valor</label>
                <span className="text-xs text-slate-500">
                  Disponível: <strong className="text-slate-900">{brl(ctx.available)}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
                <input
                  required
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^\d.,]/g, ''))}
                  className="w-full pl-10 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-base focus:border-[#07A33E] outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setAmountStr(toBRLString(ctx.max ? Math.min(ctx.max, ctx.available) : ctx.available))}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary-50 hover:bg-primary-100 text-[#07A33E] text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  Tudo
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Chave PIX</label>
                {ctx.keys.length < 4 && (
                  <button type="button" onClick={() => setAddingKey(true)} className="text-[11px] font-bold text-[#07A33E] hover:underline">
                    + Nova chave
                  </button>
                )}
              </div>
              {ctx.keys.length ? (
                <select
                  value={keyId ?? ''}
                  onChange={(e) => setKeyId(+e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#07A33E]"
                >
                  {ctx.keys.map((k) => (
                    <option key={k.id} value={k.id}>
                      {pixTypeLabel(k.pix_type)} · {k.pix_key}
                      {k.label ? ` (${k.label})` : ''}
                      {k.is_default ? ' — padrão' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5">
                  Nenhuma chave cadastrada. Cadastre uma para sacar.
                </p>
              )}
            </div>

            <div className="flex justify-between text-xs text-slate-500 bg-[#F8FAFC] border border-slate-100 rounded-xl px-3.5 py-2.5">
              <span>Taxa: {brl(ctx.fee)}</span>
              <span>
                Você recebe <strong className="text-slate-900">{brl(Math.max(0, amount - ctx.fee))}</strong>
              </span>
            </div>

            {(validation || error) && (
              <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {validation || error}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                disabled={!!validation || !amount || !keyId}
                className="flex-1 py-3 rounded-xl bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                Continuar
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
    </>
  );
};
