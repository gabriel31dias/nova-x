import React from 'react';
import { FileText, Download, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Relatórios Financeiros
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Exporte demonstrativos fiscais, conciliação e relatórios detalhados de vendas.
          </p>
        </div>

        <button
          onClick={() => alert('Gerando DRE sintético e consolidado...')}
          className="bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Baixar DRE Completo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Extrato de Vendas</h4>
            <p className="text-xs text-slate-500 mt-1">Todas as transações aprovadas e custos por transação.</p>
          </div>
          <button
            onClick={() => alert('Download do extrato de vendas iniciado!')}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Informe de Rendimentos</h4>
            <p className="text-xs text-slate-500 mt-1">Documento consolidado para declaração de IRPF / IRPJ.</p>
          </div>
          <button
            onClick={() => alert('Download do informe anual iniciado!')}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Conciliação Bancária</h4>
            <p className="text-xs text-slate-500 mt-1">Relatório OFX / Excel compatível com ERPs (ContaAzul, Tiny, Omie).</p>
          </div>
          <button
            onClick={() => alert('Download da conciliação bancária iniciado!')}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar OFX / Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
