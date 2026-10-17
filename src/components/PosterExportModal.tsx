import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { SneakerEntry, UserProfile } from '../types';
import { CATEGORY_META } from '../data/presets';
import { SneakerSvg } from './SneakerSilhouette';
import {
  X,
  Download,
  Share2,
  Eye,
  EyeOff,
  Palette,
  Loader2,
  Star,
  Smartphone,
  LayoutGrid,
  Check,
} from 'lucide-react';

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
  const previewWrapRef = useRef<HTMLDivElement>(null);

  // スマホ画面 (<640px) の場合は最初から見やすい「1列スマホスリム」を初期選択にする
  const [layoutMode, setLayoutMode] = useState<'magazine' | 'mobile'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'mobile' : 'magazine'
  );
  const [showAge, setShowAge] = useState(true);
  const [showMemory, setShowMemory] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);

  // プレビュー自動縮小フィット用のスケール値と高さ
  const [scale, setScale] = useState(1);
  const [posterNaturalHeight, setPosterNaturalHeight] = useState<number>(800);

  const currentYear = new Date().getFullYear();
  const targetWidth = layoutMode === 'magazine' ? 760 : 420;

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

  // 画面幅とポスター高さに応じて自動的に画面幅にピタッと収まるスケールを計算
  useEffect(() => {
    const updateScale = () => {
      if (!previewWrapRef.current || !posterRef.current) return;
      const containerWidth = previewWrapRef.current.clientWidth - 24; // 左右余白分
      const nextScale = Math.min(1, Math.max(0.3, containerWidth / targetWidth));
      setScale(nextScale);
      setPosterNaturalHeight(posterRef.current.offsetHeight);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (previewWrapRef.current) ro.observe(previewWrapRef.current);
    if (posterRef.current) ro.observe(posterRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [targetWidth, showAge, showMemory, darkTheme, layoutMode, sneakers.length]);

  // 設定変更時は生成済み画像キャッシュをクリア
  useEffect(() => {
    setGeneratedDataUrl(null);
  }, [layoutMode, showAge, showMemory, darkTheme]);

  const generatePngDataUrl = async (): Promise<string | null> => {
    if (generatedDataUrl) return generatedDataUrl;
    if (!posterRef.current) return null;
    const el = posterRef.current;
    return toPng(el, {
      cacheBust: true,
      pixelRatio: 2,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generatePngDataUrl();
      if (!dataUrl) return;
      setGeneratedDataUrl(dataUrl);

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

  const handleNativeShare = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generatePngDataUrl();
      if (!dataUrl) return;
      setGeneratedDataUrl(dataUrl);

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const dateStr = new Date().toISOString().slice(0, 10);
      const file = new File([blob], `kicksline-${dateStr}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${profile.nickname || 'MY'}の靴の年表 | KicksLine`,
          text: '人生で履いてきた靴の年表 #KicksLine',
          files: [file],
        });
      } else {
        // Web Share API非対応ブラウザでは通常ダウンロードを実行
        const link = document.createElement('a');
        link.download = `kicksline-poster-${dateStr}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      // ユーザーが共有シートをキャンセルした場合はエラー表示しない
      console.log('Share canceled or fallback:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const canUseWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex-shrink-0 bg-zinc-900 text-white px-4 py-3 flex items-center justify-between gap-2 border-b-2 border-zinc-900">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono-code text-[10px] sm:text-[11px] bg-amber-400 text-zinc-900 font-black px-2 py-0.5 flex-shrink-0">
              SNS SHARE
            </span>
            <span className="text-xs sm:text-base font-black truncate">
              まとめ画像のプレビュー＆保存
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Settings & Action Bar */}
        <div className="flex-shrink-0 bg-zinc-100 px-3 sm:px-5 py-2.5 border-b-2 border-zinc-900 space-y-2">
          {/* Row 1: Layout Switcher + Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Layout Switcher: 1-Col Mobile vs 2-Col Magazine */}
            <div className="inline-flex border border-zinc-900 bg-white">
              <button
                type="button"
                onClick={() => setLayoutMode('mobile')}
                className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 py-1 transition-colors cursor-pointer ${
                  layoutMode === 'mobile'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>スマホ縦長 (1列)</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('magazine')}
                className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 py-1 border-l border-zinc-900 transition-colors cursor-pointer ${
                  layoutMode === 'magazine'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>マガジン (2列)</span>
              </button>
            </div>

            {/* Privacy & Theme Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAge(!showAge)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 border transition-colors cursor-pointer ${
                  showAge
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-300'
                }`}
              >
                {showAge ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>年齢:{showAge ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMemory(!showMemory)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 border transition-colors cursor-pointer ${
                  showMemory
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-300'
                }`}
              >
                {showMemory ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>メモ:{showMemory ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDarkTheme(!darkTheme)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 cursor-pointer"
              >
                <Palette className="w-3 h-3" />
                <span>{darkTheme ? 'ダーク' : 'ライト'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Export / Share Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-200">
            <span className="text-[11px] text-zinc-500 font-medium">
              ※画面幅に合わせて自動縮小プレビュー中（保存時は高画質で出力されます）
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {canUseWebShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-3 py-1.5 border-2 border-zinc-900 cursor-pointer"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  <span>スマホで共有・写真保存</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-black text-xs px-3.5 py-1.5 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] cursor-pointer"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>PNG画像として保存する</span>
              </button>
            </div>
          </div>

          {/* Long-press Save Helper Banner when image is generated */}
          {generatedDataUrl && (
            <div className="bg-emerald-50 border border-emerald-300 p-2 flex items-center justify-between gap-2 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  画像を生成しました！スマホでダウンロードできない場合は、下のプレビュー画像を長押しして「"写真"に保存」してください。
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGeneratedDataUrl(null)}
                className="text-[11px] underline flex-shrink-0"
              >
                閉じる
              </button>
            </div>
          )}
        </div>

        {/* Auto-Scaling Scrollable Poster Preview Container */}
        <div
          ref={previewWrapRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-zinc-200"
        >
          {generatedDataUrl ? (
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-zinc-700 mb-2">
                👇 長押しでカメラロール（「写真」）に直接保存できます
              </p>
              <img
                src={generatedDataUrl}
                alt="Generated KicksLine Poster"
                className="max-w-full h-auto border-2 border-zinc-900 shadow-lg"
                style={{ maxWidth: `${targetWidth}px` }}
              />
            </div>
          ) : (
            /* Outer Sizing Box matches the visually scaled dimensions so zero horizontal scroll or extra bottom gap occurs! */
            <div
              className="mx-auto relative"
              style={{
                width: `${Math.round(targetWidth * scale)}px`,
                height: `${Math.round(posterNaturalHeight * scale)}px`,
              }}
            >
              <div
                style={{
                  width: `${targetWidth}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* Target Poster DOM for html-to-image (unscaled internally for crisp 2x export!) */}
                <div
                  ref={posterRef}
                  style={{ width: `${targetWidth}px` }}
                  className={`h-fit p-5 sm:p-8 border-4 box-border ${
                    darkTheme
                      ? 'bg-zinc-950 text-zinc-100 border-zinc-800'
                      : 'bg-[#FAF9F6] text-zinc-900 border-zinc-900'
                  }`}
                >
                  {/* Magazine Masthead */}
                  <header
                    className={`border-b-4 pb-4 mb-5 flex flex-wrap items-end justify-between gap-2 ${
                      darkTheme ? 'border-zinc-100' : 'border-zinc-900'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-mono-code text-[10px] font-black px-2 py-0.5 uppercase tracking-widest ${
                            darkTheme
                              ? 'bg-amber-400 text-zinc-950'
                              : 'bg-zinc-900 text-white'
                          }`}
                        >
                          KICKSLINE ARCHIVE
                        </span>
                        <span className="font-mono-code text-[10px] opacity-60">
                          FOOTWEAR CHRONICLE
                        </span>
                      </div>
                      <h1
                        className={`${
                          layoutMode === 'mobile' ? 'text-2xl' : 'text-4xl'
                        } font-black tracking-tighter uppercase leading-none break-words`}
                      >
                        {profile.nickname || 'MY'}'S FOOTWEAR HISTORY
                      </h1>
                      {profile.subtitle && (
                        <p className="text-[11px] font-bold opacity-75 mt-1 break-words">
                          {profile.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="text-right font-mono-code flex-shrink-0 ml-auto">
                      <div
                        className={`${
                          layoutMode === 'mobile' ? 'text-lg' : 'text-2xl'
                        } font-black leading-none`}
                      >
                        {sorted.length > 0
                          ? `${minStartYear} — ${currentYear}`
                          : String(currentYear)}
                      </div>
                      <div className="text-[10px] opacity-60 mt-0.5">
                        TOTAL {sorted.length} PAIRS ARCHIVED
                      </div>
                    </div>
                  </header>

                  {/* Poster Grid of Footwear (1-col in mobile mode, 2-col in magazine mode) */}
                  <div
                    className={`grid ${
                      layoutMode === 'mobile' ? 'grid-cols-1 gap-2.5' : 'grid-cols-2 gap-4'
                    } mb-5 items-stretch`}
                  >
                    {sorted.map((item, idx) => {
                      const age =
                        showAge &&
                        profile.birthYear &&
                        item.startYear - profile.birthYear >= 0
                          ? `${item.startYear - profile.birthYear}歳`
                          : null;
                      const endText =
                        item.isCurrent || !item.endYear ? 'NOW' : String(item.endYear);
                      const categoryMeta = CATEGORY_META[item.category || 'sneaker'];

                      return (
                        <div
                          key={item.id}
                          className={`border-2 p-3 flex flex-col justify-between overflow-hidden ${
                            darkTheme
                              ? 'bg-zinc-900 border-zinc-700'
                              : 'bg-white border-zinc-900'
                          }`}
                        >
                          <div>
                            {/* Year & Brand Header */}
                            <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-dashed border-zinc-400/40">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-mono-code text-[11px] font-black px-1.5 py-0.5 ${
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
                                #{String(sorted.length - idx).padStart(2, '0')} {item.brand}{' '}
                                / {categoryMeta.shortLabel}
                              </span>
                            </div>

                            {/* Footwear Visual + Title */}
                            <div className="flex items-center gap-3">
                              <div
                                className={`${
                                  layoutMode === 'mobile' ? 'w-20 h-16' : 'w-24 h-20'
                                } flex-shrink-0 bg-white border border-zinc-200 flex items-center justify-center p-1.5 overflow-hidden`}
                              >
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
                                    className={
                                      layoutMode === 'mobile' ? 'w-16 h-12' : 'w-20 h-14'
                                    }
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

                            {/* Optional Memory */}
                            {showMemory && item.memory && (
                              <div
                                className={`mt-2 pt-1.5 border-t border-dashed ${
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
                    className={`border-t-2 pt-3 flex flex-wrap items-center justify-between gap-3 font-mono-code text-[11px] ${
                      darkTheme ? 'border-zinc-700' : 'border-zinc-900'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="opacity-60 block text-[9px]">BRAND BREAKDOWN</span>
                        <div className="flex flex-wrap items-center gap-2 font-bold mt-0.5">
                          {topBrands.map(([b, count]) => (
                            <span key={b}>
                              {b}: {Math.round((count / Math.max(1, sorted.length)) * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>

                      {longestSneaker && (
                        <div className="pl-3 border-l border-zinc-500/40">
                          <span className="opacity-60 block text-[9px]">LONGEST PARTNER</span>
                          <span className="font-bold mt-0.5 block">
                            {longestSneaker.item.brand} {longestSneaker.item.model} (
                            {longestSneaker.years} yrs)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 ml-auto">
                      <span className="font-black tracking-widest block">KICKSLINE</span>
                      <span className="text-[9px] opacity-60">FOOTWEAR LIFE TIMELINE</span>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
