import React, { useState, useEffect } from 'react';
import { 
  getDatabaseStatus, 
  loadBrandChunk,
  loadAllChunks,
  resetDatabase,
  loadInitialData
} from '../../services/dataService';

interface DatabaseStatusProps {
  onDataUpdate: () => void;
}

const DatabaseManager: React.FC<DatabaseStatusProps> = ({ onDataUpdate }) => {
  const [status, setStatus] = useState<{
    totalBrands: number;
    loadedBrands: number;
    totalChunks: number;
    loadedChunks: number[];
    lastUpdated: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // データベース状態の読み込み
  const loadStatus = async () => {
    try {
      const dbStatus = await getDatabaseStatus();
      setStatus(dbStatus);
    } catch (error) {
      console.error('データベース状態の取得エラー:', error);
      setMessage('データベース状態の取得に失敗しました');
    }
  };
  
  // 初期読み込み
  useEffect(() => {
    loadStatus();
  }, []);
  
  // 特定のチャンクを読み込む
  const handleLoadChunk = async (chunkId: number) => {
    if (loading) return;
    
    setLoading(true);
    setMessage(`チャンク ${chunkId} を読み込み中...`);
    
    try {
      await loadBrandChunk(chunkId);
      await loadStatus();
      onDataUpdate();
      setMessage(`チャンク ${chunkId} を読み込みました`);
    } catch (error) {
      console.error(`チャンク ${chunkId} の読み込みエラー:`, error);
      setMessage(`チャンク ${chunkId} の読み込みに失敗しました`);
    } finally {
      setLoading(false);
    }
  };
  
  // すべてのチャンクを読み込む
  const handleLoadAllChunks = async () => {
    if (loading) return;
    
    setLoading(true);
    setMessage('すべてのチャンクを読み込み中...');
    
    try {
      await loadAllChunks();
      await loadStatus();
      onDataUpdate();
      setMessage('すべてのチャンクを読み込みました');
    } catch (error) {
      console.error('全チャンク読み込みエラー:', error);
      setMessage('すべてのチャンクの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // データベースをリセット
  const handleResetDatabase = async () => {
    if (loading) return;
    
    if (!window.confirm('データベースをリセットしますか？すべての読み込み済みデータがクリアされます。')) {
      return;
    }
    
    setLoading(true);
    setMessage('データベースをリセット中...');
    
    try {
      resetDatabase();
      await loadInitialData();
      await loadStatus();
      onDataUpdate();
      setMessage('データベースをリセットしました');
    } catch (error) {
      console.error('データベースリセットエラー:', error);
      setMessage('データベースのリセットに失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // ステータスが取得できていない場合
  if (!status) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          データベース管理
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          データベース情報を読み込み中...
        </p>
      </div>
    );
  }
  
  // すべてのチャンクが読み込まれているかチェック
  const allChunksLoaded = status.loadedChunks.length === status.totalChunks;
  
  // 読み込まれていないチャンクIDのリスト
  const unloadedChunks = Array.from(
    { length: status.totalChunks }, 
    (_, i) => i + 1
  ).filter(id => !status.loadedChunks.includes(id));
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        データベース管理
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">ブランド：</span> 
          {status.loadedBrands} / {status.totalBrands} 件読み込み済み 
          ({Math.round((status.loadedBrands / status.totalBrands) * 100)}%)
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">チャンク：</span> 
          {status.loadedChunks.length} / {status.totalChunks} 件読み込み済み
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">最終更新：</span> 
          {new Date(status.lastUpdated).toLocaleString()}
        </p>
      </div>
      
      {message && (
        <div className={`text-sm p-2 mb-3 rounded ${
          message.includes('失敗') 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* すべてのチャンクを読み込むボタン */}
        {!allChunksLoaded && (
          <button
            onClick={handleLoadAllChunks}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded disabled:opacity-50"
          >
            すべてのブランドを読み込む
          </button>
        )}
        
        {/* データベースリセットボタン */}
        <button
          onClick={handleResetDatabase}
          disabled={loading}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded disabled:opacity-50"
        >
          リセット
        </button>
      </div>
      
      {/* 個別チャンク読み込みボタン */}
      {unloadedChunks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            未読み込みチャンク:
          </h3>
          <div className="flex flex-wrap gap-1">
            {unloadedChunks.map(chunkId => (
              <button
                key={chunkId}
                onClick={() => handleLoadChunk(chunkId)}
                disabled={loading}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded disabled:opacity-50"
              >
                チャンク {chunkId}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;
