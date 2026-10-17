import React from 'react';
import { SneakerEntry } from '../types';
import { Award, Layers, CheckCircle2, Sparkles } from 'lucide-react';

interface StatsBannerProps {
  sneakers: SneakerEntry[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ sneakers }) => {
  const currentYear = new Date().getFullYear();

  const totalCount = sneakers.length;
  const activeCount = sneakers.filter((s) => s.isCurrent || s.status === 'active').length;

  // ブランド別集計
  const brandCounts = sneakers.reduce<Record<string, number>>((acc, item) => {
    const b = item.brand.trim() || 'OTHER';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const sortedBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);

  // 最長寿の相棒を算出
  let longestSneaker: { item: SneakerEntry; years: number } | null = null;
  for (const s of sneakers) {
    const end = s.isCurrent || !s.endYear ? currentYear : s.endYear;
    const years = Math.max(1, end - s.startYear + 1);
    if (!longestSneaker || years > longestSneaker.years) {
      longestSneaker = { item: s, years };
    }
  }

  const brandColors = [
    'bg-zinc-900',
    'bg-amber-500',
    'bg-zinc-600',
    'bg-emerald-600',
    'bg-blue-600',
    'bg-rose-600',
    'bg-zinc-400',
    'bg-violet-600',
    'bg-teal-600',
    'bg-orange-500',
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
      {/* Total & Active Card */}
      <div className="md:col-span-3 bg-white border-2 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-mono-code uppercase tracking-wider text-zinc-500 border-b border-dashed border-zinc-300 pb-2">
          <span>TOTAL ARCHIVE</span>
          <Layers className="w-4 h-4 text-zinc-900" />
        </div>
        <div className="my-3 flex items-baseline gap-3">
          <span className="text-4xl font-black tracking-tight font-mono-code text-zinc-900">
            {String(totalCount).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold text-zinc-500">PAIRS LOGGED</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>現役ローテ: {activeCount}足</span>
        </div>
      </div>

      {/* Brand Share Distribution */}
      <div className="md:col-span-5 bg-white border-2 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-mono-code uppercase tracking-wider text-zinc-500 border-b border-dashed border-zinc-300 pb-2">
          <span>BRAND SHARE RATIO</span>
          <Sparkles className="w-4 h-4 text-zinc-900" />
        </div>

        {totalCount === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">靴を登録するとブランド比率が表示されます</p>
        ) : (
          <div className="my-2">
            {/* Ratio Bar */}
            <div className="h-3.5 w-full bg-zinc-100 border border-zinc-900 flex overflow-hidden mb-3">
              {sortedBrands.map(([brand, count], idx) => {
                const exactPct = (count / totalCount) * 100;
                const pct = Math.round(exactPct);
                const colorClass = brandColors[idx % brandColors.length];
                return (
                  <div
                    key={brand}
                    style={{ width: `${exactPct}%` }}
                    className={`${colorClass} h-full transition-all duration-500`}
                    title={`${brand}: ${count}足 (${pct}%)`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {sortedBrands.map(([brand, count], idx) => {
                const pct = Math.round((count / totalCount) * 100);
                const colorClass = brandColors[idx % brandColors.length];
                return (
                  <div key={brand} className="flex items-center justify-between text-xs gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2.5 h-2.5 flex-shrink-0 inline-block ${colorClass}`} />
                      <span className="font-bold text-zinc-800 truncate">{brand}</span>
                    </div>
                    <span className="font-mono-code text-zinc-500 flex-shrink-0">
                      {count}足 ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Longest Partner Card */}
      <div className="md:col-span-4 bg-zinc-900 text-white border-2 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(113,113,122,1)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-mono-code uppercase tracking-wider text-zinc-400 border-b border-dashed border-zinc-700 pb-2">
          <span>LONGEST PARTNER / 最長寿の相棒</span>
          <Award className="w-4 h-4 text-amber-400" />
        </div>
        {longestSneaker ? (
          <div className="my-2">
            <div className="text-[11px] font-mono-code uppercase text-amber-400 tracking-wider">
              {longestSneaker.item.brand} — {longestSneaker.years}年間着用
            </div>
            <div className="text-lg font-black tracking-tight leading-snug truncate mt-0.5">
              {longestSneaker.item.model}
            </div>
            <div className="text-xs font-mono-code text-zinc-400 mt-1">
              {longestSneaker.item.startYear} —{' '}
              {longestSneaker.item.isCurrent || !longestSneaker.item.endYear
                ? 'PRESENT (現役)'
                : longestSneaker.item.endYear}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 py-6 text-center">データなし</p>
        )}
      </div>
    </section>
  );
};
