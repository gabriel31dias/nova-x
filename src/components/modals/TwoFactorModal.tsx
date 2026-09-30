import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, X, Loader2 } from 'lucide-react';

interface TwoFactorModalProps {
  description: string;
  confirmLabel?: string;
  onConfirm: (code: string) => Promise<void>; // reject with Error to show its message here
  onClose: () => void;
}

// Asks for the authenticator app code on top of the modal that triggered the action (X-2FA-Code).
export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ description, confirmLabel = 'Confirmar', onConfirm, onClose }) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  // The input is disabled while sending, which drops focus; give it back after a wrong code.
  useEffect(() => {
    if (!busy) input.current?.focus();
  }, [busy]);

  const submit = async (value = code) => {
    setError('');
    setBusy(true);
    try {
      await onConfirm(value);
    } catch (e: any) {
      setError(e.message);
      setCode('');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 !mt-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="px-6 pt-5 flex justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#07A33E] text-white flex items-center justify-center shadow-md shadow-primary-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Código do autenticador</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
          </div>

          <input
            ref={input}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            disabled={busy}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              if (v.length === 6) submit(v); // submit as soon as the 6th digit lands
            }}
            className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-slate-900 text-2xl font-extrabold font-display tracking-[0.5em] text-center outline-none focus:border-[#07A33E] focus:bg-white placeholder:text-slate-300 disabled:opacity-60"
          />

          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} disabled={busy} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Voltar
            </button>
            <button
              disabled={busy || code.length !== 6}
              className="flex-1 py-3 rounded-xl bg-[#07A33E] hover:bg-primary-600 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
