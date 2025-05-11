import React, { useState, useEffect } from 'react';
import { getDatabaseStatus } from '../../services/dataService';

interface DatabaseStatusProps {
  className?: string;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<{
    totalBrands: number;
    loadedBrands: number;
  } | null>(null);
  
  // データベース状態の読み込み
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const dbStatus = await getDatabaseStatus();
        setStatus({
          totalBrands: dbStatus.totalBrands,
          loadedBrands: dbStatus.loadedBrands
        });
      } catch (error) {
        console.error('データベース状態の取得エラー:', error);
      }
    };
    
    loadStatus();
  }, []);
  
  if (!status) {
    return null;
  }
  
  const percentage = Math.round((status.loadedBrands / status.totalBrands) * 100);
  
  return (
    <div className={`text-xs text-gray-500 dark:text-gray-400 ${className || ''}`}>
      ブランドデータ: {status.loadedBrands}/{status.totalBrands} ({percentage}%)
    </div>
  );
};

export default DatabaseStatus;
