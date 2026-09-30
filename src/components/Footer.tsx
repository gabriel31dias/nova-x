import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs text-xs text-slate-500 font-medium">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand copyright matching Screenshot 1 */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 tracking-tight">Valen Finance</span>
          <span>© 2026. Finanças sem complicação. Todos os direitos reservados.</span>
        </div>

        {/* Right: Status, Links and Slogan */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Status do sistema</span>
          </div>

          <a href="#suporte" className="hover:text-slate-800 transition-colors">
            Suporte
          </a>
          <a href="#termos" className="hover:text-slate-800 transition-colors">
            Termos
          </a>
          <a href="#privacidade" className="hover:text-slate-800 transition-colors">
            Privacidade
          </a>

          <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-200 pl-4">
            <img src="/favicon.png" alt="" className="w-3.5 h-3.5" />
            <span className="text-[11px] text-slate-600 font-semibold italic">Feito para quem faz mais.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
