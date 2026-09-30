import React, { useState } from 'react';

export interface VolumePoint {
  date: string;
  volume: number;
  prevVolume?: number;
}

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const compact = (v: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

export const SalesLineChart: React.FC<{ data: VolumePoint[]; subtitle: string }> = ({ data, subtitle }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Single point would divide by zero on the x axis; draw it as a flat segment.
  const salesChartData = (data.length === 1 ? [data[0], data[0]] : data).map((d) => ({
    ...d,
    value: d.volume,
    label: brl(d.volume),
  }));

  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxY = Math.max(...salesChartData.map((d) => d.value), 1);
  const points = salesChartData.map((d, index) => {
    const x = paddingX + (index / (salesChartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxY) * chartHeight;
    return { x, y, ...d, index };
  });

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  if (!points.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex items-center justify-center text-sm text-slate-400">
        Sem vendas no período.
      </div>
    );
  }

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((f) => ({ label: f ? compact(maxY * f) : '0' }));

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Vendas</h3>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full h-[220px] select-none">
        {/* Y Axis Grid & Labels */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pr-2">
          {yLabels.map((item, idx) => (
            <div key={idx} className="flex items-center w-full">
              <span className="text-[10px] font-medium text-slate-400 w-7 text-right pr-2">
                {item.label}
              </span>
              <div className="flex-1 border-b border-slate-100/90" />
            </div>
          ))}
        </div>

        {/* SVG Curve and Area */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#07A33E" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#07A33E" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#07A33E" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#07A33E" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Fill under curve */}
          <path d={areaPath} fill="url(#salesAreaGradient)" />

          {/* Main blue stroke curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#07A33E"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx} className="cursor-pointer">
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="#07A33E"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '5' : '4'}
                  fill="#07A33E"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
                {/* Invisible hover area */}
                <rect
                  x={pt.x - 20}
                  y={0}
                  width="40"
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip matching Screenshot 1 */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transition-all duration-200 z-20"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="bg-[#0B150F] text-white px-3.5 py-2 rounded-xl shadow-xl text-center border border-slate-700/50 backdrop-blur-sm min-w-[105px]">
              <p className="text-xs font-bold tracking-tight text-white">{activePoint.label}</p>
              <p className="text-[10px] text-slate-400 font-medium">{activePoint.date}</p>
              {/* Tooltip triangle arrow */}
              <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-[#0B150F] rotate-45 border-r border-b border-slate-700/50" />
            </div>
          </div>
        )}
      </div>

      {/* X Axis Dates */}
      <div className="flex justify-between pl-8 pr-3 pt-2">
        {salesChartData.map((d, i) => (
          // ponytail: shows every Nth date so 30+ days don't overlap
          i % Math.ceil(salesChartData.length / 7) !== 0 && i !== hoveredIndex ? null : <span
            key={i}
            className={`text-[11px] font-medium transition-colors ${
              hoveredIndex === i ? 'text-primary-600 font-bold' : 'text-slate-400'
            }`}
          >
            {d.date}
          </span>
        ))}
      </div>
    </div>
  );
};
