// components/SettingsPanel.tsx
import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Moon, Sun, Database } from 'lucide-react';
import { AppSettings } from '../types';
import { ASPECT_RATIO_OPTIONS, STYLIZE_OPTIONS, VERSION_OPTIONS } from '../services/dataService';
import { DatabaseManager } from './database';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onDatabaseUpdate?: () => void;
}

export default function SettingsPanel({ settings, onSettingsChange, onDatabaseUpdate }: SettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDbManagerOpen, setIsDbManagerOpen] = useState(false);
  
  const handleSettingChange = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="font-medium text-gray-800 dark:text-white">設定</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* データベース管理ボタン */}
          <button
            onClick={() => setIsDbManagerOpen(!isDbManagerOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            title="データベース管理"
          >
            <Database className="w-5 h-5" />
          </button>
          
          {/* ダークモード切替 */}
          <button
            onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
            className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            title={settings.darkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          >
            {settings.darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* データベース管理パネル */}
      {isDbManagerOpen && (
        <div className="mt-4">
          <DatabaseManager onDataUpdate={onDatabaseUpdate || (() => {})} />
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* プロンプト生成数設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              プロンプト生成数: {settings.promptCount}
            </label>
            <input
            type="range"
            min="1"
            max="50"
            value={settings.promptCount}
            onChange={(e) => handleSettingChange('promptCount', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>35</span>
              <span>50</span>
            </div>
          </div>
          
          {/* プロンプトオプション */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">プロンプトオプション</h4>
            
            {/* アスペクト比設定 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-ar"
                  checked={settings.includeAspectRatio}
                  onChange={(e) => handleSettingChange('includeAspectRatio', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="include-ar" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  アスペクト比を含める
                </label>
              </div>
              
              {settings.includeAspectRatio && (
                <div className="ml-6">
                  <select
                    value={settings.aspectRatio}
                    onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {ASPECT_RATIO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* バージョン設定 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-version"
                  checked={settings.includeVersion}
                  onChange={(e) => handleSettingChange('includeVersion', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="include-version" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  バージョンを含める
                </label>
              </div>
              
              {settings.includeVersion && (
                <div className="ml-6">
                  <select
                    value={settings.version}
                    onChange={(e) => handleSettingChange('version', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {VERSION_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* スタイライズ設定 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-stylize"
                  checked={settings.includeStylize}
                  onChange={(e) => handleSettingChange('includeStylize', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="include-stylize" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  スタイライズを含める
                </label>
              </div>
              
              {settings.includeStylize && (
                <div className="ml-6">
                  <select
                    value={settings.stylize}
                    onChange={(e) => handleSettingChange('stylize', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {STYLIZE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* カスタムサフィックス */}
          <div>
            <label htmlFor="custom-suffix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              カスタムサフィックス
            </label>
            <input
              type="text"
              id="custom-suffix"
              value={settings.customSuffix}
              onChange={(e) => handleSettingChange('customSuffix', e.target.value)}
              placeholder="例: --stop 80 --raw"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              すべてのプロンプトの末尾に追加するパラメータを指定します
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
