import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { SneakerEntry, UserProfile } from '../types';
import { CATEGORY_META } from '../data/presets';
import { SneakerSvg } from './SneakerSilhouette';
import { X, Download, Eye, EyeOff, Palette, Loader2, Star } from 'lucide-react';

interface PosterExportModalProps {
  sneakers: SneakerEntry[];
  profile: UserProfile;
  onClose: () => void;
}

export const PosterExportModal: React.FC<PosterExportModalProps> = ({
  sneakers,
  profile,
  onClose,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [showAge, setShowAge] = useState(true);
  const [showMemory, setShowMemory] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentYear = new Date().getFullYear();

  const sorted = [...sneakers].sort((a, b) => {
    if (b.startYear !== a.startYear) return b.startYear - a.startYear;
    return b.createdAt - a.createdAt;
  });

  const minStartYear =
    sneakers.length > 0 ? Math.min(...sneakers.map((s) => s.startYear)) : currentYear;

  // ブランド統計算出
  const brandCounts = sneakers.reduce<Record<string, number>>((acc, item) => {
    const b = item.brand.trim() || 'OTHER';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  let longestSneaker: { item: SneakerEntry; years: number } | null = null;
  for (const s of sneakers) {
    const end = s.isCurrent || !s.endYear ? currentYear : s.endYear;
    const years = Math.max(1, end - s.startYear + 1);
    if (!longestSneaker || years > longestSneaker.years) {
      longestSneaker = { item: s, years };
    }
  }

  const handleDownloadPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    try {
      const el = posterRef.current;
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        width: el.scrollWidth,
        height: el.scrollHeight,
      });
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `kicksline-poster-${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Poster generation error:', e);
      alert('画像の書き出しに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex-shrink-0 bg-zinc-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-900">
          <div>
            <span className="font-mono-code text-[11px] bg-amber-400 text-zinc-900 font-black px-2 py-0.5 mr-2">
              SNS SHARE POSTER
            </span>
            <span className="text-sm sm:text-base font-black">
              マガジン風まとめ画像のプレビュー＆書き出し
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy & Style Toggles */}
        <div className="flex-shrink-0 bg-zinc-100 px-5 py-3 border-b-2 border-zinc-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowAge(!showAge)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border transition-colors cursor-pointer ${
                showAge
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-300'
              }`}
            >
              {showAge ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>年齢表示: {showAge ? 'ON' : 'OFF (非表示)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMemory(!showMemory)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border transition-colors cursor-pointer ${
                showMemory
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-300'
              }`}
            >
              {showMemory ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>思い出メモ: {showMemory ? 'ON' : 'OFF (非表示)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkTheme(!darkTheme)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>テーマ: {darkTheme ? 'ダークマガジン' : 'ホワイトアーカイブ'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-black text-xs sm:text-sm px-4 py-2 border-2 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>PNG画像として保存する</span>
          </button>
        </div>

        {/* Scrollable Poster Preview Container (block + mx-auto prevents flexbox height stretch clipping!) */}
        <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-8 bg-zinc-200">
          {/* Target Poster DOM for html-to-image */}
          <div
            ref={posterRef}
            className={`w-[760px] h-fit mx-auto p-8 border-4 box-border ${
              darkTheme
                ? 'bg-zinc-950 text-zinc-100 border-zinc-800'
                : 'bg-[#FAF9F6] text-zinc-900 border-zinc-900'
            }`}
          >
            {/* Magazine Masthead */}
            <header
              className={`border-b-4 pb-5 mb-6 flex items-end justify-between gap-4 ${
                darkTheme ? 'border-zinc-100' : 'border-zinc-900'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-mono-code text-[11px] font-black px-2 py-0.5 uppercase tracking-widest ${
                      darkTheme ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-white'
                    }`}
                  >
                    KICKSLINE ARCHIVE ISSUE
                  </span>
                  <span className="font-mono-code text-xs opacity-60">
                    PERSONAL FOOTWEAR CHRONICLE
                  </span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none break-words">
                  {profile.nickname || 'MY'}'S FOOTWEAR HISTORY
                </h1>
                {profile.subtitle && (
                  <p className="text-xs font-bold opacity-75 mt-1.5 break-words">
                    {profile.subtitle}
                  </p>
                )}
              </div>

              <div className="text-right font-mono-code flex-shrink-0">
                <div className="text-2xl font-black leading-none">
                  {sorted.length > 0
                    ? `${minStartYear} — ${currentYear}`
                    : String(currentYear)}
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  TOTAL {sorted.length} PAIRS ARCHIVED
                </div>
              </div>
            </header>

            {/* Poster Grid of Footwear */}
            <div className="grid grid-cols-2 gap-4 mb-6 items-stretch">
              {sorted.map((item, idx) => {
                const age =
                  showAge && profile.birthYear && item.startYear - profile.birthYear >= 0
                    ? `${item.startYear - profile.birthYear}歳`
                    : null;
                const endText =
                  item.isCurrent || !item.endYear ? 'NOW' : String(item.endYear);
                const categoryMeta = CATEGORY_META[item.category || 'sneaker'];

                return (
                  <div
                    key={item.id}
                    className={`border-2 p-3.5 flex flex-col justify-between overflow-hidden ${
                      darkTheme
                        ? 'bg-zinc-900 border-zinc-700'
                        : 'bg-white border-zinc-900'
                    }`}
                  >
                    <div>
                      {/* Year & Brand Header */}
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-dashed border-zinc-400/40">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono-code text-xs font-black px-1.5 py-0.5 ${
                              darkTheme
                                ? 'bg-zinc-100 text-zinc-900'
                                : 'bg-zinc-900 text-white'
                            }`}
                          >
                            {item.startYear}–{endText}
                          </span>
                          {age && (
                            <span className="font-mono-code text-[11px] font-bold opacity-75">
                              ({age})
                            </span>
                          )}
                        </div>
                        <span className="font-mono-code text-[10px] font-extrabold uppercase tracking-wider opacity-70 truncate">
                          #{String(sorted.length - idx).padStart(2, '0')} {item.brand} /{' '}
                          {categoryMeta.shortLabel}
                        </span>
                      </div>

                      {/* Footwear Visual + Title */}
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-20 flex-shrink-0 bg-white border border-zinc-200 flex items-center justify-center p-1.5 overflow-hidden">
                          {item.imageDataUrl ? (
                            <img
                              src={item.imageDataUrl}
                              alt={item.model}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <SneakerSvg
                              silhouette={item.silhouette}
                              primaryColor={item.primaryColor}
                              accentColor={item.accentColor}
                              className="w-20 h-14"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black leading-snug break-words">
                            {item.model}
                          </div>
                          {item.colorwayName && (
                            <div className="font-mono-code text-[10px] opacity-60 truncate">
                              {item.colorwayName}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.eraTag && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                                  darkTheme
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                                    : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                                }`}
                              >
                                #{item.eraTag}
                              </span>
                            )}
                            <div className="flex items-center">
                              {Array.from({ length: item.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Optional Memory (Separated wrapper div from text to avoid line-clamp padding overflow bug) */}
                      {showMemory && item.memory && (
                        <div
                          className={`mt-2.5 pt-2 border-t border-dashed ${
                            darkTheme ? 'border-zinc-800' : 'border-zinc-200'
                          }`}
                        >
                          <p
                            className={`text-[11px] leading-relaxed break-words whitespace-pre-wrap ${
                              darkTheme ? 'text-zinc-300' : 'text-zinc-600'
                            }`}
                          >
                            {item.memory}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Stats Strip */}
            <footer
              className={`border-t-2 pt-4 flex items-center justify-between gap-4 font-mono-code text-xs ${
                darkTheme ? 'border-zinc-700' : 'border-zinc-900'
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="opacity-60 block text-[10px]">BRAND BREAKDOWN</span>
                  <div className="flex items-center gap-2 font-bold mt-0.5">
                    {topBrands.map(([b, count]) => (
                      <span key={b}>
                        {b}: {Math.round((count / Math.max(1, sorted.length)) * 100)}%
                      </span>
                    ))}
                  </div>
                </div>

                {longestSneaker && (
                  <div className="pl-4 border-l border-zinc-500/40">
                    <span className="opacity-60 block text-[10px]">LONGEST PARTNER</span>
                    <span className="font-bold mt-0.5 block">
                      {longestSneaker.item.brand} {longestSneaker.item.model} (
                      {longestSneaker.years} yrs)
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-black tracking-widest block">KICKSLINE</span>
                <span className="text-[10px] opacity-60">FOOTWEAR LIFE TIMELINE</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
