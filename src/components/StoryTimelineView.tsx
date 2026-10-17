import React from 'react';
import { SneakerEntry, UserProfile } from '../types';
import { CATEGORY_META, STATUS_LABELS } from '../data/presets';
import { SneakerVisual } from './SneakerSilhouette';
import { Edit3, Trash2, Star, Tag, Calendar } from 'lucide-react';

interface StoryTimelineViewProps {
  sneakers: SneakerEntry[];
  profile: UserProfile;
  onEdit: (sneaker: SneakerEntry) => void;
  onDelete: (id: string) => void;
}

export const StoryTimelineView: React.FC<StoryTimelineViewProps> = ({
  sneakers,
  profile,
  onEdit,
  onDelete,
}) => {
  const sorted = [...sneakers].sort((a, b) => {
    if (b.startYear !== a.startYear) return b.startYear - a.startYear;
    return b.createdAt - a.createdAt;
  });

  const getAgeLabel = (year: number) => {
    if (!profile.birthYear) return null;
    const age = year - profile.birthYear;
    return age >= 0 ? `${age}歳` : null;
  };

  return (
    <div className="relative pl-4 sm:pl-8 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-4 sm:before:left-8 before:w-0.5 before:bg-zinc-900">
      {sorted.map((item, idx) => {
        const startAge = getAgeLabel(item.startYear);
        const endYearText = item.isCurrent || !item.endYear ? 'PRESENT' : String(item.endYear);
        const statusMeta = STATUS_LABELS[item.status];
        const categoryMeta = CATEGORY_META[item.category || 'sneaker'];
        const showYearHeader = idx === 0 || sorted[idx - 1].startYear !== item.startYear;

        return (
          <div key={item.id} className="relative mb-10 pl-6 sm:pl-10 group">
            {/* Timeline Node Dot */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 bg-white border-4 border-zinc-900 rounded-full group-hover:scale-125 group-hover:bg-amber-400 transition-transform" />

            {/* Year & Age Marker Header */}
            {showYearHeader && (
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-zinc-900 text-white font-mono-code font-black text-lg sm:text-xl px-3 py-1 tracking-wider shadow-[3px_3px_0px_0px_rgba(161,161,170,1)]">
                  {item.startYear}
                </span>
                {startAge && (
                  <span className="font-mono-code text-xs sm:text-sm font-bold text-zinc-600 bg-zinc-200/80 px-2.5 py-1 border border-zinc-300">
                    AGE {startAge}
                  </span>
                )}
              </div>
            )}

            {/* Shoebox Archive Card */}
            <article className="bg-white border-2 border-zinc-900 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] hover:shadow-[7px_7px_0px_0px_rgba(24,24,27,1)] transition-all overflow-hidden">
              {/* Top Shoebox Label Strip */}
              <div className="bg-zinc-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code text-xs font-extrabold uppercase tracking-widest bg-white text-zinc-900 px-2 py-0.5">
                    {item.brand}
                  </span>
                  <span className="font-mono-code text-[11px] font-bold bg-zinc-800 text-amber-300 border border-zinc-700 px-2 py-0.5">
                    {categoryMeta.shortLabel}
                  </span>
                  <span className="font-mono-code text-xs text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.startYear} — {endYearText}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-mono-code font-bold px-2 py-0.5 border ${statusMeta.badgeClass} bg-white`}
                  >
                    {statusMeta.label}
                  </span>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1 text-zinc-300 hover:text-white transition-colors"
                    title="編集する"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                    title="削除する"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left: Footwear Visual */}
                <div className="md:col-span-4 p-4 bg-zinc-50/60 border-b md:border-b-0 md:border-r border-dashed border-zinc-300 flex flex-col justify-center">
                  <SneakerVisual
                    imageDataUrl={item.imageDataUrl}
                    silhouette={item.silhouette}
                    primaryColor={item.primaryColor}
                    accentColor={item.accentColor}
                    brand={item.brand}
                    model={item.model}
                    className="w-full h-40"
                  />
                </div>

                {/* Right: Specs & Story Memory */}
                <div className="md:col-span-8 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 leading-tight">
                          {item.model}
                        </h3>
                        {item.colorwayName && (
                          <p className="font-mono-code text-xs font-semibold text-zinc-500 mt-0.5">
                            COLOR / SPEC: {item.colorwayName}
                          </p>
                        )}
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 bg-zinc-100 px-2 py-1 border border-zinc-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Era Tag */}
                    {item.eraTag && (
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 px-2.5 py-0.5">
                          <Tag className="w-3 h-3 text-zinc-500" />#{item.eraTag}
                        </span>
                      </div>
                    )}

                    {/* Memory / Episode Box */}
                    {item.memory ? (
                      <div className="mt-2 bg-zinc-50 border-l-4 border-zinc-900 p-3.5 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                        {item.memory}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-400 italic">
                        エピソード未記入（「編集」ボタンから当時の思い出を追加できます）
                      </p>
                    )}
                  </div>

                  {/* Shoebox Barcode Style Footer */}
                  <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
                    <span>
                      PERIOD: {item.startYear} - {endYearText}
                      {startAge ? ` (${startAge}〜)` : ''}
                    </span>
                    <span>ARCHIVE ID #{String(sorted.length - idx).padStart(3, '0')}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
};
