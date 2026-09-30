import React from 'react';
import { Layers, Calendar, ArrowUpRight, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const ReceivablesScreen: React.FC = () => {
  const schedule = [
    { date: '21/09/2026', amount: 'R$ 4.250,00', transactions: 38, status: 'Liberado em breve' },
    { date: '22/09/2026', amount: 'R$ 6.120,00', transactions: 54, status: 'Liberado em breve' },
    { date: '23/09/2026', amount: 'R$ 3.890,00', transactions: 29, status: 'Liberado em breve' },
    { date: '24/09/2026', amount: 'R$ 8.940,00', transactions: 72, status: 'A compensar' },
    { date: '28/09/2026', amount: 'R$ 15.300,00', transactions: 120, status: 'A compensar' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Recebimentos
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Agenda e previsão de liquidação dos recebíveis de cartão e boleto.
          </p>
        </div>

        <button
          onClick={() => alert('Simulador de antecipação com taxa especial de 1.8% a.m.')}
          className="bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/20"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Antecipar Recebíveis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Saldo Previsto (7 dias)" value="R$ 23.200,00" />
        <StatCard icon={Calendar} label="Saldo Previsto (30 dias)" value="R$ 58.420,00" />
        <StatCard icon={TrendingUp} label="Taxa de Antecipação" value="1,89% a.m." valueCls="text-emerald-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Cronograma de Liquidação</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {schedule.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-[#07A33E] flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{item.date}</p>
                  <p className="text-[11px] text-slate-400">{item.transactions} transações associadas</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-extrabold text-slate-900 text-sm">{item.amount}</p>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
