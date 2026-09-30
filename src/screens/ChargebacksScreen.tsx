import React from 'react';
import { ShieldAlert, ShieldCheck, AlertOctagon, UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const ChargebacksScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Chargebacks
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Monitore o índice de disputas e envie defesas documentadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Índice Saudável: 0.18%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShieldAlert} label="Taxa Atual de Chargeback" value="0,18%">
          <span className="text-slate-400 font-medium">Limite máximo da bandeira: 1.00%</span>
        </StatCard>
        <StatCard icon={AlertOctagon} label="Disputas em Aberto" value="0">
          <span className="text-emerald-600 font-bold">Nenhuma ação pendente</span>
        </StatCard>
        <StatCard icon={CheckCircle2} label="Taxa de Reversão de Defesas" value="78,5%" valueCls="text-emerald-600">
          <span className="text-slate-400 font-medium">Disputas ganhas com sucesso</span>
        </StatCard>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Sua operação está 100% protegida</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Não há chargebacks ou contestações pendentes de análise no momento. O sistema anti-fraude do Valen Finance está ativo.
        </p>
      </div>
    </div>
  );
};
