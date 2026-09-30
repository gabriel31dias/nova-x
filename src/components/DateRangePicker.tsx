import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface DateRange {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  label: string; // shown on the trigger and reused by screens as a subtitle
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const ymd = (d: Date) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD in local time
const parse = (s: string) => new Date(s + 'T00:00:00');
const br = (s: string) => parse(s).toLocaleDateString('pt-BR');
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const range = (start: Date, end: Date, label?: string): DateRange => ({
  start_date: ymd(start),
  end_date: ymd(end),
  label: label ?? (ymd(start) === ymd(end) ? br(ymd(start)) : `${br(ymd(start))} - ${br(ymd(end))}`),
});

const monthRange = (y: number, m: number) => range(new Date(y, m, 1), new Date(y, m + 1, 0), `${MONTHS_FULL[m]} de ${y}`);
const yearRange = (y: number) => range(new Date(y, 0, 1), new Date(y, 11, 31), `Ano de ${y}`);

export const PRESETS: { label: string; get: () => DateRange }[] = [
  { label: 'Hoje', get: () => range(new Date(), new Date(), 'Hoje') },
  { label: 'Últimos 7 dias', get: () => range(addDays(new Date(), -6), new Date(), 'Últimos 7 dias') },
  { label: 'Últimos 30 dias', get: () => range(addDays(new Date(), -29), new Date(), 'Últimos 30 dias') },
  { label: 'Este mês', get: () => ({ ...monthRange(new Date().getFullYear(), new Date().getMonth()), label: 'Este mês' }) },
  {
    label: 'Mês passado',
    get: () => {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1); // Date handles January -> previous December
      return { ...monthRange(d.getFullYear(), d.getMonth()), label: 'Mês passado' };
    },
  },
  { label: 'Este ano', get: () => ({ ...yearRange(new Date().getFullYear()), label: 'Este ano' }) },
];

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const [cursor, setCursor] = useState(() => parse(value.end_date)); // month/year being browsed
  const [pickStart, setPickStart] = useState<string | null>(null); // first click of a custom day range
  const [hover, setHover] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const apply = (r: DateRange) => {
    onChange(r);
    setOpen(false);
    setPickStart(null);
  };

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const today = ymd(new Date());

  const clickDay = (d: string) => {
    if (!pickStart) return setPickStart(d);
    const [a, b] = d < pickStart ? [d, pickStart] : [pickStart, d];
    apply(range(parse(a), parse(b)));
  };

  // Highlight: the range being picked (start..hover) or the current value.
  const [lo, hi] = pickStart
    ? [pickStart, hover ?? pickStart].sort()
    : [value.start_date, value.end_date];

  const days: (string | null)[] = [
    ...Array(new Date(y, m, 1).getDay()).fill(null),
    ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => ymd(new Date(y, m, i + 1))),
  ];
  const yearStart = y - (y % 12);

  const navBtn = 'p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors';
  const cell = (active: boolean, inRange: boolean) =>
    `rounded-lg text-xs font-semibold transition-colors ${
      active ? 'bg-[#07A33E] text-white' : inRange ? 'bg-primary-50 text-[#07A33E]' : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setView('days');
          setCursor(parse(value.end_date));
          setPickStart(null);
        }}
        className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 transition-colors"
      >
        <Calendar className="w-4 h-4 text-[#07A33E]" />
        <span>{value.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-40 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col sm:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Presets */}
          <div className="p-2 sm:w-40 border-b sm:border-b-0 sm:border-r border-slate-100 flex sm:flex-col gap-1 overflow-x-auto">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => apply(p.get())}
                className={`text-left whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  value.label === p.label ? 'bg-primary-50 text-[#07A33E]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3 w-full sm:w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                className={navBtn}
                aria-label="Anterior"
                onClick={() => setCursor(view === 'days' ? new Date(y, m - 1, 1) : new Date(y - (view === 'years' ? 12 : 1), m, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                {view === 'days' && (
                  <button type="button" onClick={() => setView('months')} className="px-2 py-1 rounded-lg hover:bg-slate-100">
                    {MONTHS_FULL[m]}
                  </button>
                )}
                <button type="button" onClick={() => setView('years')} className="px-2 py-1 rounded-lg hover:bg-slate-100">
                  {view === 'years' ? `${yearStart} – ${yearStart + 11}` : y}
                </button>
              </div>
              <button
                type="button"
                className={navBtn}
                aria-label="Próximo"
                onClick={() => setCursor(view === 'days' ? new Date(y, m + 1, 1) : new Date(y + (view === 'years' ? 12 : 1), m, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {view === 'days' && (
              <>
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{w}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5" onMouseLeave={() => setHover(null)}>
                  {days.map((d, i) =>
                    d ? (
                      <button
                        key={d}
                        type="button"
                        onClick={() => clickDay(d)}
                        onMouseEnter={() => setHover(d)}
                        className={`h-8 ${cell(d === lo || d === hi, d > lo && d < hi)} ${d === today && d !== lo && d !== hi ? 'ring-1 ring-[#07A33E]/40' : ''}`}
                      >
                        {+d.slice(8)}
                      </button>
                    ) : (
                      <span key={`e${i}`} />
                    )
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-400 text-center">
                  {pickStart ? 'Escolha a data final' : 'Clique no dia inicial e depois no final'}
                </p>
              </>
            )}

            {view === 'months' && (
              <>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS.map((name, i) => {
                    const r = monthRange(y, i);
                    const active = value.start_date === r.start_date && value.end_date === r.end_date;
                    return (
                      <button key={name} type="button" onClick={() => apply(r)} className={`h-10 ${cell(active, false)}`}>
                        {name}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => apply(yearRange(y))} className="mt-2 w-full py-2 rounded-lg text-xs font-bold text-[#07A33E] hover:bg-primary-50">
                  Ano inteiro de {y}
                </button>
                <button type="button" onClick={() => setView('days')} className="mt-1 w-full py-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700">
                  Escolher dias
                </button>
              </>
            )}

            {view === 'years' && (
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => yearStart + i).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setCursor(new Date(yr, m, 1));
                      setView('months');
                    }}
                    className={`h-10 ${cell(yr === y, false)}`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
