// components/PromptCard.tsx
import React from 'react';
import { Copy, Heart, ImagePlus, Star } from 'lucide-react';
import { Prompt } from '../types';

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (prompt: string) => void;
  onToggleFavorite: (id: number) => void;
  onRatingChange: (id: number, rating: number) => void;
  onImageUpload?: (id: number, file: File) => void;
  showUploadButton?: boolean;
}

export default function PromptCard({
  prompt,
  onCopy,
  onToggleFavorite,
  onRatingChange,
  onImageUpload,
  showUploadButton = false
}: PromptCardProps) {
  // ファイル選択ハンドラー
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && onImageUpload) {
      onImageUpload(prompt.id, event.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
      {/* プロンプト画像があれば表示 */}
      {prompt.resultImagePath && (
        <div className="mb-4">
          <img 
            src={prompt.resultImagePath} 
            alt="Generated Image" 
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <p className="text-gray-800 dark:text-gray-200 flex-grow mr-4 break-words">
          {prompt.fullPrompt}
        </p>
        <button
          onClick={() => onCopy(prompt.fullPrompt)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="コピーする"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
      
      {/* 要素タグ */}
      <div className="flex flex-wrap gap-2 mt-2 text-sm">
        {prompt.brandName && (
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
            {prompt.brandName}
          </span>
        )}
        {prompt.era && (
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">
            {prompt.era}
          </span>
        )}
        {prompt.material && (
          <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded">
            {prompt.material.split(' ').slice(0, 2).join(' ')}
          </span>
        )}
        {prompt.silhouette && (
          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-2 py-1 rounded">
            {prompt.silhouette.split(' ').slice(0, 2).join(' ')}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4">
        {/* 評価スター */}
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(prompt.id, star)}
              className={`w-5 h-5 ${
                prompt.rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              } hover:text-yellow-400 transition-colors`}
              title={`${star}つ星`}
            >
              <Star className="w-full h-full fill-current" />
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {/* 画像アップロードボタン */}
          {showUploadButton && onImageUpload && (
            <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ImagePlus className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}
          
          {/* お気に入りボタン */}
          <button
            onClick={() => onToggleFavorite(prompt.id)}
            className={`${
              prompt.isFavorite 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
            } transition-colors`}
            title={prompt.isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
          >
            <Heart className={`w-5 h-5 ${prompt.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* メモがあれば表示 */}
      {prompt.resultNotes && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
          {prompt.resultNotes}
        </div>
      )}
      
      {/* 作成日時を表示 */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {new Date(prompt.createdDate).toLocaleString()}
      </div>
    </div>
  );
}
