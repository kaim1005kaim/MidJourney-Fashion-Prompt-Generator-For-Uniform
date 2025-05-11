// components/FilterPanel.tsx
import React, { useState } from 'react';
import { UniformType, FilterOptions } from '../types';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

interface FilterPanelProps {
  uniformTypes: UniformType[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function FilterPanel({ uniformTypes, filters, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 利用可能な業界、スタイル、素材、色を取得
  const allIndustries = Array.from(new Set(
    uniformTypes.flatMap(uniform => uniform.industries)
  )).sort();
  
  const allStyles = Array.from(new Set(
    uniformTypes.flatMap(uniform => uniform.style_keywords)
  )).sort();
  
  const allMaterials = Array.from(new Set(
    uniformTypes.flatMap(uniform => uniform.materials)
  )).sort();
  
  const allColors = Array.from(new Set(
    uniformTypes.flatMap(uniform => uniform.color_palette)
  )).sort();
  
  // フィルター変更ハンドラー
  const handleUniformTypeChange = (uniformId: string) => {
    const updatedUniformTypes = filters.uniformTypes.includes(uniformId)
      ? filters.uniformTypes.filter(id => id !== uniformId)
      : [...filters.uniformTypes, uniformId];
    
    onFilterChange({
      ...filters,
      uniformTypes: updatedUniformTypes
    });
  };
  
  const handleIndustryChange = (industry: string) => {
    const updatedIndustries = filters.industries.includes(industry)
      ? filters.industries.filter(i => i !== industry)
      : [...filters.industries, industry];
    
    onFilterChange({
      ...filters,
      industries: updatedIndustries
    });
  };
  
  const handleStyleChange = (style: string) => {
    const updatedStyles = filters.styles.includes(style)
      ? filters.styles.filter(s => s !== style)
      : [...filters.styles, style];
    
    onFilterChange({
      ...filters,
      styles: updatedStyles
    });
  };
  
  const handleMaterialChange = (material: string) => {
    const updatedMaterials = filters.materials.includes(material)
      ? filters.materials.filter(m => m !== material)
      : [...filters.materials, material];
    
    onFilterChange({
      ...filters,
      materials: updatedMaterials
    });
  };
  
  const handleColorChange = (color: string) => {
    const updatedColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    onFilterChange({
      ...filters,
      colors: updatedColors
    });
  };
  
  const handleClearAll = () => {
    onFilterChange({
      uniformTypes: [],
      industries: [],
      styles: [],
      materials: [],
      colors: []
    });
  };
  
  // 選択済みフィルターの合計数を計算
  const activeFilterCount = 
    filters.uniformTypes.length + 
    filters.industries.length + 
    filters.styles.length +
    filters.materials.length +
    filters.colors.length;
  
  // 制服タイプを名前順にソート
  const sortedUniformTypes = [...uniformTypes].sort((a, b) => 
    a.uniform_name.localeCompare(b.uniform_name)
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="font-medium text-gray-800 dark:text-white">フィルター</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              すべてクリア
            </button>
          )}
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
      
      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* 制服タイプフィルター */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">制服タイプ</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sortedUniformTypes.map(uniform => (
                <div key={uniform.uniform_id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`uniform-${uniform.uniform_id}`}
                    checked={filters.uniformTypes.includes(uniform.uniform_id)}
                    onChange={() => handleUniformTypeChange(uniform.uniform_id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label 
                    htmlFor={`uniform-${uniform.uniform_id}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {uniform.uniform_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* 業界フィルター */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">業界</h4>
            <div className="flex flex-wrap gap-2">
              {allIndustries.map(industry => (
                <button
                  key={industry}
                  onClick={() => handleIndustryChange(industry)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors
                    ${filters.industries.includes(industry)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
          
          {/* スタイルフィルター */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">スタイル</h4>
            <div className="flex flex-wrap gap-2">
              {allStyles.map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors
                    ${filters.styles.includes(style)
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border border-purple-200 dark:border-purple-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          
          {/* 素材フィルター */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">素材</h4>
            <div className="flex flex-wrap gap-2">
              {allMaterials.map(material => (
                <button
                  key={material}
                  onClick={() => handleMaterialChange(material)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors
                    ${filters.materials.includes(material)
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-200 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>
          
          {/* 色フィルター */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">色</h4>
            <div className="flex flex-wrap gap-2">
              {allColors.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors
                    ${filters.colors.includes(color)
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 border border-orange-200 dark:border-orange-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
