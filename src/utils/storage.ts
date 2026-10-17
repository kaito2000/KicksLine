import { get, set } from 'idb-keyval';
import { KicksLineBackup, SneakerEntry, UserProfile } from '../types';
import { SAMPLE_PROFILE, SAMPLE_SNEAKERS } from '../data/presets';

const STORAGE_KEYS = {
  SNEAKERS: 'kicksline_sneakers_v1',
  PROFILE: 'kicksline_profile_v1',
  IS_DEMO: 'kicksline_is_demo_v1',
};

export async function loadAppState(): Promise<{
  sneakers: SneakerEntry[];
  profile: UserProfile;
  isDemo: boolean;
}> {
  try {
    const [savedSneakers, savedProfile, savedIsDemo] = await Promise.all([
      get<SneakerEntry[]>(STORAGE_KEYS.SNEAKERS),
      get<UserProfile>(STORAGE_KEYS.PROFILE),
      get<boolean>(STORAGE_KEYS.IS_DEMO),
    ]);

    if (savedSneakers && savedProfile) {
      return {
        sneakers: savedSneakers,
        profile: savedProfile,
        isDemo: savedIsDemo ?? false,
      };
    }
  } catch (e) {
    console.warn('IndexedDB load fallback:', e);
  }

  // 初回アクセス時はサンプル年表を表示
  return {
    sneakers: SAMPLE_SNEAKERS,
    profile: SAMPLE_PROFILE,
    isDemo: true,
  };
}

export async function saveAppState(
  sneakers: SneakerEntry[],
  profile: UserProfile,
  isDemo: boolean
): Promise<void> {
  try {
    await Promise.all([
      set(STORAGE_KEYS.SNEAKERS, sneakers),
      set(STORAGE_KEYS.PROFILE, profile),
      set(STORAGE_KEYS.IS_DEMO, isDemo),
    ]);
  } catch (e) {
    console.error('Failed to save state to IndexedDB:', e);
  }
}

export function exportBackupJson(profile: UserProfile, sneakers: SneakerEntry[]): void {
  const backup: KicksLineBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    sneakers,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `kicksline-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function parseBackupJson(file: File): Promise<KicksLineBackup> {
  const text = await file.text();
  const parsed = JSON.parse(text) as KicksLineBackup;
  if (!parsed || !Array.isArray(parsed.sneakers) || !parsed.profile) {
    throw new Error('有効なKicksLineバックアップファイルではありません');
  }
  return parsed;
}
