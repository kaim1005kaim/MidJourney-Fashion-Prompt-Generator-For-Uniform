// components/EnhancedPromptGenerator.tsx
import React, { useState, useEffect } from 'react';
import { UniformType, PhraseVariations, FilterOptions, Prompt, AppSettings } from '../types';
import { generateEnhancedPrompt, generateEnhancedPrompts, EnhancedPromptOptions } from '../services/enhancedPromptService';
import PromptCard from './PromptCard';
import { Wand2, Settings2, Copy, Check, ChevronDown, ChevronUp, RefreshCw, Filter, X } from 'lucide-react';

// 制服タイプの英語→日本語変換
const uniformTypeTranslations: { [key: string]: string } = {
  "Caregiver Uniform": "介護士制服",
  "Cleaning Staff Uniform": "清掃スタッフ制服",
  "Construction Worker Uniform": "建設作業員制服",
  "Event Staff (General) Uniform": "イベントスタッフ制服",
  "Factory Worker Uniform": "工場作業員制服",
  "Hospital Staff (Doctor) Uniform": "病院スタッフ(医師)制服",
  "Hospital Staff (Nurse/Medical) Uniform": "病院スタッフ(看護師/医療)制服",
  "Hotel Housekeeping Uniform": "ホテルハウスキーピング制服",
  "Hotel Staff (Front/Bell) Uniform": "ホテルスタッフ(フロント/ベル)制服",
  "Railway Staff Uniform": "鉄道スタッフ制服",
  "Receptionist Uniform": "受付スタッフ制服",
  "Restaurant Chef / Kitchen Staff Uniform": "レストランシェフ/キッチンスタッフ制服",
  "Restaurant Staff (Casual) Uniform": "レストランスタッフ(カジュアル)制服",
  "Restaurant Staff (Formal) Uniform": "レストランスタッフ(フォーマル)制服"
};

interface EnhancedPromptGeneratorProps {
  uniformTypes: UniformType[];
  phraseVariations: PhraseVariations;
  filters?: FilterOptions;
  settings: AppSettings;
  onCopy?: (prompt: string) => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export default function EnhancedPromptGenerator({
  uniformTypes,
  phraseVariations,
  filters,
  settings,
  onCopy,
  onSettingsChange
}: EnhancedPromptGeneratorProps) {
  // 状態
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<EnhancedPromptOptions>({
    elementsCount: { min: 2, max: 3 },
    materialsCount: { min: 1, max: 2 },
    colorsCount: { min: 1, max: 2 },
    styleKeywordsCount: { min: 1, max: 3 },
    naturalLanguageStructure: true,
    includeSinglePerson: true,
    includeBackground: true,
    includeIndustry: true
  });
  const [selectedUniformId, setSelectedUniformId] = useState<string>("");
  const [promptCount, setPromptCount] = useState(settings.promptCount);
  const [isCopied, setIsCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // プロンプト生成
  const generatePrompts = () => {
    if (uniformTypes.length === 0) {
      alert('制服データが読み込まれていません。');
      return;
    }
    
    if (!phraseVariations || Object.keys(phraseVariations).length === 0) {
      alert('フレーズバリエーションデータが読み込まれていません。');
      return;
    }
    
    try {
      // 選択された制服ID（なければランダム）
      const uniformId = selectedUniformId || undefined;
      
      // オプションの準備
      const options: EnhancedPromptOptions = {
        ...generationOptions,
        existingPrompts: prompts
      };
      
      // プロンプト生成
      const newPrompts = generateEnhancedPrompts(
        uniformTypes,
        phraseVariations,
        promptCount,
        filters,
        settings,
        options
      );
      
      setPrompts(newPrompts);
      setSuccessMessage(`${newPrompts.length}件のプロンプトを生成しました`);
    } catch (error) {
      console.error('プロンプト生成エラー:', error);
      alert(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };
  
  // プロンプトをコピー
  const handleCopy = (promptText: string) => {
    if (onCopy) {
      onCopy(promptText);
    } else {
      navigator.clipboard.writeText(promptText)
        .then(() => {
          setIsCopied(true);
          setSuccessMessage('プロンプトをコピーしました');
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('コピーエラー:', err);
          alert('プロンプトのコピーに失敗しました。');
        });
    }
  };
  
  // すべてのプロンプトをコピー
  const copyAllPrompts = () => {
    const allPrompts = prompts.map(p => p.fullPrompt).join('\n\n');
    
    if (onCopy) {
      onCopy(allPrompts);
    } else {
      navigator.clipboard.writeText(allPrompts)
        .then(() => {
          setIsCopied(true);
          setSuccessMessage('すべてのプロンプトをコピーしました');
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('一括コピーエラー:', err);
          alert('プロンプトの一括コピーに失敗しました。');
        });
    }
  };
  
  // オプション更新ハンドラー
  const updateOption = <K extends keyof EnhancedPromptOptions>(
    key: K,
    value: EnhancedPromptOptions[K]
  ) => {
    setGenerationOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 数値範囲の更新
  const updateRangeOption = (
    key: 'elementsCount' | 'materialsCount' | 'colorsCount' | 'styleKeywordsCount',
    type: 'min' | 'max',
    value: number
  ) => {
    setGenerationOptions(prev => {
      const current = prev[key] || { min: 1, max: 1 };
      let newValue = { ...current };
      
      if (type === 'min') {
        newValue.min = value;
        // min > max の場合は max も更新
        if (value > newValue.max) newValue.max = value;
      } else {
        newValue.max = value;
        // max < min の場合は min も更新
        if (value < newValue.min) newValue.min = value;
      }
      
      return {
        ...prev,
        [key]: newValue
      };
    });
  };
  
  // 成功メッセージの自動消去
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-500" />
          拡張プロンプトジェネレーター
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            より柔軟なオプションでMidJourneyプロンプトを生成します。
          </p>
          
          {/* 詳細設定トグル */}
          <button
            className={`flex items-center gap-1 text-sm ${
              isAdvancedMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          >
            <Settings2 className="w-4 h-4" />
            詳細設定
            {isAdvancedMode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* 生成設定 */}
        <div className="mb-6 space-y-4">
          {/* 基本設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* プロンプト生成数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                生成数: {promptCount}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={promptCount}
                onChange={(e) => setPromptCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
            
            {/* 制服選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                制服タイプ (任意)
              </label>
              <select
                value={selectedUniformId}
                onChange={(e) => setSelectedUniformId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="">ランダム選択</option>
                {uniformTypes.map((uniform) => (
                  <option key={uniform.uniform_id} value={uniform.uniform_id}>
                    {uniformTypeTranslations[uniform.uniform_name] || uniform.uniform_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 共通オプション */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">共通設定</h3>
            
            {/* 日本人モデル設定 */}
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enhanced-japanese-model"
                  checked={settings.useJapaneseModel}
                  onChange={(e) => {
                    if (onSettingsChange) {
                      onSettingsChange({
                        ...settings,
                        useJapaneseModel: e.target.checked
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="enhanced-japanese-model" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  日本人モデルを使用する
                </label>
              </div>
              <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                プロンプトに「Japanese person」または「Asian person」を追加します
              </p>
            </div>
            
            {/* アスペクト比設定 */}
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enhanced-include-ar"
                  checked={settings.includeAspectRatio}
                  onChange={(e) => {
                    if (onSettingsChange) {
                      onSettingsChange({
                        ...settings,
                        includeAspectRatio: e.target.checked
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="enhanced-include-ar" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  アスペクト比を含める
                </label>
              </div>
              {settings.includeAspectRatio && (
                <div className="ml-6">
                  <select
                    value={settings.aspectRatio}
                    onChange={(e) => {
                      if (onSettingsChange) {
                        onSettingsChange({
                          ...settings,
                          aspectRatio: e.target.value
                        });
                      }
                    }}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="--ar 4:5">縦長 - Instagram推奨 (4:5)</option>
                    <option value="--ar 1:1">正方形 (1:1)</option>
                    <option value="--ar 3:2">標準写真 (3:2)</option>
                    <option value="--ar 16:9">16:9 ワイドスクリーン</option>
                    <option value="--ar 2:1">パノラマ (2:1)</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* バージョン設定 */}
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enhanced-include-version"
                  checked={settings.includeVersion}
                  onChange={(e) => {
                    if (onSettingsChange) {
                      onSettingsChange({
                        ...settings,
                        includeVersion: e.target.checked
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="enhanced-include-version" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  バージョンを含める
                </label>
              </div>
              {settings.includeVersion && (
                <div className="ml-6">
                  <select
                    value={settings.version}
                    onChange={(e) => {
                      if (onSettingsChange) {
                        onSettingsChange({
                          ...settings,
                          version: e.target.value
                        });
                      }
                    }}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="--v 7.0">v7.0 (最新版)</option>
                    <option value="--v 6.0">v6.0</option>
                    <option value="--v 5.2">v5.2</option>
                    <option value="--v 5.1">v5.1</option>
                    <option value="--v 4.0">v4.0</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* スタイライズ設定 */}
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enhanced-include-stylize"
                  checked={settings.includeStylize}
                  onChange={(e) => {
                    if (onSettingsChange) {
                      onSettingsChange({
                        ...settings,
                        includeStylize: e.target.checked
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="enhanced-include-stylize" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  スタイライズを含める
                </label>
              </div>
              {settings.includeStylize && (
                <div className="ml-6">
                  <select
                    value={settings.stylize}
                    onChange={(e) => {
                      if (onSettingsChange) {
                        onSettingsChange({
                          ...settings,
                          stylize: e.target.value
                        });
                      }
                    }}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="s100">s100 (標準)</option>
                    <option value="s250">s250 (中程度)</option>
                    <option value="s500">s500 (強)</option>
                    <option value="s750">s750 (非常に強)</option>
                    <option value="s1000">s1000 (最大)</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* カスタムサフィックス */}
            <div>
              <label htmlFor="enhanced-custom-suffix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                カスタムサフィックス
              </label>
              <input
                type="text"
                id="enhanced-custom-suffix"
                value={settings.customSuffix}
                onChange={(e) => {
                  if (onSettingsChange) {
                    onSettingsChange({
                      ...settings,
                      customSuffix: e.target.value
                    });
                  }
                }}
                placeholder="例: --stop 80 --raw"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                すべてのプロンプトの末尾に追加するパラメータを指定します
              </p>
            </div>
          </div>
          
          {/* 詳細設定 */}
          {isAdvancedMode && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-800 dark:text-white">詳細設定</h3>
              
              {/* 要素数設定 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">要素数設定</h4>
                
                {/* キー要素数 */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    キー要素: {generationOptions.elementsCount?.min} 〜 {generationOptions.elementsCount?.max}個
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最小</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={generationOptions.elementsCount?.min || 1}
                        onChange={(e) => updateRangeOption('elementsCount', 'min', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最大</label>
                      <input
                        type="range"
                        min={generationOptions.elementsCount?.min || 1}
                        max="5"
                        value={generationOptions.elementsCount?.max || 1}
                        onChange={(e) => updateRangeOption('elementsCount', 'max', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 素材数 */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    素材: {generationOptions.materialsCount?.min} 〜 {generationOptions.materialsCount?.max}種類
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最小</label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        value={generationOptions.materialsCount?.min || 1}
                        onChange={(e) => updateRangeOption('materialsCount', 'min', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最大</label>
                      <input
                        type="range"
                        min={generationOptions.materialsCount?.min || 1}
                        max="3"
                        value={generationOptions.materialsCount?.max || 1}
                        onChange={(e) => updateRangeOption('materialsCount', 'max', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 色数 */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    色: {generationOptions.colorsCount?.min} 〜 {generationOptions.colorsCount?.max}色
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最小</label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        value={generationOptions.colorsCount?.min || 1}
                        onChange={(e) => updateRangeOption('colorsCount', 'min', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最大</label>
                      <input
                        type="range"
                        min={generationOptions.colorsCount?.min || 1}
                        max="3"
                        value={generationOptions.colorsCount?.max || 1}
                        onChange={(e) => updateRangeOption('colorsCount', 'max', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* スタイルキーワード数 */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    スタイルキーワード: {generationOptions.styleKeywordsCount?.min} 〜 {generationOptions.styleKeywordsCount?.max}個
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最小</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={generationOptions.styleKeywordsCount?.min || 1}
                        onChange={(e) => updateRangeOption('styleKeywordsCount', 'min', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">最大</label>
                      <input
                        type="range"
                        min={generationOptions.styleKeywordsCount?.min || 1}
                        max="5"
                        value={generationOptions.styleKeywordsCount?.max || 1}
                        onChange={(e) => updateRangeOption('styleKeywordsCount', 'max', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* プロンプト構造設定 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">プロンプト構造設定</h4>
                
                <div className="flex flex-col gap-2">
                  {/* 自然言語構造 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="natural-language"
                      checked={generationOptions.naturalLanguageStructure}
                      onChange={(e) => updateOption('naturalLanguageStructure', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="natural-language" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      自然言語構造を使用する
                    </label>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (「A photo of a person wearing...」のような自然な文章)
                    </span>
                  </div>
                  
                  {/* 業界の含有 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-industry"
                      checked={generationOptions.includeIndustry}
                      onChange={(e) => updateOption('includeIndustry', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="include-industry" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      業界情報を含める
                    </label>
                  </div>
                  
                  {/* 人物指定の含有 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-single-person"
                      checked={generationOptions.includeSinglePerson}
                      onChange={(e) => updateOption('includeSinglePerson', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="include-single-person" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      「single person」を含める
                    </label>
                  </div>
                  
                  {/* 背景指定の含有 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-background"
                      checked={generationOptions.includeBackground}
                      onChange={(e) => updateOption('includeBackground', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="include-background" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      背景指定を含める
                    </label>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (「simple white background, studio shot」など)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* リセットボタン */}
              <div className="flex justify-end">
                <button
                  onClick={() => setGenerationOptions({
                    elementsCount: { min: 2, max: 3 },
                    materialsCount: { min: 1, max: 2 },
                    colorsCount: { min: 1, max: 2 },
                    styleKeywordsCount: { min: 1, max: 3 },
                    naturalLanguageStructure: true,
                    includeSinglePerson: true,
                    includeBackground: true,
                    includeIndustry: true
                  })}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <RefreshCw className="w-4 h-4" />
                  デフォルトに戻す
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 操作ボタン */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generatePrompts}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Wand2 className="w-5 h-5" />
              拡張プロンプト生成
            </button>
            
            {prompts.length > 0 && (
              <button
                onClick={copyAllPrompts}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                すべてコピー
              </button>
            )}
          </div>
          
          {/* 成功メッセージ */}
          {successMessage && (
            <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-1">
              <Check className="w-4 h-4" />
              {successMessage}
            </div>
          )}
        </div>
      </div>
      
      {/* 生成されたプロンプト */}
      {prompts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt, index) => (
            <PromptCard
              key={`${prompt.id}-${index}`}
              prompt={prompt}
              onCopy={handleCopy}
              onToggleFavorite={() => {}}
              onRatingChange={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
