import React, { useState } from 'react';
import { Box, Plus, Search, Sparkles, Tag, ArrowUpRight, Copy, Check } from 'lucide-react';
import { initialProducts } from '../data/mockData';
import { Product } from '../types';

export const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`https://poppay.com.br/checkout/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Produtos
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Cadastre infoprodutos, serviços, cursos e assinaturas para vender online.
          </p>
        </div>

        <button
          onClick={() => alert('Abrir modal de cadastro de novo produto')}
          className="bg-[#07A33E] hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-[#07A33E] px-2 py-0.5 rounded-md">
                  {p.type}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {p.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-3 leading-snug">{p.name}</h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{p.salesCount} vendas realizadas</span>
                <span className="font-bold text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.totalRevenue)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => handleCopy(p.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Checkout</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
