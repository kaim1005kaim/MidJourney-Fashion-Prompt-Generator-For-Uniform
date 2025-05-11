// App.tsx
import React from 'react';
import PromptGenerator from './components/PromptGenerator';
import './index.css';

function App() {
  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <PromptGenerator />
      
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

export default App;
