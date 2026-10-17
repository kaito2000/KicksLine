import React, { useState, useEffect, useCallback } from 'react';
import {
  FootwearCategory,
  SilhouetteType,
  SneakerEntry,
  SneakerStatus,
} from '../types';
import {
  CATEGORY_META,
  COLOR_PALETTE_PRESETS,
  ERA_TAG_SUGGESTIONS,
  POPULAR_BRANDS,
  STATUS_LABELS,
} from '../data/presets';
import { compressImageBlob } from '../utils/imageUtils';
import { SILHOUETTE_LABELS, SneakerVisual } from './SneakerSilhouette';
import {
  X,
  Upload,
  ClipboardPaste,
  ExternalLink,
  Trash2,
  Star,
  Loader2,
} from 'lucide-react';

interface SneakerModalProps {
  initialData?: SneakerEntry | null;
  birthYear: number | null;
  onClose: () => void;
  onSave: (entry: Omit<SneakerEntry, 'id' | 'createdAt'>, id?: string) => void;
}

export const SneakerModal: React.FC<SneakerModalProps> = ({
  initialData,
  birthYear,
  onClose,
  onSave,
}) => {
  const currentYear = new Date().getFullYear();

  const [category, setCategory] = useState<FootwearCategory>(
    initialData?.category || 'sneaker'
  );
  const [brand, setBrand] = useState(initialData?.brand || 'NIKE');
  const [model, setModel] = useState(initialData?.model || '');
  const [colorwayName, setColorwayName] = useState(initialData?.colorwayName || '');
  const [startYear, setStartYear] = useState<number>(initialData?.startYear || currentYear - 2);
  const [endYear, setEndYear] = useState<number>(
    initialData?.endYear || currentYear
  );
  const [isCurrent, setIsCurrent] = useState<boolean>(
    initialData ? initialData.isCurrent : true
  );
  const [status, setStatus] = useState<SneakerStatus>(initialData?.status || 'active');
  const [rating, setRating] = useState<number>(initialData?.rating || 5);
  const [eraTag, setEraTag] = useState<string>(initialData?.eraTag || '');
  const [memory, setMemory] = useState<string>(initialData?.memory || '');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(
    initialData?.imageDataUrl
  );
  const [silhouette, setSilhouette] = useState<SilhouetteType>(
    initialData?.silhouette || 'low'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    initialData?.primaryColor || '#18181B'
  );
  const [accentColor, setAccentColor] = useState<string>(
    initialData?.accentColor || '#E4E4E7'
  );

  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [imageFeedback, setImageFeedback] = useState<string | null>(null);

  // Handle Ctrl+V paste anywhere inside the modal
  const handlePasteEvent = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          setIsConvertingImage(true);
          try {
            const compressed = await compressImageBlob(blob);
            setImageDataUrl(compressed);
            setImageFeedback('クリップボードから写真を取り込みました！');
          } catch {
            setImageFeedback('画像の貼り付け処理に失敗しました');
          } finally {
            setIsConvertingImage(false);
          }
        }
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePasteEvent);
    return () => window.removeEventListener('paste', handlePasteEvent);
  }, [handlePasteEvent]);

  const handleCategoryChange = (cat: FootwearCategory) => {
    setCategory(cat);
    if (cat === 'boots_leather' && !['boots', 'leather'].includes(silhouette)) {
      setSilhouette('leather');
    } else if (cat === 'sandal') {
      setSilhouette('sandal');
    } else if (cat === 'sports') {
      setSilhouette('runner');
    } else if (cat === 'sneaker' && ['boots', 'leather', 'sandal'].includes(silhouette)) {
      setSilhouette('low');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsConvertingImage(true);
    try {
      const compressed = await compressImageBlob(file);
      setImageDataUrl(compressed);
      setImageFeedback('画像ファイルを圧縮してセットしました！');
    } catch {
      setImageFeedback('画像の読み込みに失敗しました');
    } finally {
      setIsConvertingImage(false);
    }
  };

  const handleClipboardButton = async () => {
    try {
      if (!navigator.clipboard?.read) {
        setImageFeedback('キーボードの Ctrl+V (Macは ⌘+V) で直接貼り付けてください');
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          setIsConvertingImage(true);
          const blob = await item.getType(imageType);
          const compressed = await compressImageBlob(blob);
          setImageDataUrl(compressed);
          setImageFeedback('クリップボードから写真を取り込みました！');
          setIsConvertingImage(false);
          return;
        }
      }
      setImageFeedback('クリップボードに画像がありません。Web検索等で「画像をコピー」してから押してください。');
    } catch {
      setImageFeedback('キーボードの Ctrl+V (または ⌘+V) で直接この画面に貼り付けてください！');
    }
  };

  const openGoogleImageSearch = () => {
    const q = encodeURIComponent(`${brand} ${model} ${colorwayName}`.trim());
    window.open(`https://www.google.com/search?tbm=isch&q=${q}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) return;

    const validEndYear = isCurrent ? null : Math.max(startYear, endYear);

    onSave(
      {
        category,
        brand: brand.trim(),
        model: model.trim(),
        colorwayName: colorwayName.trim() || undefined,
        startYear: Number(startYear),
        endYear: validEndYear,
        isCurrent,
        status,
        rating,
        eraTag: eraTag.trim(),
        memory: memory.trim(),
        imageDataUrl,
        silhouette,
        primaryColor,
        accentColor,
      },
      initialData?.id
    );
  };

  const calculatedStartAge =
    birthYear && startYear - birthYear >= 0 ? `${startYear - birthYear}歳` : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-zinc-900 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs bg-amber-400 text-zinc-900 font-black px-2 py-0.5">
              FOOTWEAR ARCHIVE
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              {initialData ? '靴の記録を編集' : '新しい一足を年表に追加'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Category, Required Info & Period */}
            <div className="lg:col-span-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1.5">
                  0. CATEGORY / 靴のカテゴリ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(CATEGORY_META) as FootwearCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`py-2 px-2 text-xs font-bold border-2 transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                      }`}
                    >
                      {CATEGORY_META[cat].shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                  1. BRAND / ブランド名 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="自由入力 または 下のボタンから選択..."
                  className="w-full border-2 border-zinc-900 px-3 py-2 text-sm font-bold focus:outline-none focus:bg-amber-50/30"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrand(b)}
                      className={`text-[11px] font-mono-code px-2 py-0.5 border transition-colors cursor-pointer ${
                        brand === b
                          ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model & Colorway */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                    2. MODEL / モデル名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="例: Air Force 1, 996, 8ホール, ローファー..."
                    className="w-full border-2 border-zinc-900 px-3 py-2 text-sm font-bold focus:outline-none focus:bg-amber-50/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                    COLOR / 素材 (任意)
                  </label>
                  <input
                    type="text"
                    value={colorwayName}
                    onChange={(e) => setColorwayName(e.target.value)}
                    placeholder="例: Black / White"
                    className="w-full border border-zinc-400 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* Wearing Period */}
              <div className="bg-zinc-50 border-2 border-zinc-900 p-3.5">
                <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-2">
                  3. PERIOD / 履いていた期間 <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-600 mb-1">
                      履き始めた年 {calculatedStartAge && `（当時 ${calculatedStartAge}）`}
                    </span>
                    <input
                      type="number"
                      min={1970}
                      max={currentYear + 1}
                      value={startYear}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStartYear(val);
                        if (!isCurrent && endYear < val) {
                          setEndYear(val);
                        }
                      }}
                      className="w-full bg-white border-2 border-zinc-900 px-3 py-1.5 font-mono-code font-bold text-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-600 mb-1">
                      手放した年
                    </span>
                    <input
                      type="number"
                      min={startYear}
                      max={currentYear + 1}
                      disabled={isCurrent}
                      value={isCurrent ? currentYear : endYear}
                      onChange={(e) => setEndYear(Number(e.target.value))}
                      className="w-full bg-white disabled:bg-zinc-200 disabled:text-zinc-400 border-2 border-zinc-900 px-3 py-1.5 font-mono-code font-bold text-sm"
                    />
                  </div>
                </div>
                <label className="mt-2.5 inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsCurrent(checked);
                      if (checked) {
                        setStatus('active');
                      } else if (status === 'active') {
                        setStatus('retired');
                      }
                    }}
                    className="w-4 h-4 accent-zinc-900"
                  />
                  <span className="text-xs font-bold text-zinc-800">
                    現在も所有・現役で履いている（PRESENT）
                  </span>
                </label>
              </div>

              {/* Era / Life Stage Tag */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                  4. ERA TAG / 当時の時代・ライフイベント（任意）
                </label>
                <input
                  type="text"
                  value={eraTag}
                  onChange={(e) => setEraTag(e.target.value)}
                  placeholder="例: 高校時代、初任給、一生モノの革靴..."
                  className="w-full border-2 border-zinc-900 px-3 py-1.5 text-sm font-bold focus:outline-none focus:bg-amber-50/30"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ERA_TAG_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEraTag(tag)}
                      className={`text-[11px] px-2 py-0.5 border transition-colors cursor-pointer ${
                        eraTag === tag
                          ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visuals, Status, Rating & Memory */}
            <div className="lg:col-span-6 space-y-4">
              {/* Visual Registration (Web Search & Copy-Paste + Silhouette + Color Palette) */}
              <div className="border-2 border-zinc-900 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-zinc-700">
                    5. VISUAL / 写真またはシルエット＆カラー設定
                  </span>
                  {imageDataUrl && (
                    <button
                      type="button"
                      onClick={() => setImageDataUrl(undefined)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      写真をクリアしてシルエットに戻す
                    </button>
                  )}
                </div>

                {/* Live Visual Preview */}
                <SneakerVisual
                  imageDataUrl={imageDataUrl}
                  silhouette={silhouette}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  brand={brand}
                  model={model || 'PREVIEW'}
                  className="w-full h-32"
                />

                {/* Fast Copy-Paste & File Upload Actions */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={openGoogleImageSearch}
                    className="w-full flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-900 border-2 border-zinc-900 text-xs font-black py-1.5 px-3 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>🔍 入力したモデル名でWeb画像検索（画像をコピーして下で貼付）</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleClipboardButton}
                      className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-1.5 px-2 transition-colors cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>コピーした画像を貼付 (Ctrl+V)</span>
                    </button>

                    <label className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 text-xs font-bold py-1.5 px-2 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>端末の写真ファイルを選択</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {isConvertingImage && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>画像をポスター対応形式に最適化しています...</span>
                  </div>
                )}

                {imageFeedback && (
                  <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5">
                    {imageFeedback}
                  </p>
                )}

                {/* Silhouette & 1-Tap Color Presets */}
                <div className="pt-2 border-t border-dashed border-zinc-200 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] font-bold text-zinc-600 mr-1">形状:</span>
                    {(Object.keys(SILHOUETTE_LABELS) as SilhouetteType[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSilhouette(s)}
                        className={`text-[10px] font-mono-code uppercase px-2 py-0.5 border cursor-pointer ${
                          silhouette === s
                            ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                            : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-900'
                        }`}
                      >
                        {SILHOUETTE_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  {/* 1-Tap Classic Colorway Chips */}
                  <div>
                    <div className="text-[11px] font-bold text-zinc-600 mb-1">
                      定番カラーリング（ワンタップ切替）：
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_PALETTE_PRESETS.map((cp) => {
                        const active =
                          primaryColor.toLowerCase() === cp.primaryColor.toLowerCase() &&
                          accentColor.toLowerCase() === cp.accentColor.toLowerCase();
                        return (
                          <button
                            key={cp.name}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(cp.primaryColor);
                              setAccentColor(cp.accentColor);
                            }}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border transition-colors cursor-pointer ${
                              active
                                ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                                : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-zinc-400"
                              style={{ backgroundColor: cp.primaryColor }}
                            />
                            <span
                              className="w-2 h-2 rounded-full border border-zinc-400 -ml-1.5"
                              style={{ backgroundColor: cp.accentColor }}
                            />
                            <span>{cp.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Fine Color Pickers */}
                  <div className="flex items-center gap-4 pt-0.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 cursor-pointer">
                      <span>カスタムメイン色</span>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-5 h-5 border border-zinc-300 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 cursor-pointer">
                      <span>カスタムサブ色</span>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-5 h-5 border border-zinc-300 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Status & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                    6. STATUS / 現在の状態
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const nextStatus = e.target.value as SneakerStatus;
                      setStatus(nextStatus);
                      if (nextStatus === 'retired' || nextStatus === 'sold') {
                        setIsCurrent(false);
                      } else if (nextStatus === 'active') {
                        setIsCurrent(true);
                      }
                    }}
                    className="w-full border-2 border-zinc-900 px-3 py-1.5 text-sm font-bold bg-white"
                  >
                    {(Object.keys(STATUS_LABELS) as SneakerStatus[]).map((k) => (
                      <option key={k} value={k}>
                        {STATUS_LABELS[k].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                    7. RATING / 思い入れ・お気に入り度
                  </label>
                  <div className="flex items-center gap-1 border-2 border-zinc-900 px-2.5 py-1 bg-zinc-50">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className="p-0.5 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 transition-transform hover:scale-110 ${
                            num <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-auto font-mono-code text-xs font-bold text-zinc-600">
                      {rating}.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory / Episode Note */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-zinc-700 mb-1">
                  8. EPISODE / 当時の思い出・エピソード（任意）
                </label>
                <textarea
                  rows={4}
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="どこで買ったか、どんな服に合わせていたか、靴擦れしながら馴染ませた思い出や一緒に旅した場所を自由に記録しましょう..."
                  className="w-full border-2 border-zinc-900 p-2.5 text-sm leading-relaxed focus:outline-none focus:bg-amber-50/20"
                />
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t-2 border-zinc-900 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono-code font-bold uppercase border-2 border-zinc-900 bg-white hover:bg-zinc-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-mono-code font-bold uppercase border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]"
            >
              {initialData ? '変更を保存する' : 'この一足を年表に追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
