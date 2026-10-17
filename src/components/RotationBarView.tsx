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

  // スマホ画面で年数が多い場合に目盛り文字が重ならないよう間引き間隔を算出
  const totalYears = years.length;
  const mobileStep =
    totalYears <= 8 ? 1 : totalYears <= 15 ? 2 : totalYears <= 24 ? 3 : 5;

  const shouldShowMobileYearLabel = (idx: number) => {
    if (idx === 0 || idx === totalYears - 1) return true;
    if (totalYears - 1 - idx < Math.ceil(mobileStep / 2)) return false;
    return idx % mobileStep === 0;
  };

  // 年ごとの同時着用数を計算
  const activeCountByYear = years.reduce<Record<number, number>>((acc, y) => {
    acc[y] = sorted.filter((s) => {
      const end = s.isCurrent || !s.endYear ? currentYear : s.endYear;
      return y >= s.startYear && y <= end;
    }).length;
    return acc;
  }, {});

  const gridColsStyle = {
    gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="bg-white border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] sm:shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] p-3 sm:p-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b-2 border-zinc-900">
        <div>
          <h3 className="text-sm sm:text-lg font-black tracking-tight text-zinc-900">
            ROTATION MATRIX / 着用期間・ローテーション年表
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
            全期間のローテーションの重なりを一画面で比較できます。行をタップすると編集できます。
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-mono-code whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline-block bg-zinc-900 border border-zinc-900" />
            着用期間
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline-block bg-emerald-600 border border-zinc-900" />
            現在も現役
          </span>
        </div>
      </div>

      {/* 横スクロール不要・画面幅100%フィットのタイムライン */}
      <div className="w-full border border-zinc-300">
        {/* Header Row: Years & Ages */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b-2 border-zinc-900 bg-zinc-100 sticky top-0 z-20">
          <div className="hidden md:flex md:col-span-4 p-2.5 font-mono-code text-xs font-bold text-zinc-700 border-r border-zinc-300 items-center whitespace-nowrap">
            BRAND / MODEL ({minYear} – {maxYear})
          </div>
          <div className="md:col-span-8 grid" style={gridColsStyle}>
            {years.map((y, idx) => {
              const age =
                profile.birthYear && y - profile.birthYear >= 0
                  ? `${y - profile.birthYear}歳`
                  : null;
              const showOnMobile = shouldShowMobileYearLabel(idx);

              return (
                <div
                  key={y}
                  className="py-1.5 sm:py-2 px-0.5 text-center border-r border-zinc-200/80 last:border-r-0 flex flex-col items-center justify-center"
                >
                  <div
                    className={`font-mono-code text-[10px] sm:text-[11px] font-extrabold text-zinc-900 whitespace-nowrap ${
                      showOnMobile ? 'block' : 'hidden sm:block'
                    }`}
                  >
                    '{String(y).slice(-2)}
                  </div>
                  {age && (
                    <div
                      className={`text-[9px] sm:text-[10px] text-zinc-500 font-medium leading-tight whitespace-nowrap ${
                        showOnMobile ? 'block' : 'hidden sm:block'
                      }`}
                    >
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
              className="grid grid-cols-1 md:grid-cols-12 border-b border-zinc-200 hover:bg-zinc-50 cursor-pointer transition-colors group"
            >
              {/* Sneaker Title Area: Brand & Model only */}
              <div className="md:col-span-4 px-2.5 pt-2 pb-1 md:p-2.5 md:border-r border-zinc-300 flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 border border-zinc-400"
                  style={{ backgroundColor: item.primaryColor }}
                />
                <span className="font-mono-code text-[10px] font-bold uppercase px-1.5 py-0.2 bg-zinc-200 text-zinc-800 whitespace-nowrap flex-shrink-0">
                  {item.brand}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 truncate group-hover:underline">
                  {item.model}
                </span>
              </div>

              {/* Year Cells + 100%-Fit Gantt Bar */}
              <div
                className="md:col-span-8 grid relative items-center pb-2 pt-0.5 md:py-2"
                style={gridColsStyle}
              >
                {/* Vertical Grid Lines for Every Year */}
                {years.map((y, colIdx) => (
                  <div
                    key={y}
                    style={{ gridColumn: colIdx + 1, gridRow: 1 }}
                    className="h-full border-r border-dashed border-zinc-200 last:border-r-0"
                  />
                ))}

                {/* Bar Overlay (yr count only) */}
                <div
                  style={{
                    gridColumnStart: startIdx + 1,
                    gridColumnEnd: startIdx + 1 + spanYears,
                    gridRow: 1,
                  }}
                  className={`relative z-10 mx-0.5 sm:mx-1 h-5 sm:h-7 px-1 sm:px-2 flex items-center justify-center text-[10px] sm:text-[11px] font-mono-code font-bold text-white shadow-xs transition-transform group-hover:scale-[1.01] overflow-hidden ${
                    item.isCurrent || item.status === 'active'
                      ? 'bg-emerald-600 border border-emerald-800'
                      : 'bg-zinc-900 border border-zinc-900'
                  }`}
                  title={`${item.brand} ${item.model} (${item.startYear}〜${
                    item.isCurrent ? '現在' : endYear
                  }) - ${STATUS_LABELS[item.status].label}`}
                >
                  <span className="whitespace-nowrap">{spanYears}yr</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Footer Summary Row: Active Rotation Count per Year */}
        <div className="grid grid-cols-1 md:grid-cols-12 bg-zinc-50 border-t-2 border-zinc-900">
          <div className="md:col-span-4 px-2.5 py-1.5 md:p-2 font-mono-code text-[10px] sm:text-[11px] font-bold text-zinc-600 border-b md:border-b-0 md:border-r border-zinc-300 flex items-center justify-between">
            <span>同時保有・着用数（足）</span>
            <span className="md:hidden text-[10px] text-zinc-400">各年の稼働数</span>
          </div>
          <div className="md:col-span-8 grid" style={gridColsStyle}>
            {years.map((y) => {
              const count = activeCountByYear[y] || 0;
              return (
                <div
                  key={y}
                  className="py-1 sm:py-1.5 text-center font-mono-code text-[10px] sm:text-xs font-bold border-r border-zinc-200 last:border-r-0"
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
  );
};

