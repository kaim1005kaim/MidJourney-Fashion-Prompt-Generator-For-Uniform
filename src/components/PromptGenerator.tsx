// components/PromptGenerator.tsx
import React, { useState, useEffect } from 'react';
import { Wand2, Copy, Bookmark, History, X, Database } from 'lucide-react';
import FilterPanel from './FilterPanel';
import PromptCard from './PromptCard';
import SettingsPanel from './SettingsPanel';
import { DatabaseStatus } from './database/index';
import { UniformType, FilterOptions, PhraseVariations, Prompt, AppSettings } from '../types';
import { 
  loadInitialData,
  loadFavorites, 
  saveFavorites, 
  loadSettings, 
  saveSettings, 
  loadHistory, 
  saveHistory,
  loadLegacyUniformData
} from '../services/dataService';
import { generatePrompts } from '../services/promptService';

// デフォルトのフィルター
const defaultFilters: FilterOptions = {
  uniformTypes: [],
  industries: [],
  styles: [],
  materials: [],
  colors: [],
  genders: []
};

export default function PromptGenerator() {
  // 状態
  const [uniformTypes, setUniformTypes] = useState<UniformType[]>([]);
  const [phraseVariations, setPhraseVariations] = useState<PhraseVariations>({
    quality: [],
    photo_style: [],
    lighting: [],
    resolution: [],
    parameters: []
  });
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<Prompt[]>([]);
  const [history, setHistory] = useState<Prompt[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    promptCount: 5,
    includeAspectRatio: true,
    aspectRatio: "--ar 4:5",
    includeVersion: true,
    version: "--v 7.0",
    includeStylize: true,
    stylize: "s100",
    customSuffix: ''
  });
  const [activeTab, setActiveTab] = useState<'prompts' | 'favorites' | 'history'>('prompts');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // データ読み込み関数
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null); // エラーをクリア
      
      // データベースから初期データを読み込む
      const data = await loadInitialData();
      
      console.log('初期データが読み込まれました:', {
        uniformTypesCount: data.uniform_types.length,
        hasPhraseVariations: !!data.phraseVariations,
        phraseVariationsKeys: data.phraseVariations ? Object.keys(data.phraseVariations) : []
      });
      
      // データが空の場合はレガシーデータの読み込みを試す
      if (data.uniform_types.length === 0) {
        console.log('データの読み込みが失敗したため、レガシーデータを読み込みます');
        const legacyData = await loadLegacyUniformData();
        setUniformTypes(legacyData.uniform_types);
        setPhraseVariations(legacyData.phraseVariations);
      } else {
        setUniformTypes(data.uniform_types);
        setPhraseVariations(data.phraseVariations);
      }
      
      // ローカルストレージからデータを読み込み
      const savedFavorites = loadFavorites();
      const savedHistory = loadHistory();
      const savedSettings = loadSettings();
      
      setFavorites(savedFavorites);
      setHistory(savedHistory);
      setSettings(savedSettings);
      
      setIsLoading(false);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
      // より詳細なエラー情報を表示
      if (err instanceof Error) {
        setError(`データの読み込みエラー: ${err.message}`);
        console.error('エラースタック:', err.stack);
      } else {
        setError('データの読み込みに失敗しました。詳細不明のエラーが発生しました。');
      }
      setIsLoading(false);
      
      // エラー時にレガシーデータの読み込みを試す
      try {
        console.log('エラー発生のため、レガシーデータの読み込みを試みます');
        const legacyData = await loadLegacyUniformData();
        console.log('レガシーデータ読み込み結果:', {
          uniformTypesCount: legacyData.uniform_types.length,
          hasPhraseVariations: !!legacyData.phraseVariations,
          phraseVariationsKeys: legacyData.phraseVariations ? Object.keys(legacyData.phraseVariations) : []
        });
        setUniformTypes(legacyData.uniform_types);
        setPhraseVariations(legacyData.phraseVariations);
        
        // 一部のデータが読み込まれた場合はエラーを解除
        if (legacyData.uniform_types.length > 0) {
          setError(null);
          setSuccessMessage('レガシーデータから読み込みました');
        }
      } catch (legacyErr) {
        console.error('レガシーデータの読み込みにも失敗しました:', legacyErr);
        // より詳細なレガシーエラー情報を表示
        if (legacyErr instanceof Error) {
          setError(`レガシーデータの読み込みにも失敗: ${legacyErr.message}`);
          console.error('レガシーエラースタック:', legacyErr.stack);
        }
      }
    }
  };

  // データ読み込みの実行
  useEffect(() => {
    loadData();
  }, []);
  
  // データベース更新時のハンドラ
  const handleDatabaseUpdate = async () => {
    try {
      setIsLoading(true);
      
      // データベースからデータを再読み込み
      const data = await loadInitialData();
      setUniformTypes(data.uniform_types);
      setPhraseVariations(data.phraseVariations);
      
      setIsLoading(false);
      setSuccessMessage('データベースを更新しました');
    } catch (err) {
      console.error('データベース更新エラー:', err);
      setError('データベースの更新に失敗しました。');
      setIsLoading(false);
    }
  };
  
  // ダークモード設定の反映
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 設定を保存
    saveSettings(settings);
  }, [settings]);
  
  // 成功メッセージの自動消去
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // プロンプト生成
  const generateNewPrompts = () => {
    if (uniformTypes.length === 0) {
      setError('制服データが読み込まれていません。データベース管理から読み込んでください。');
      return;
    }
    
    if (!phraseVariations || 
        !phraseVariations.quality || 
        phraseVariations.quality.length === 0) {
      setError('フレーズバリエーションデータが読み込まれていません。データベース管理から読み込んでください。');
      return;
    }
    
    try {
      // すべての既存プロンプトを重複チェック対象として渡す
      const allExistingPrompts = [...history, ...favorites];
      
      console.log('プロンプト生成開始:', {
        uniformTypesCount: uniformTypes.length,
        phraseVariations,
        filters,
        settings
      });
      
      const newPrompts = generatePrompts(
        { 
          uniformTypes, 
          phraseVariations, 
          filters, 
          settings,
          existingPrompts: allExistingPrompts  // 重複チェック用
        }, 
        settings.promptCount
      );
      
      setPrompts(newPrompts);
      
      // 履歴に保存
      const updatedHistory = [...newPrompts, ...history].slice(0, 100);
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      
      // プロンプトタブに切り替え
      setActiveTab('prompts');
      
      // 成功メッセージを表示
      setSuccessMessage('重複のないプロンプトを生成しました');
    } catch (err) {
      console.error('プロンプト生成エラー:', err);
      setError('プロンプトの生成に失敗しました。');
    }
  };
  
  // プロンプトコピー
  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setSuccessMessage('プロンプトをコピーしました');
    } catch (err) {
      console.error('コピーエラー:', err);
      setError('プロンプトのコピーに失敗しました。');
    }
  };
  
  // すべてのプロンプトをコピー
  const copyAllPrompts = async () => {
    try {
      const allPrompts = prompts.map(p => p.fullPrompt).join('\n\n');
      await navigator.clipboard.writeText(allPrompts);
      setSuccessMessage('すべてのプロンプトをコピーしました');
    } catch (err) {
      console.error('一括コピーエラー:', err);
      setError('プロンプトの一括コピーに失敗しました。');
    }
  };
  
  // お気に入り切り替え
  const toggleFavorite = (promptId: number) => {
    // 現在表示しているプロンプトのリストを取得
    const currentPrompts = activeTab === 'prompts' 
      ? prompts 
      : activeTab === 'favorites' 
        ? favorites 
        : history;
    
    // 対象のプロンプトを見つける
    const targetPrompt = currentPrompts.find(p => p.id === promptId);
    if (!targetPrompt) return;
    
    // お気に入り状態を反転
    const newFavoriteStatus = !targetPrompt.isFavorite;
    
    // すべてのプロンプトリストを更新
    const updatePromptList = (list: Prompt[]): Prompt[] => {
      return list.map(p => 
        p.id === promptId ? { ...p, isFavorite: newFavoriteStatus } : p
      );
    };
    
    const updatedPrompts = updatePromptList(prompts);
    const updatedHistory = updatePromptList(history);
    
    // お気に入りリストの更新
    let updatedFavorites: Prompt[];
    if (newFavoriteStatus) {
      // お気に入りに追加
      updatedFavorites = [
        { ...targetPrompt, isFavorite: true },
        ...favorites.filter(f => f.id !== promptId)
      ];
      setSuccessMessage('お気に入りに追加しました');
    } else {
      // お気に入りから削除
      updatedFavorites = favorites.filter(f => f.id !== promptId);
      setSuccessMessage('お気に入りから削除しました');
    }
    
    // 状態更新
    setPrompts(updatedPrompts);
    setFavorites(updatedFavorites);
    setHistory(updatedHistory);
    
    // お気に入りをストレージに保存
    saveFavorites(updatedFavorites);
    saveHistory(updatedHistory);
  };
  
  // 評価の変更
  const handleRatingChange = (promptId: number, rating: number) => {
    // すべてのプロンプトリストを更新する関数
    const updatePromptList = (list: Prompt[]): Prompt[] => {
      return list.map(p => 
        p.id === promptId ? { ...p, rating } : p
      );
    };
    
    const updatedPrompts = updatePromptList(prompts);
    const updatedFavorites = updatePromptList(favorites);
    const updatedHistory = updatePromptList(history);
    
    // 状態更新
    setPrompts(updatedPrompts);
    setFavorites(updatedFavorites);
    setHistory(updatedHistory);
    
    // ストレージに保存
    saveFavorites(updatedFavorites);
    saveHistory(updatedHistory);
    
    setSuccessMessage(`${rating}つ星の評価を保存しました`);
  };
  
  // 画像のアップロード
  const handleImageUpload = (promptId: number, file: File) => {
    // ファイルをBase64に変換
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target || typeof e.target.result !== 'string') return;
      
      const imagePath = e.target.result;
      
      // すべてのプロンプトリストを更新する関数
      const updatePromptList = (list: Prompt[]): Prompt[] => {
        return list.map(p => 
          p.id === promptId ? { ...p, resultImagePath: imagePath } : p
        );
      };
      
      const updatedPrompts = updatePromptList(prompts);
      const updatedFavorites = updatePromptList(favorites);
      const updatedHistory = updatePromptList(history);
      
      // 状態更新
      setPrompts(updatedPrompts);
      setFavorites(updatedFavorites);
      setHistory(updatedHistory);
      
      // ストレージに保存
      saveFavorites(updatedFavorites);
      saveHistory(updatedHistory);
      
      setSuccessMessage('画像を保存しました');
    };
    
    reader.readAsDataURL(file);
  };
  
  // フィルターの変更
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  // 設定の変更
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // エラーメッセージを閉じる
  const clearError = () => {
    setError(null);
  };
  
  // 現在のタブに基づいてプロンプトリストを取得
  const getActivePrompts = (): Prompt[] => {
    switch (activeTab) {
      case 'favorites':
        return favorites;
      case 'history':
        return history;
      case 'prompts':
      default:
        return prompts;
    }
  };
  
  // 現在アクティブなプロンプト
  const activePrompts = getActivePrompts();
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            MidJourney 制服プロンプトジェネレーター
          </h1>
          
          {/* データベースの状態表示 */}
          <DatabaseStatus className="text-right" />
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-8 text-blue-800 dark:text-blue-200 text-sm">
          <p className="font-medium mb-2">プロンプト生成の改善点：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>性別フィルターがプロンプトに正しく反映されるようになりました</li>
            <li>制服タイプの表示が日本語化されました</li>
            <li>背景をシンプルにして制服デザインに焦点を当てるように改善しました</li>
          </ul>
        </div>
        
        {/* 設定パネル */}
        <SettingsPanel 
          settings={settings} 
          onSettingsChange={handleSettingsChange}
          onDatabaseUpdate={handleDatabaseUpdate}
        />
        
        {/* フィルターパネル */}
        <FilterPanel 
          uniformTypes={uniformTypes} 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
        
        {/* 生成ボタン */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateNewPrompts}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300 dark:disabled:bg-blue-900 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-5 h-5" />
              プロンプト生成
            </button>

            {prompts.length > 0 && (
              <button
                onClick={copyAllPrompts}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                すべてコピー
              </button>
            )}
          </div>
          
          {/* 成功メッセージ */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="text-green-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* ローディングインジケーター */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">データを読み込み中...</span>
            </div>
          )}
          
          {/* データベースステータス - データがない場合に表示 */}
          {!isLoading && uniformTypes.length === 0 && (
            <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded">
              <p className="font-medium">データベースが読み込まれていません</p>
              <p className="mt-2">データベース管理からデータを読み込んでください。</p>
              <button
                onClick={loadData}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                再読み込み
              </button>
            </div>
          )}
        </div>
        
        {/* タブナビゲーション */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`py-2 px-1 ${
                activeTab === 'prompts'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              生成したプロンプト ({prompts.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 flex items-center ${
                activeTab === 'favorites'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              お気に入り ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 flex items-center ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <History className="w-4 h-4 mr-1" />
              履歴 ({history.length})
            </button>
          </nav>
        </div>
        
        {/* プロンプト一覧 */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activePrompts.length > 0 ? (
              activePrompts.map((prompt, index) => (
                <PromptCard
                  key={`${prompt.id}-${index}`} // インデックスを追加して一意性を確保
                  prompt={prompt}
                  onCopy={copyPrompt}
                  onToggleFavorite={toggleFavorite}
                  onRatingChange={handleRatingChange}
                  onImageUpload={handleImageUpload}
                  showUploadButton={true}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                {activeTab === 'prompts' && '生成ボタンをクリックしてプロンプトを作成してください。'}
                {activeTab === 'favorites' && 'お気に入りに登録されたプロンプトはありません。'}
                {activeTab === 'history' && '履歴にプロンプトはありません。'}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* フッター */}
      <footer className="mt-10 pb-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>MidJourney 制服プロンプトジェネレーター &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">
          制服デザインプロンプトの生成・管理ツール
        </p>
      </footer>
    </div>
  );
}
