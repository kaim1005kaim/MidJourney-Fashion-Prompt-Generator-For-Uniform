// services/dataService.ts
import { UniformType, PhraseVariations, AppSettings, Prompt } from '../types';

// ローカルストレージのキー
const FAVORITES_KEY = 'mjug_favorites';
const SETTINGS_KEY = 'mjug_settings';
const HISTORY_KEY = 'mjug_history';

// デフォルト設定
const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  promptCount: 5,
  includeAspectRatio: true,
  aspectRatio: "--ar 4:5",
  includeVersion: true,
  version: "--v 7.0",
  includeStylize: true,
  stylize: "s100",
  customSuffix: '',
};

// アスペクト比オプション
export const ASPECT_RATIO_OPTIONS = [
  { label: "4:5 (縦長 - Instagram推奨)", value: "--ar 4:5" },
  { label: "16:9 (横長 - 風景向け)", value: "--ar 16:9" },
  { label: "9:16 (スマホ縦向き)", value: "--ar 9:16" },
  { label: "1:1 (正方形)", value: "--ar 1:1" },
  { label: "9:9 (正方形)", value: "--ar 9:9" },
];

// スタイライズオプション
export const STYLIZE_OPTIONS = [
  { label: "s0 (スタイライズなし)", value: "s0" },
  { label: "s100 (軽度スタイライズ - デフォルト)", value: "s100" },
  { label: "s200 (中程度スタイライズ)", value: "s200" },
  { label: "s300 (強めスタイライズ)", value: "s300" },
  { label: "s400 (かなり強めスタイライズ)", value: "s400" },
  { label: "s500 (非常に強めスタイライズ)", value: "s500" },
  { label: "s1000 (最大スタイライズ)", value: "s1000" },
];

// バージョンオプション
export const VERSION_OPTIONS = [
  { label: "v7.0 (最新版)", value: "--v 7.0" },
  { label: "v6.1 (旧バージョン)", value: "--v 6.1" },
];

// バックアップ用の初期制服データ
const initialUniformTypes: UniformType[] = [
  {
    uniform_id: "hospital",
    uniform_name: "Hospital Uniform",
    description: "Medical staff uniforms designed for clinical environments",
    key_elements: ["scrubs", "white coat", "nursing cap", "stethoscope", "name badge"],
    materials: ["cotton", "polyester blend", "antimicrobial fabric"],
    color_palette: ["white", "light blue", "teal", "navy"],
    industries: ["healthcare", "medical", "nursing"],
    style_keywords: ["functional", "hygienic", "professional"]
  },
  {
    uniform_id: "restaurant",
    uniform_name: "Restaurant Uniform",
    description: "Food service uniforms for various dining establishments",
    key_elements: ["chef coat", "apron", "toque", "server outfit", "bowtie"],
    materials: ["cotton", "polyester", "stain-resistant fabric"],
    color_palette: ["white", "black", "burgundy", "navy"],
    industries: ["food service", "hospitality", "catering"],
    style_keywords: ["neat", "elegant", "practical", "branded"]
  },
  {
    uniform_id: "hotel",
    uniform_name: "Hotel Staff Uniform",
    description: "Upscale hospitality uniforms for hotel personnel",
    key_elements: ["front desk suit", "bellhop cap", "concierge vest", "housekeeping uniform"],
    materials: ["wool blend", "cotton", "polyester", "satin accents"],
    color_palette: ["navy", "gold", "black", "burgundy"],
    industries: ["hospitality", "hotels", "tourism"],
    style_keywords: ["elegant", "sophisticated", "professional", "branded"]
  }
];

// デバッグ用フラグ - true にすると詳細なログを出力
const DEBUG = false;

/**
 * 初期データを読み込む
 */
export async function loadInitialData(): Promise<{ uniform_types: UniformType[], phraseVariations: PhraseVariations }> {
  try {
    // デバッグログ
    if (DEBUG) {
      console.log('初期データ読み込み開始');
    }
    
    // uniform-database.jsonファイルを取得
    const response = await fetch('/uniform-database.json');
    if (!response.ok) {
      throw new Error('制服データベースの読み込みに失敗しました');
    }
    
    // JSONデータを解析
    const data = await response.json();
    
    if (DEBUG) {
      console.log('制服データを読み込みました:', data);
    }
    
    return {
      uniform_types: data.uniform_types || [],
      phraseVariations: data.phrase_variations || {
        quality: [],
        photo_style: [],
        lighting: [],
        resolution: [],
        parameters: []
      }
    };
  } catch (error) {
    console.error('初期データ読み込みエラー:', error);
    
    // エラー時はレガシーデータの読み込みを試みる
    try {
      return await loadLegacyUniformData();
    } catch (legacyError) {
      console.error('レガシーデータの読み込みにも失敗しました:', legacyError);
      
      // エラー時のフォールバックデータ
      return {
        uniform_types: initialUniformTypes,
        phraseVariations: {
          quality: ["high quality", "detailed", "professional"],
          photo_style: ["fashion photograph", "professional photography"],
          lighting: ["studio lighting", "soft lighting"],
          resolution: ["8k", "4k", "high resolution"],
          parameters: ["--ar 4:5 --stylize 750", "--ar 3:4 --stylize 850"]
        }
      };
    }
  }
}

/**
 * お気に入りをローカルストレージから読み込む
 */
export function loadFavorites(): Prompt[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('お気に入りの読み込みエラー:', error);
    return [];
  }
}

/**
 * お気に入りをローカルストレージに保存
 */
export function saveFavorites(favorites: Prompt[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('お気に入りの保存エラー:', error);
  }
}

/**
 * プロンプト履歴をローカルストレージから読み込む
 */
export function loadHistory(): Prompt[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('履歴の読み込みエラー:', error);
    return [];
  }
}

/**
 * プロンプト履歴をローカルストレージに保存
 */
export function saveHistory(history: Prompt[]): void {
  try {
    // 最大100件まで保存
    const limitedHistory = history.slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('履歴の保存エラー:', error);
  }
}

/**
 * 設定をローカルストレージから読み込む
 */
export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('設定の読み込みエラー:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 設定をローカルストレージに保存
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('設定の保存エラー:', error);
  }
}

/**
 * ローカルストレージの全データをクリア
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('データのクリアエラー:', error);
  }
}

/**
 * 旧式のuniform-fatabase.jsonからデータを読み込む（レガシーサポート用）
 */
export async function loadLegacyUniformData(): Promise<{ uniform_types: UniformType[], phraseVariations: PhraseVariations }> {
  try {
    // データベースJSONファイルを取得
    const response = await fetch('/uniform-fatabase.json');
    if (!response.ok) {
      throw new Error('レガシー制服データベースの読み込みに失敗しました');
    }
    
    // JSONデータを解析
    const data = await response.json();
    
    return {
      uniform_types: data.uniform_types || [],
      phraseVariations: data.phrase_variations || {
        quality: [],
        photo_style: [],
        lighting: [],
        resolution: [],
        parameters: []
      }
    };
  } catch (error) {
    console.error('レガシーデータの読み込みエラー:', error);
    
    // エラー時のフォールバックデータ
    return {
      uniform_types: initialUniformTypes,
      phraseVariations: {
        quality: ["high quality", "detailed", "professional"],
        photo_style: ["fashion photograph", "professional photography"],
        lighting: ["studio lighting", "soft lighting"],
        resolution: ["8k", "4k", "high resolution"],
        parameters: ["--ar 4:5 --stylize 750", "--ar 3:4 --stylize 850"]
      }
    };
  }
}
