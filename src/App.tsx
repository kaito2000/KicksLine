import React, { useEffect, useState } from 'react';
import pkg from '../package.json';
import { FootwearCategory, SneakerEntry, UserProfile } from './types';
import { CATEGORY_META, SAMPLE_PROFILE, SAMPLE_SNEAKERS } from './data/presets';
import {
  exportBackupJson,
  loadAppState,
  parseBackupJson,
  saveAppState,
} from './utils/storage';
import { StatsBanner } from './components/StatsBanner';
import { StoryTimelineView } from './components/StoryTimelineView';
import { RotationBarView } from './components/RotationBarView';
import { SneakerModal } from './components/SneakerModal';
import { PosterExportModal } from './components/PosterExportModal';
import {
  Plus,
  Share2,
  ListOrdered,
  BarChart3,
  Download,
  Upload,
  User,
  Sparkles,
  RotateCcw,
  Filter,
} from 'lucide-react';

export function App() {
  const [sneakers, setSneakers] = useState<SneakerEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(SAMPLE_PROFILE);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'story' | 'rotation'>('story');
  const [selectedCategory, setSelectedCategory] = useState<FootwearCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSneaker, setEditingSneaker] = useState<SneakerEntry | null>(null);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    loadAppState().then((state) => {
      // 既存データにcategoryがない場合のフォールバック補完
      const normalized = state.sneakers.map((s) => ({
        ...s,
        category: s.category || 'sneaker',
      }));
      const normalizedProfile =
        state.profile.nickname === 'KAITO (SAMPLE)'
          ? { ...state.profile, nickname: 'SAMPLE' }
          : state.profile;
      setSneakers(normalized);
      setProfile(normalizedProfile);
      setIsDemo(state.isDemo);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveAppState(sneakers, profile, isDemo);
  }, [sneakers, profile, isDemo, isLoaded]);

  const handleStartMyOwnTimeline = () => {
    setSneakers([]);
    setProfile({
      nickname: 'MY',
      birthYear: 1998,
      subtitle: '足元から振り返る、自分のライフヒストリー',
    });
    setIsDemo(false);
    setIsProfileOpen(true);
  };

  const handleRestoreSample = () => {
    if (
      sneakers.length > 0 &&
      !isDemo &&
      !window.confirm('現在の表示をサンプル年表に切り替えますか？（元のデータは上書きされます）')
    ) {
      return;
    }
    setSneakers(SAMPLE_SNEAKERS);
    setProfile(SAMPLE_PROFILE);
    setIsDemo(true);
  };

  const handleSaveSneaker = (
    entryData: Omit<SneakerEntry, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setSneakers((prev) =>
        prev.map((item) =>
          item.id === existingId ? { ...item, ...entryData } : item
        )
      );
    } else {
      const newEntry: SneakerEntry = {
        ...entryData,
        id: `kick-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setSneakers((prev) => [...prev, newEntry]);
    }
    setIsDemo(false);
    setIsModalOpen(false);
    setEditingSneaker(null);
  };

  const handleDeleteSneaker = (id: string) => {
    if (!window.confirm('この靴の記録を削除しますか？')) return;
    setSneakers((prev) => prev.filter((s) => s.id !== id));
    setIsDemo(false);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const backup = await parseBackupJson(file);
      const normalized = backup.sneakers.map((s) => ({
        ...s,
        category: s.category || 'sneaker',
      }));
      setSneakers(normalized);
      setProfile(backup.profile);
      setIsDemo(false);
      alert(`${normalized.length}足の靴の年表データを復元しました！`);
    } catch (err) {
      alert('バックアップファイルの読み込みに失敗しました。');
    } finally {
      e.target.value = '';
    }
  };

  // カテゴリ絞り込み後のリスト（統計・タイムライン・ポスター書き出しすべてに連動！）
  const filteredSneakers =
    selectedCategory === 'all'
      ? sneakers
      : sneakers.filter((s) => (s.category || 'sneaker') === selectedCategory);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono-code text-sm">
        LOADING KICKSLINE ARCHIVE...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F0] text-zinc-900">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-amber-400 border-b-2 border-zinc-900 px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>
                現在はイメージ確認用の「サンプル年表（スニーカー・革靴・サンダル）」を表示中です。そのまま編集するか、白紙から作れます！
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestoreSample}
                className="bg-white text-zinc-900 border border-zinc-900 font-mono-code text-xs font-bold px-2.5 py-1 cursor-pointer"
              >
                最新サンプルを再読込
              </button>
              <button
                onClick={handleStartMyOwnTimeline}
                className="bg-zinc-900 text-white hover:bg-zinc-800 font-mono-code text-xs font-bold px-3 py-1.5 cursor-pointer"
              >
                白紙から自分の年表を作る →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Magazine Archive Header */}
      <header className="bg-white border-b-2 border-zinc-900 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-full">
            <div className="flex-shrink-0 bg-zinc-900 text-white font-mono-code font-black text-base sm:text-2xl px-2.5 py-1 sm:px-3 sm:py-1.5 tracking-tighter whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] sm:shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]">
              KICKSLINE
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <h1 className="text-[clamp(13px,3.8vw,18px)] font-black tracking-tight whitespace-nowrap truncate">
                  {profile.nickname || 'MY'}の靴の年表
                </h1>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex-shrink-0 inline-flex items-center gap-1 text-[clamp(10px,2.8vw,12px)] font-mono-code bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 px-1.5 sm:px-2 py-0.5 text-zinc-700 whitespace-nowrap cursor-pointer"
                >
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span>{profile.birthYear ? `${profile.birthYear}年生まれ` : '生年設定'}</span>
                </button>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block truncate">{profile.subtitle}</p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsPosterOpen(true)}
              disabled={filteredSneakers.length === 0}
              className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-900 border-2 border-zinc-900 font-bold text-xs sm:text-sm px-3 py-2 whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>SNS用まとめ画像出力</span>
            </button>

            <button
              onClick={() => {
                setEditingSneaker(null);
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border-2 border-zinc-900 font-bold text-xs sm:text-sm px-3.5 py-2 whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(251,191,36,1)] cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>靴を追加する</span>
            </button>
          </div>
        </div>

        {/* Collapsible Profile & BirthYear Bar */}
        {isProfileOpen && (
          <div className="bg-zinc-50 border-t-2 border-zinc-900 px-4 py-3">
            <div className="max-w-5xl mx-auto flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-[11px] font-mono-code font-bold text-zinc-600 mb-1">
                  ニックネーム（ポスターの見出しに表示）
                </label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={(e) => {
                    setProfile({ ...profile, nickname: e.target.value });
                    setIsDemo(false);
                  }}
                  placeholder="例: TARO"
                  className="bg-white border-2 border-zinc-900 px-3 py-1 text-sm font-bold w-44"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono-code font-bold text-zinc-600 mb-1">
                  生年（西暦を入れると当時の年齢を自動計算）
                </label>
                <input
                  type="number"
                  min={1940}
                  max={new Date().getFullYear()}
                  value={profile.birthYear || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setProfile({ ...profile, birthYear: val });
                    setIsDemo(false);
                  }}
                  placeholder="例: 1998"
                  className="bg-white border-2 border-zinc-900 px-3 py-1 font-mono-code text-sm font-bold w-36"
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-[11px] font-mono-code font-bold text-zinc-600 mb-1">
                  サブタイトル・一言テーマ
                </label>
                <input
                  type="text"
                  value={profile.subtitle}
                  onChange={(e) => {
                    setProfile({ ...profile, subtitle: e.target.value });
                    setIsDemo(false);
                  }}
                  className="bg-white border-2 border-zinc-900 px-3 py-1 text-sm w-full"
                />
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="bg-zinc-900 text-white text-xs font-bold px-4 py-1.5 border-2 border-zinc-900"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Category Filter Pills (Solves Longest Partner & Noise Concerns!) */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-mono-code font-bold text-zinc-600 mr-1">
            <Filter className="w-3.5 h-3.5" />
            CATEGORY:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs font-bold px-3 py-1.5 border-2 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]'
                : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
            }`}
          >
            すべて表示 ({sneakers.length})
          </button>
          {(Object.keys(CATEGORY_META) as FootwearCategory[]).map((cat) => {
            const count = sneakers.filter((s) => (s.category || 'sneaker') === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 border-2 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                }`}
              >
                {CATEGORY_META[cat].shortLabel} ({count})
              </button>
            );
          })}
        </div>

        {/* Stats Summary (Dynamically reflects the selected category!) */}
        <StatsBanner sneakers={filteredSneakers} />

        {/* View Switcher & Backup Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b-2 border-zinc-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('story')}
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black px-4 py-2 border-2 border-zinc-900 cursor-pointer transition-all ${
                activeTab === 'story'
                  ? 'bg-zinc-900 text-white shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>縦型カード年表 (STORY)</span>
            </button>

            <button
              onClick={() => setActiveTab('rotation')}
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black px-4 py-2 border-2 border-zinc-900 cursor-pointer transition-all ${
                activeTab === 'rotation'
                  ? 'bg-zinc-900 text-white shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>着用期間バー (ROTATION)</span>
            </button>
          </div>

          {/* Backup & Sample Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportBackupJson(profile, sneakers)}
              className="inline-flex items-center gap-1 text-xs font-mono-code font-bold bg-white hover:bg-zinc-100 border border-zinc-400 px-2.5 py-1.5 text-zinc-700"
              title="全データをJSONファイルとしてバックアップ保存"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON保存</span>
            </button>

            <label
              className="inline-flex items-center gap-1 text-xs font-mono-code font-bold bg-white hover:bg-zinc-100 border border-zinc-400 px-2.5 py-1.5 text-zinc-700 cursor-pointer"
              title="バックアップしたJSONファイルを読み込む"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>JSON読込</span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>

            {!isDemo && (
              <button
                onClick={handleRestoreSample}
                className="inline-flex items-center gap-1 text-xs font-mono-code text-zinc-500 hover:text-zinc-900 px-2 py-1.5"
                title="サンプル年表を再表示する"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">サンプルを見る</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredSneakers.length === 0 ? (
          <div className="bg-white border-2 border-zinc-900 p-12 text-center shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]">
            <div className="font-mono-code text-xs uppercase tracking-widest text-zinc-400 mb-2">
              NO FOOTWEAR ARCHIVED IN THIS CATEGORY
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-2">
              人生で履いてきた思い出の靴を記録しましょう
            </h2>
            <p className="text-sm text-zinc-600 max-w-md mx-auto mb-6">
              スニーカー、革靴、ブーツ、サンダル、部活のシューズまで。写真がない昔の靴も7種類の専用シルエット＆カラーでカッコよく残せます。
            </p>
            <button
              onClick={() => {
                setEditingSneaker(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white font-bold text-sm px-6 py-3 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>靴を登録する</span>
            </button>
          </div>
        ) : activeTab === 'story' ? (
          <StoryTimelineView
            sneakers={filteredSneakers}
            profile={profile}
            onEdit={(s) => {
              setEditingSneaker(s);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteSneaker}
          />
        ) : (
          <RotationBarView
            sneakers={filteredSneakers}
            profile={profile}
            onEdit={(s) => {
              setEditingSneaker(s);
              setIsModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-zinc-900 bg-white py-5 px-4 mt-12">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code text-zinc-500">
          <div className="flex items-center gap-2">
            <span>KICKSLINE — PERSONAL FOOTWEAR LIFE TIMELINE</span>
            <span className="bg-zinc-100 border border-zinc-300 text-zinc-700 font-bold px-1.5 py-0.5 text-[11px]">
              Ver. {pkg.version}
            </span>
          </div>
          <span>DATA STORED LOCALLY IN BROWSER (INDEXEDDB)</span>
        </div>
      </footer>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <SneakerModal
          initialData={editingSneaker}
          birthYear={profile.birthYear}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSneaker(null);
          }}
          onSave={handleSaveSneaker}
        />
      )}

      {/* SNS Poster Export Modal */}
      {isPosterOpen && (
        <PosterExportModal
          sneakers={filteredSneakers}
          profile={profile}
          onClose={() => setIsPosterOpen(false)}
        />
      )}
    </div>
  );
}
export default App;
