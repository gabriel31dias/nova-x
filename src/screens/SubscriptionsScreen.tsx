import React from 'react';
import { RefreshCw, Users, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const SubscriptionsScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Assinaturas
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Controle de receita recorrente (MRR), assinantes ativos e churn.
          </p>
        </div>

        <button
          onClick={() => alert('Criar novo plano de assinatura recorrente')}
          className="bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Plano Recorrente</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RefreshCw} label="MRR (Receita Recorrente)" value="R$ 55.370,00">
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% este mês
          </span>
        </StatCard>
        <StatCard icon={Users} label="Assinantes Ativos" value="713">
          <span className="text-slate-400 font-medium">98% em dia</span>
        </StatCard>
        <StatCard icon={AlertCircle} label="Taxa de Churn" value="1,9%">
          <span className="text-emerald-600 font-bold">Excelente retenção</span>
        </StatCard>
        <StatCard icon={TrendingUp} label="LTV Médio" value="R$ 840,00">
          <span className="text-slate-400 font-medium">Tempo médio: 9.4 meses</span>
        </StatCard>
      </div>
    </div>
  );
};
