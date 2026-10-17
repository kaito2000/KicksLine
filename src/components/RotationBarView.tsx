import React from 'react';
import { SneakerEntry, UserProfile } from '../types';
import { STATUS_LABELS } from '../data/presets';

interface RotationBarViewProps {
  sneakers: SneakerEntry[];
  profile: UserProfile;
  onEdit: (sneaker: SneakerEntry) => void;
}

export const RotationBarView: React.FC<RotationBarViewProps> = ({
  sneakers,
  profile,
  onEdit,
}) => {
  const currentYear = new Date().getFullYear();

  if (sneakers.length === 0) {
    return null;
  }

  const sorted = [...sneakers].sort((a, b) => {
    if (b.startYear !== a.startYear) return b.startYear - a.startYear;
    return b.createdAt - a.createdAt;
  });

  const minYear = Math.min(...sorted.map((s) => s.startYear));
  const maxYear = Math.max(
    currentYear,
    ...sorted.map((s) => (s.isCurrent || !s.endYear ? currentYear : s.endYear))
  );

  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  // 年ごとの同時着用数を計算
  const activeCountByYear = years.reduce<Record<number, number>>((acc, y) => {
    acc[y] = sorted.filter((s) => {
      const end = s.isCurrent || !s.endYear ? currentYear : s.endYear;
      return y >= s.startYear && y <= end;
    }).length;
    return acc;
  }, {});

  return (
    <div className="bg-white border-2 border-zinc-900 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-zinc-900">
        <div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-900">
            ROTATION MATRIX / 着用期間・ローテーション年表
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            どの年代にどの靴を並行して履いていたか（ローテーションの重なり）を可視化します。バーをタップすると編集できます。
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono-code whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block bg-zinc-900 border border-zinc-900" />
            着用期間
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block bg-emerald-600 border border-zinc-900" />
            現在も現役
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          {/* Header Row: Years & Ages */}
          <div className="grid grid-cols-12 border-b-2 border-zinc-900 bg-zinc-100">
            <div className="col-span-4 p-2.5 font-mono-code text-xs font-bold text-zinc-700 border-r border-zinc-300 whitespace-nowrap">
              MODEL / ERA
            </div>
            <div
              className="col-span-8 grid"
              style={{ gridTemplateColumns: `repeat(${years.length}, minmax(36px, 1fr))` }}
            >
              {years.map((y) => {
                const age =
                  profile.birthYear && y - profile.birthYear >= 0
                    ? `${y - profile.birthYear}歳`
                    : null;
                return (
                  <div
                    key={y}
                    className="py-2 px-1 text-center border-r border-zinc-200 last:border-r-0"
                  >
                    <div className="font-mono-code text-[11px] font-extrabold text-zinc-900 whitespace-nowrap">
                      '{String(y).slice(-2)}
                    </div>
                    {age && (
                      <div className="text-[10px] text-zinc-500 font-medium leading-tight whitespace-nowrap">
                        {age}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sneaker Rows */}
          {sorted.map((item) => {
            const endYear = item.isCurrent || !item.endYear ? currentYear : item.endYear;
            const spanYears = Math.max(1, endYear - item.startYear + 1);
            const startIdx = years.indexOf(item.startYear);

            return (
              <div
                key={item.id}
                onClick={() => onEdit(item)}
                className="grid grid-cols-12 border-b border-zinc-200 hover:bg-zinc-50 cursor-pointer transition-colors group"
              >
                {/* Sneaker Title Column */}
                <div className="col-span-4 p-2.5 border-r border-zinc-300 flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-zinc-400"
                    style={{ backgroundColor: item.primaryColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono-code text-[10px] font-bold uppercase px-1.5 py-0.2 bg-zinc-200 text-zinc-800 whitespace-nowrap flex-shrink-0">
                        {item.brand}
                      </span>
                      {item.eraTag && (
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap truncate">
                          #{item.eraTag}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate group-hover:underline">
                      {item.model}
                    </div>
                  </div>
                </div>

                {/* Year Cells + Gantt Bar */}
                <div
                  className="col-span-8 grid relative items-center py-2"
                  style={{ gridTemplateColumns: `repeat(${years.length}, minmax(36px, 1fr))` }}
                >
                  {/* Vertical Grid Lines */}
                  {years.map((y, colIdx) => (
                    <div
                      key={y}
                      style={{ gridColumn: colIdx + 1, gridRow: 1 }}
                      className="h-full border-r border-dashed border-zinc-200 last:border-r-0"
                    />
                  ))}

                  {/* Bar Overlay */}
                  <div
                    style={{
                      gridColumnStart: startIdx + 1,
                      gridColumnEnd: startIdx + 1 + spanYears,
                      gridRow: 1,
                    }}
                    className={`relative z-10 mx-1 h-7 px-2 flex items-center justify-between text-[11px] font-mono-code font-bold text-white shadow-sm transition-transform group-hover:scale-[1.01] ${
                      item.isCurrent || item.status === 'active'
                        ? 'bg-emerald-600 border border-emerald-800'
                        : 'bg-zinc-900 border border-zinc-900'
                    }`}
                    title={`${item.brand} ${item.model} (${item.startYear}〜${
                      item.isCurrent ? '現在' : endYear
                    }) - ${STATUS_LABELS[item.status].label}`}
                  >
                    <span className="truncate">
                      {item.startYear}–{item.isCurrent ? 'NOW' : String(endYear).slice(-2)}
                    </span>
                    <span className="ml-1 opacity-80 text-[10px] hidden sm:inline">
                      {spanYears}yr
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer Summary Row: Active Rotation Count per Year */}
          <div className="grid grid-cols-12 bg-zinc-50 border-t-2 border-zinc-900">
            <div className="col-span-4 p-2 font-mono-code text-[11px] font-bold text-zinc-600 border-r border-zinc-300">
              同時保有・着用数（足）
            </div>
            <div
              className="col-span-8 grid"
              style={{ gridTemplateColumns: `repeat(${years.length}, minmax(36px, 1fr))` }}
            >
              {years.map((y) => {
                const count = activeCountByYear[y] || 0;
                return (
                  <div
                    key={y}
                    className="py-1.5 text-center font-mono-code text-xs font-bold border-r border-zinc-200 last:border-r-0"
                  >
                    <span
                      className={
                        count >= 3
                          ? 'text-amber-600 font-black'
                          : count > 0
                          ? 'text-zinc-800'
                          : 'text-zinc-300'
                      }
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
