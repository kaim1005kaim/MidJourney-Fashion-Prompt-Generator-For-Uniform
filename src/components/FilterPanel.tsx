// components/FilterPanel.tsx
import React, { useState } from 'react';
import { UniformType, FilterOptions } from '../types';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

// 英語から日本語への変換マッピング
const industryTranslations: { [key: string]: string } = {
  "Restaurants": "レストラン",
  "Cafes": "カフェ",
  "Fast Food": "ファーストフード",
  "Dining Bars": "ダイニングバー",
  "Hotel Restaurants": "ホテルレストラン",
  "Events": "イベント",
  "Railways": "鉄道",
  "Hotels": "ホテル",
  "Reception": "受付",
  "Clinics": "クリニック",
  "Corporations": "企業",
  "Factories": "工場",
  "Construction": "建設現場",
  "Cleaning": "清掃",
  "Building Maintenance": "ビル管理",
  "Hospitals": "病院",
  "Research Institutions": "研究機関",
  "Care Facilities": "介護施設",
  "Home Care": "在宅介護"
};

const styleTranslations: { [key: string]: string } = {
  "casual": "カジュアル",
  "easy to move in": "動きやすい",
  "approachable": "親しみやすい",
  "modern casual": "モダンカジュアル",
  "street style": "ストリートスタイル",
  "workwear style": "ワークウェアスタイル",
  "formal": "フォーマル",
  "elegant": "エレガント",
  "sophisticated": "洗練された",
  "classic": "クラシック",
  "professional": "プロフェッショナル",
  "refined": "上品",
  "hygienic": "衛生的",
  "functional": "機能的",
  "durable": "耐久性のある",
  "modern": "モダン",
  "visible": "目立つ",
  "sporty": "スポーティ",
  "teamwear": "チームウェア",
  "branding": "ブランディング",
  "reliable": "信頼感のある",
  "authoritative": "権威のある",
  "sharp": "シャープ",
  "luxurious": "豪華",
  "hospitality": "おもてなし",
  "clean look": "清潔感",
  "practical": "実用的",
  "understated": "控えめ",
  "neat": "きちんとした",
  "trustworthy": "信頼できる",
  "clean": "清潔",
  "protective": "保護性の高い",
  "high visibility": "高視認性",
  "tough": "タフ",
  "outdoor work": "屋外作業向け",
  "simple": "シンプル",
  "comfortable": "快適",
  "quick-dry": "速乾性",
  "authority": "権威",
  "cleanliness": "清潔感",
  "gentle impression": "優しい印象",
  "easy to wash": "洗いやすい",
  "rugged": "頑丈",
  "safety first": "安全第一",
  "industrial": "産業的"
};

const materialTranslations: { [key: string]: string } = {
  "cotton": "コットン",
  "polyester blend": "ポリエステルブレンド",
  "denim": "デニム",
  "canvas": "キャンバス",
  "wool blend": "ウールブレンド",
  "cotton broadcloth": "コットンブロード",
  "twill": "ツイル",
  "polyester cotton": "ポリコットン",
  "polyester": "ポリエステル",
  "nylon": "ナイロン",
  "fleece": "フリース",
  "durable synthetics": "耐久性合成繊維",
  "silk-like fabric": "シルクライク素材",
  "stretch fabric": "ストレッチ素材",
  "knit": "ニット",
  "heavy-duty cotton": "ヘビーデューティコットン",
  "flame-retardant fabric": "難燃素材",
  "reinforcement fabric": "補強素材",
  "high-strength polyester": "高強度ポリエステル",
  "heavy-duty cotton canvas": "ヘビーデューティコットンキャンバス",
  "waterproof breathable fabric": "防水透湿素材",
  "reflective material": "反射材",
  "quick-dry fabric": "速乾素材",
  "antibacterial fabric": "抗菌素材"
};

const colorTranslations: { [key: string]: string } = {
  "black": "黒",
  "charcoal grey": "チャコールグレー",
  "navy": "ネイビー",
  "khaki": "カーキ",
  "brown": "茶色",
  "burgundy": "バーガンディ",
  "terracotta": "テラコッタ",
  "off-white": "オフホワイト",
  "vivid colors": "鮮やかな色",
  "white": "白",
  "grey": "グレー",
  "wine red": "ワインレッド",
  "bottle green": "ボトルグリーン",
  "beige": "ベージュ",
  "pinstripe pattern": "ピンストライプ",
  "check pattern": "チェック柄",
  "stripe pattern": "ストライプ柄",
  "corporate colors": "企業カラー",
  "neon colors": "ネオンカラー",
  "accent colors (stripes, logos)": "アクセントカラー（ストライプ、ロゴ）",
  "gold accents": "ゴールドアクセント",
  "silver accents": "シルバーアクセント",
  "light blue": "ライトブルー",
  "pink": "ピンク",
  "pastel colors": "パステルカラー",
  "neutrals (beige, grey, navy, black)": "ニュートラルカラー（ベージュ、グレー、ネイビー、黒）",
  "green": "緑",
  "blue": "青",
  "orange (safety)": "オレンジ（安全色）",
  "yellow (safety)": "イエロー（安全色）",
  "purple": "紫",
  "print patterns (pediatrics etc.)": "プリント柄（小児科等）"
};

const genderTranslations: { [key: string]: string } = {
  "male": "男性",
  "female": "女性",
  "unisex": "ユニセックス"
};

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
  
  // 性別のオプション
  const allGenders = ["male", "female"];
  
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
  
  const handleGenderChange = (gender: string) => {
    const updatedGenders = filters.genders.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...filters.genders, gender];
    
    onFilterChange({
      ...filters,
      genders: updatedGenders
    });
  };
  
  const handleClearAll = () => {
    onFilterChange({
      uniformTypes: [],
      industries: [],
      styles: [],
      materials: [],
      colors: [],
      genders: []
    });
  };
  
  // 選択済みフィルターの合計数を計算
  const activeFilterCount = 
    filters.uniformTypes.length + 
    filters.industries.length + 
    filters.styles.length +
    filters.materials.length +
    filters.colors.length +
    filters.genders.length;
  
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
          
          {/* 性別フィルター */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">性別</h4>
            <div className="flex flex-wrap gap-2">
              {allGenders.map(gender => (
                <button
                  key={gender}
                  onClick={() => handleGenderChange(gender)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors
                    ${filters.genders.includes(gender)
                      ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100 border border-pink-200 dark:border-pink-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {genderTranslations[gender] || gender}
                </button>
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
                  {industryTranslations[industry] || industry}
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
                  {styleTranslations[style] || style}
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
                  {materialTranslations[material] || material}
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
                  {colorTranslations[color] || color}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
