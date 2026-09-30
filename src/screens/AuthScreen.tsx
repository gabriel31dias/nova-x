import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { api, setToken } from '../lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

type Mode = 'login' | '2fa' | 'register';

const inputCls =
  'w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#07A33E] focus:ring-2 focus:ring-[#07A33E]/30 transition';
const btnCls =
  'w-full h-11 rounded-xl bg-[#07A33E] hover:bg-[#058A33] disabled:opacity-60 text-sm font-bold text-white flex items-center justify-center gap-2 transition green-glow';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-semibold text-slate-300">{label}</span>
    {children}
  </label>
);

const ErrorBox: React.FC<{ msg: string }> = ({ msg }) =>
  msg ? <p className="text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{msg}</p> : null;

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preToken, setPreToken] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);

  // 2fa
  const [qr, setQr] = useState<{ confirmed: boolean; qrCodeUrl?: string; secret?: string } | null>(null);
  const [otp, setOtp] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [finalToken, setFinalToken] = useState('');

  useEffect(() => {
    api('/branding').then((r) => setBanner(r.data?.login_banner ?? null)).catch(() => {});
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const r = await api('/login', { body: { email, password } });
      setPreToken(r.token);
      setUser(r.user);
      setQr((await api('/2fa/form', { token: r.token })).data);
      setOtp('');
      setMode('2fa');
    });
  };

  const handle2fa = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const r = useBackup
        ? await api('/2fa/backup-code', { token: preToken, body: { backup_code: otp.trim() } })
        : await api('/2fa/verify', { token: preToken, body: { one_time_password: otp } });
      if (r.backup_codes?.length) {
        // First confirmation: codes are shown only once, so hold here until the user saves them.
        setFinalToken(r.token);
        setBackupCodes(r.backup_codes);
        return;
      }
      setToken(r.token);
      onAuthenticated(user!);
    });
  };

  const finishWithBackupCodes = () => {
    setToken(finalToken);
    onAuthenticated(user!);
  };

  const goLogin = (prefillEmail?: string) => {
    if (prefillEmail) setEmail(prefillEmail);
    setError('');
    setMode('login');
  };

  return (
    <div className="min-h-screen w-full bg-[#050A07] text-white flex">
      {/* Banner (desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {banner ? (
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover object-left" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#07A33E]/40 via-[#050A07] to-[#00D15F]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050A07]" />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <Logo size="lg" />

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h1 className="text-2xl font-display font-bold">Entrar na sua conta</h1>
                <p className="text-sm text-slate-400 mt-1">Acesse o painel com seu e-mail e senha.</p>
              </div>
              <Field label="E-mail">
                <input type="email" required autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
              </Field>
              <Field label="Senha">
                <input type="password" required autoComplete="current-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </Field>
              <ErrorBox msg={error} />
              <button className={btnCls} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Entrar
              </button>
              <p className="text-center text-sm text-slate-400">
                Não tem conta?{' '}
                <button type="button" onClick={() => { setError(''); setMode('register'); }} className="font-bold text-[#00D15F] hover:underline">
                  Cadastre-se
                </button>
              </p>
            </form>
          )}

          {mode === '2fa' && !backupCodes && (
            <form onSubmit={handle2fa} className="space-y-4">
              <button type="button" onClick={() => goLogin()} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#00D15F]" />
                  {qr?.confirmed ? 'Verificação em duas etapas' : 'Configure a verificação em duas etapas'}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {useBackup
                    ? 'Digite um dos seus códigos de recuperação.'
                    : qr?.confirmed
                    ? 'Digite o código de 6 dígitos do seu app autenticador.'
                    : 'Escaneie o QR code com Google Authenticator, Authy ou similar e digite o código gerado.'}
                </p>
              </div>
              {!qr?.confirmed && qr?.qrCodeUrl && !useBackup && (
                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <img src={qr.qrCodeUrl} alt="QR code 2FA" className="w-44 h-44 bg-white rounded-xl p-2" />
                  <code className="text-xs text-slate-300 break-all select-all">{qr.secret}</code>
                </div>
              )}
              <Field label={useBackup ? 'Código de recuperação' : 'Código'}>
                <input
                  required
                  autoFocus
                  className={inputCls + ' tracking-[0.3em] text-center font-bold'}
                  value={otp}
                  onChange={(e) => setOtp(useBackup ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode={useBackup ? 'text' : 'numeric'}
                  autoComplete="one-time-code"
                  placeholder={useBackup ? 'A1B2-C3D4E5' : '000000'}
                />
              </Field>
              <ErrorBox msg={error} />
              <button className={btnCls} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Verificar
              </button>
              {qr?.confirmed && (
                <button type="button" onClick={() => { setUseBackup(!useBackup); setOtp(''); setError(''); }} className="w-full text-xs font-semibold text-slate-400 hover:text-white">
                  {useBackup ? 'Usar app autenticador' : 'Perdi meu celular — usar código de recuperação'}
                </button>
              )}
            </form>
          )}

          {backupCodes && (
            <div className="space-y-4">
              <h1 className="text-2xl font-display font-bold">Guarde seus códigos de recuperação</h1>
              <p className="text-sm text-slate-400">
                Eles só aparecem agora. Cada código vale uma vez e serve para entrar se você perder o celular.
              </p>
              <div className="grid grid-cols-2 gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-sm select-all">
                {backupCodes.map((c) => <span key={c}>{c}</span>)}
              </div>
              <button onClick={() => navigator.clipboard?.writeText(backupCodes.join('\n'))} className="w-full h-11 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5">
                Copiar códigos
              </button>
              <button onClick={finishWithBackupCodes} className={btnCls}>Já guardei, continuar</button>
            </div>
          )}

          {mode === 'register' && <RegisterFlow onDone={goLogin} />}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Cadastro em 5 etapas (POST /api/register, multipart)
// ---------------------------------------------------------------------------

type Form = Record<string, string | File | undefined>;

const STEPS = ['Conta', 'Operação', 'Tipo de conta', 'Documentos', 'Endereço'];

const PF_DOCS: [string, string, string][] = [
  ['documento_frente', 'Documento (frente)', 'image/jpeg,image/png,application/pdf'],
  ['documento_verso', 'Documento (verso)', 'image/jpeg,image/png,application/pdf'],
  ['selfie_documento', 'Selfie com documento', 'image/jpeg,image/png'],
];
const PJ_DOCS: [string, string, string][] = [
  ['documento_representante_frente', 'Documento do representante (frente)', 'image/jpeg,image/png,application/pdf'],
  ['documento_representante_verso', 'Documento do representante (verso)', 'image/jpeg,image/png,application/pdf'],
  ['selfie_representante', 'Selfie do representante', 'image/jpeg,image/png'],
  ['cartao_cnpj', 'Cartão CNPJ', 'image/jpeg,image/png,application/pdf'],
];

const RegisterFlow: React.FC<{ onDone: (email?: string) => void }> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>({ account_type: 'pessoa_fisica', operation_type: 'infoproduto' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const t = e.target as HTMLInputElement;
    setF((p) => ({ ...p, [k]: t.type === 'file' ? t.files?.[0] : t.value }));
  };
  const str = (k: string) => (f[k] as string) ?? '';
  const isPF = f.account_type === 'pessoa_fisica';

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 0) {
        if (str('password') !== str('password_confirmation')) throw new Error('As senhas não conferem.');
        if ((await api('/auth/check-email', { body: { email: str('email') } })).exists) throw new Error('Este e-mail já está cadastrado.');
      }
      if (step === 2 && isPF && (await api('/auth/check-cpf', { body: { cpf: str('cpf') } })).exists) {
        throw new Error('Este CPF já está cadastrado.');
      }
      if (step < STEPS.length - 1) {
        setStep(step + 1);
        return;
      }
      const fd = new FormData();
      const skip = isPF ? ['cnpj', 'razao_social', ...PJ_DOCS.map((d) => d[0])] : ['cpf', ...PF_DOCS.map((d) => d[0])];
      Object.entries(f).forEach(([k, v]) => v && !skip.includes(k) && fd.append(k, v));
      await api('/register', { body: fd });
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-bold">Conta criada! 🎉</h1>
        <p className="text-sm text-slate-400">Seus documentos foram enviados para análise. Entre para configurar a verificação em duas etapas.</p>
        <button onClick={() => onDone(str('email'))} className={btnCls}>Ir para o login</button>
      </div>
    );
  }

  return (
    <form onSubmit={next} className="space-y-4">
      <button type="button" onClick={() => (step ? setStep(step - 1) : onDone())} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" /> {step ? 'Etapa anterior' : 'Já tenho conta'}
      </button>
      <div>
        <p className="text-xs font-bold text-[#00D15F] uppercase tracking-wider">Etapa {step + 1} de {STEPS.length}</p>
        <h1 className="text-2xl font-display font-bold mt-1">{STEPS[step]}</h1>
        <div className="flex gap-1.5 mt-3">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#07A33E]' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <>
          <Field label="Nome completo"><input required minLength={3} className={inputCls} value={str('name')} onChange={set('name')} /></Field>
          <Field label="E-mail"><input required type="email" className={inputCls} value={str('email')} onChange={set('email')} /></Field>
          <Field label="Telefone"><input type="tel" className={inputCls} value={str('phone')} onChange={set('phone')} placeholder="(11) 99999-9999" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Senha"><input required type="password" minLength={6} autoComplete="new-password" className={inputCls} value={str('password')} onChange={set('password')} /></Field>
            <Field label="Confirmar senha"><input required type="password" minLength={6} autoComplete="new-password" className={inputCls} value={str('password_confirmation')} onChange={set('password_confirmation')} /></Field>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <Field label="O que você vende?">
            <select className={inputCls} value={str('operation_type')} onChange={set('operation_type')}>
              <option value="infoproduto">Infoproduto</option>
              <option value="produto_fisico">Produto físico</option>
              <option value="dropshipping">Dropshipping</option>
              <option value="servicos">Serviços</option>
              <option value="outros">Outros</option>
            </select>
          </Field>
          {f.operation_type === 'outros' && (
            <Field label="Qual?"><input required className={inputCls} value={str('operation_type_other')} onChange={set('operation_type_other')} /></Field>
          )}
          <Field label="Ticket médio (R$)"><input type="number" min={0} step="0.01" className={inputCls} value={str('ticket_medio')} onChange={set('ticket_medio')} /></Field>
          <Field label="Página de vendas"><input type="url" className={inputCls} value={str('pagina_vendas')} onChange={set('pagina_vendas')} placeholder="https://" /></Field>
        </>
      )}

      {step === 2 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(['pessoa_fisica', 'pessoa_juridica'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setF((p) => ({ ...p, account_type: t }))}
                className={`h-11 rounded-xl border text-sm font-bold transition ${f.account_type === t ? 'border-[#07A33E] bg-[#07A33E]/15' : 'border-white/10 hover:bg-white/5'}`}
              >
                {t === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </button>
            ))}
          </div>
          {isPF ? (
            <Field label="CPF"><input required className={inputCls} value={str('cpf')} onChange={set('cpf')} placeholder="000.000.000-00" /></Field>
          ) : (
            <>
              <Field label="CNPJ"><input required className={inputCls} value={str('cnpj')} onChange={set('cnpj')} placeholder="00.000.000/0000-00" /></Field>
              <Field label="Razão social"><input required className={inputCls} value={str('razao_social')} onChange={set('razao_social')} /></Field>
            </>
          )}
        </>
      )}

      {step === 3 &&
        (isPF ? PF_DOCS : PJ_DOCS).map(([k, label, accept]) => (
          <Field key={k} label={label}>
            <input
              required={!f[k]}
              type="file"
              accept={accept}
              onChange={set(k)}
              className="block w-full text-xs text-slate-400 file:mr-3 file:h-9 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-semibold hover:file:bg-white/15"
            />
            {f[k] instanceof File && <span className="text-[11px] text-emerald-400">✓ {(f[k] as File).name}</span>}
          </Field>
        ))}

      {step === 4 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Field label="CEP"><input required className={inputCls} value={str('cep')} onChange={set('cep')} /></Field>
            <div className="col-span-2"><Field label="Rua"><input required className={inputCls} value={str('rua')} onChange={set('rua')} /></Field></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Número"><input required className={inputCls} value={str('numero')} onChange={set('numero')} /></Field>
            <div className="col-span-2"><Field label="Complemento"><input className={inputCls} value={str('complemento')} onChange={set('complemento')} /></Field></div>
          </div>
          <Field label="Bairro"><input required className={inputCls} value={str('bairro')} onChange={set('bairro')} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Field label="Cidade"><input required className={inputCls} value={str('cidade')} onChange={set('cidade')} /></Field></div>
            <Field label="UF"><input required maxLength={2} className={inputCls + ' uppercase'} value={str('estado')} onChange={(e) => setF((p) => ({ ...p, estado: e.target.value.toUpperCase() }))} /></Field>
          </div>
        </>
      )}

      <ErrorBox msg={error} />
      <button className={btnCls} disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {step < STEPS.length - 1 ? 'Continuar' : 'Criar conta'}
      </button>
    </form>
  );
};
