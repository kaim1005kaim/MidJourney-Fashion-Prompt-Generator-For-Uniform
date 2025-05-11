// utils/dataUtils.ts
import { RawBrand, Brand, PhraseVariations } from '../types';

/**
 * 文字列をカンマまたはカンマと空白で分割し、トリミングして配列に変換する
 */
export function splitAndTrim(text: string): string[] {
  return text.split(/,\s*/).map(item => item.trim()).filter(Boolean);
}

/**
 * JSON形式のブランドデータをアプリケーションで使用する形式に変換する
 */
export function convertBrand(rawBrand: RawBrand): Brand {
  return {
    id: rawBrand.brand_id,
    name: rawBrand.brand_name,
    eraStart: rawBrand.era_start,
    eraEnd: rawBrand.era_end,
    coreStyle: splitAndTrim(rawBrand.core_style),
    signatureElements: splitAndTrim(rawBrand.signature_elements),
    materials: splitAndTrim(rawBrand.materials),
    silhouettes: splitAndTrim(rawBrand.silhouettes),
    colorPalette: splitAndTrim(rawBrand.color_palette),
    lighting: Array.isArray(rawBrand.lighting) ? rawBrand.lighting : (rawBrand.lighting ? splitAndTrim(rawBrand.lighting as string) : []),
    atmosphereMood: Array.isArray(rawBrand.atmosphere_mood) ? rawBrand.atmosphere_mood : (rawBrand.atmosphere_mood ? splitAndTrim(rawBrand.atmosphere_mood as string) : []),
    settingBackgroundDetail: Array.isArray(rawBrand.setting_background_detail) ? rawBrand.setting_background_detail : (rawBrand.setting_background_detail ? splitAndTrim(rawBrand.setting_background_detail as string) : []),
    cameraShotType: Array.isArray(rawBrand.camera_shot_type) ? rawBrand.camera_shot_type : (rawBrand.camera_shot_type ? splitAndTrim(rawBrand.camera_shot_type as string) : [])
  };
}

/**
 * ブランドのリストを一括変換する
 */
export function convertBrands(rawBrands: RawBrand[]): Brand[] {
  return rawBrands.map(convertBrand);
}

/**
 * JSONからPhraseVariationsを変換する
 * 異なるキー名の場合でも適切に変換する
 * 安全な実装に修正
 */
export function convertPhraseVariations(jsonData: any): PhraseVariations {
  try {
    // phrase_variationsが存在しない場合は空のオブジェクトを使用
    const variations = jsonData.phrase_variations || {};
    
    // variations自体が配列の場合はエラーを回避
    if (Array.isArray(variations)) {
      console.warn('phrase_variationsは配列です。期待されるのはオブジェクトです。');
      return {
        silhouettes: [],
        materials: [],
        backgrounds: [],
        lighting: []
      };
    }
    
    // 基本的なキーの検索
    const silhouettesKey = findKeyWithSuffix(variations, 'silhouettes');
    const materialsKey = findKeyWithSuffix(variations, 'materials');
    const backgroundsKey = findKeyWithSuffix(variations, 'backgrounds');
    const lightingKey = findKeyWithSuffix(variations, 'lighting');
    
    // 新しく追加されたキーの検索
    const backgroundStylesKey = findKeyWithSuffix(variations, 'background_styles');
    const backgroundColorPhrasesKey = findKeyWithSuffix(variations, 'background_color_phrases');
    const lightingVariationsKey = findKeyWithSuffix(variations, 'lighting_variations');
    const atmosphereMoodVariationsKey = findKeyWithSuffix(variations, 'atmosphere_mood_variations');
    const cameraShotTypeVariationsKey = findKeyWithSuffix(variations, 'camera_shot_type_variations');
    const generalSilhouetteVariationsKey = findKeyWithSuffix(variations, 'general_silhouette_variations');
    const generalMaterialVariationsKey = findKeyWithSuffix(variations, 'general_material_variations');
    const sportswearSilhouettesKey = findKeyWithSuffix(variations, 'sportswear_silhouettes');
    const sportswearMaterialsKey = findKeyWithSuffix(variations, 'sportswear_materials');
    
    // デバッグログ
    console.log('Variation keys found:', { 
      silhouettesKey, 
      materialsKey, 
      backgroundsKey, 
      lightingKey,
      backgroundStylesKey,
      backgroundColorPhrasesKey,
      lightingVariationsKey,
      atmosphereMoodVariationsKey,
      cameraShotTypeVariationsKey,
      generalSilhouetteVariationsKey,
      generalMaterialVariationsKey,
      sportswearSilhouettesKey,
      sportswearMaterialsKey
    });
    
    // 安全に値を取得
    let silhouettes = [];
    let materials = [];
    let backgrounds = [];
    let lighting = [];
    let background_styles = [];
    let background_color_phrases = [];
    let lighting_variations = [];
    let atmosphere_mood_variations = [];
    let camera_shot_type_variations = [];
    let general_silhouette_variations = [];
    let general_material_variations = [];
    let sportswear_silhouettes = [];
    let sportswear_materials = [];
    
    // 既存のキー処理
    try {
      if (silhouettesKey && variations[silhouettesKey]) {
        silhouettes = safeExtractElements(variations[silhouettesKey], 10);
      }
    } catch (e) {
      console.error('シルエットの処理に失敗しました:', e);
    }
    
    try {
      if (materialsKey && variations[materialsKey]) {
        materials = safeExtractElements(variations[materialsKey], 10);
      }
    } catch (e) {
      console.error('マテリアルの処理に失敗しました:', e);
    }
    
    try {
      if (backgroundsKey && variations[backgroundsKey]) {
        backgrounds = safeExtractElements(variations[backgroundsKey], 10);
      }
    } catch (e) {
      console.error('背景の処理に失敗しました:', e);
    }
    
    try {
      if (lightingKey && variations[lightingKey]) {
        lighting = safeExtractElements(variations[lightingKey], 10);
      }
    } catch (e) {
      console.error('ライティングの処理に失敗しました:', e);
    }
    
    // 新規キー処理
    try {
      if (backgroundStylesKey && variations[backgroundStylesKey]) {
        // 配列か配列の配列かをチェック
        if (Array.isArray(variations[backgroundStylesKey]) && 
            (variations[backgroundStylesKey].length === 0 || 
             typeof variations[backgroundStylesKey][0] === 'string')) {
          // 単純な文字列配列の場合
          background_styles = variations[backgroundStylesKey];
        } else {
          // 通常のPhraseVariationGroup配列の場合
          background_styles = safeExtractElements(variations[backgroundStylesKey], 10);
        }
      }
    } catch (e) {
      console.error('背景スタイルの処理に失敗しました:', e);
    }
    
    try {
      if (backgroundColorPhrasesKey && variations[backgroundColorPhrasesKey]) {
        // 特殊な形式（template/variationsを持つオブジェクト配列）をチェック
        if (Array.isArray(variations[backgroundColorPhrasesKey]) && 
            variations[backgroundColorPhrasesKey].length > 0 &&
            variations[backgroundColorPhrasesKey][0].template) {
          // 特殊な形式をそのまま保持
          background_color_phrases = variations[backgroundColorPhrasesKey];
        } else {
          // 通常の形式の場合
          background_color_phrases = safeExtractElements(variations[backgroundColorPhrasesKey], 10);
        }
      }
    } catch (e) {
      console.error('背景色フレーズの処理に失敗しました:', e);
    }
    
    try {
      if (lightingVariationsKey && variations[lightingVariationsKey]) {
        lighting_variations = safeExtractElements(variations[lightingVariationsKey], 10);
      }
    } catch (e) {
      console.error('ライティングバリエーションの処理に失敗しました:', e);
    }
    
    try {
      if (atmosphereMoodVariationsKey && variations[atmosphereMoodVariationsKey]) {
        atmosphere_mood_variations = safeExtractElements(variations[atmosphereMoodVariationsKey], 10);
      }
    } catch (e) {
      console.error('雰囲気ムードバリエーションの処理に失敗しました:', e);
    }
    
    try {
      if (cameraShotTypeVariationsKey && variations[cameraShotTypeVariationsKey]) {
        camera_shot_type_variations = safeExtractElements(variations[cameraShotTypeVariationsKey], 10);
      }
    } catch (e) {
      console.error('カメラショットタイプバリエーションの処理に失敗しました:', e);
    }
    
    try {
      if (generalSilhouetteVariationsKey && variations[generalSilhouetteVariationsKey]) {
        general_silhouette_variations = safeExtractElements(variations[generalSilhouetteVariationsKey], 10);
      }
    } catch (e) {
      console.error('汎用シルエットバリエーションの処理に失敗しました:', e);
    }
    
    try {
      if (generalMaterialVariationsKey && variations[generalMaterialVariationsKey]) {
        general_material_variations = safeExtractElements(variations[generalMaterialVariationsKey], 10);
      }
    } catch (e) {
      console.error('汎用素材バリエーションの処理に失敗しました:', e);
    }
    
    try {
      if (sportswearSilhouettesKey && variations[sportswearSilhouettesKey]) {
        sportswear_silhouettes = safeExtractElements(variations[sportswearSilhouettesKey], 10);
      }
    } catch (e) {
      console.error('スポーツウェアシルエットバリエーションの処理に失敗しました:', e);
    }
    
    try {
      if (sportswearMaterialsKey && variations[sportswearMaterialsKey]) {
        sportswear_materials = safeExtractElements(variations[sportswearMaterialsKey], 10);
      }
    } catch (e) {
      console.error('スポーツウェア素材バリエーションの処理に失敗しました:', e);
    }
    
    return {
      silhouettes,
      materials,
      backgrounds,
      lighting,
      background_styles,
      background_color_phrases,
      lighting_variations,
      atmosphere_mood_variations,
      camera_shot_type_variations,
      general_silhouette_variations,
      general_material_variations,
      sportswear_silhouettes,
      sportswear_materials
    };
  } catch (error) {
    console.error('フレーズバリエーションの変換エラー:', error);
    // エラー時は空のPhraseVariationsを返す
    return {
      silhouettes: [],
      materials: [],
      backgrounds: [],
      lighting: [],
      background_styles: [],
      background_color_phrases: [],
      lighting_variations: [],
      atmosphere_mood_variations: [],
      camera_shot_type_variations: [],
      general_silhouette_variations: [],
      general_material_variations: [],
      sportswear_silhouettes: [],
      sportswear_materials: []
    };
  }
}

/**
 * オブジェクトのキーから指定したサフィックスを持つものを検索
 * 安全な実装に修正
 */
function findKeyWithSuffix(obj: Record<string, any>, suffix: string): string | null {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return null;
  }
  
  // 完全一致を最初にチェック
  if (obj[suffix]) {
    return suffix;
  }
  
  // サフィックスを持つキーを探す
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (key.endsWith('_' + suffix)) {
      return key;
    }
  }
  
  // サフィックスを含むキーを探す
  for (const key of keys) {
    if (key.includes(suffix)) {
      return key;
    }
  }
  
  return null;
}

/**
 * 安全に要素を抽出する（無限ループの回避）
 */
function safeExtractElements(data: any, maxCount: number): any[] {
  // データが存在しない、または配列でない場合は空配列を返す
  if (!data) {
    return [];
  }
  
  // データが既に配列の配列でない場合は、単一の配列と見なす
  if (!Array.isArray(data)) {
    return [];
  }
  
  // 各要素が基本構造（base_term と variations）を持っているか確認
  const validItems = data.filter(item => 
    item && 
    typeof item === 'object' && 
    'base_term' in item && 
    'variations' in item &&
    Array.isArray(item.variations)
  );
  
  // 有効な要素がなければ空配列を返す
  if (validItems.length === 0) {
    return [];
  }
  
  // 最大数を制限して返す
  return validItems.slice(0, maxCount);
}

/**
 * ランダムな要素を配列から取得する
 * 空配列の場合はデフォルト値を返す
 */
export function getRandomElement<T>(array: T[], defaultValue?: T): T {
  if (!array || array.length === 0) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // デフォルト値が指定されていない場合はエラーを投げる
    console.warn('空の配列からランダム要素を取得しようとしました。デフォルト値を使用してください。');
    throw new Error('空の配列からランダム要素を取得できません');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * カテゴリから変数を取得する
 * 安全な実装に改善
 */
export function getRandomVariation(baseTerms: { base_term: string; variations: string[] }[]): string {
  // デフォルトのバリエーション値
  const DEFAULT_VARIATION = "elegant style";
  
  // 配列が空または存在しない場合
  if (!baseTerms || !Array.isArray(baseTerms) || baseTerms.length === 0) {
    console.warn('空のバリエーション配列が使用されました。デフォルト値を使用します。');
    return DEFAULT_VARIATION;
  }
  
  try {
    // 有効なバリエーションを持つグループのみをフィルタリング
    const validGroups = baseTerms.filter(group => 
      group && 
      group.variations && 
      Array.isArray(group.variations) && 
      group.variations.length > 0
    );
    
    // 有効なグループがない場合
    if (validGroups.length === 0) {
      console.warn('有効なバリエーションを持つグループが見つかりません。デフォルト値を使用します。');
      return DEFAULT_VARIATION;
    }
    
    // 有効なグループからランダムに選択
    const group = getRandomElement(validGroups, { base_term: "default", variations: [DEFAULT_VARIATION] });
    
    // 選択したグループからランダムなバリエーションを返す
    return getRandomElement(group.variations, DEFAULT_VARIATION);
    
  } catch (error) {
    console.error('バリエーション取得エラー:', error);
    return DEFAULT_VARIATION; // エラー時のフォールバック
  }
}

/**
 * ブランドの年代から表示用の10年代形式を生成（例: "1920"から"1920s"）
 */
export function formatEra(eraStart: string): string {
  // すでに"s"で終わっている場合はそのまま返す
  if (eraStart.endsWith('s')) return eraStart;
  
  // "various"などの特殊なケース
  if (isNaN(Number(eraStart))) return eraStart;
  
  // 数字の場合は10年代形式にする
  return `${eraStart}s`;
}

/**
 * ブランドをエラで分類する
 */
export function groupBrandsByEra(brands: Brand[]): Record<string, Brand[]> {
  const grouped: Record<string, Brand[]> = {};
  
  brands.forEach(brand => {
    const era = formatEra(brand.eraStart);
    if (!grouped[era]) {
      grouped[era] = [];
    }
    grouped[era].push(brand);
  });
  
  return grouped;
}

/**
 * 利用可能なすべての年代を取得する
 */
export function getAllEras(brands: Brand[]): string[] {
  const eras = new Set<string>();
  
  brands.forEach(brand => {
    eras.add(formatEra(brand.eraStart));
  });
  
  return Array.from(eras).sort();
}

/**
 * 年代を「通常」「詳細」「その他」に分割する
 * 通常：1980s-2000s
 * 詳細：2010年以降の年単位
 * その他：1980年以前など
 */
export function getGroupedEras(brands: Brand[]): { regularEras: string[], detailedEras: string[], otherEras: string[] } {
  const eras = new Set<string>();
  const detailedYears = new Set<number>();
  
  brands.forEach(brand => {
    const era = formatEra(brand.eraStart);
    eras.add(era);
    
    // 2010年以降の年号を取得
    if (era.endsWith('s')) {
      const yearNum = parseInt(era.replace('s', ''));
      if (!isNaN(yearNum) && yearNum >= 2010) {
        // 2010年以降の場合、単年ごとに追加
        const endYear = Math.min(yearNum + 9, new Date().getFullYear());
        for (let y = yearNum; y <= endYear; y++) {
          detailedYears.add(y);
        }
      }
    }
  });
  
  // 年代を三つのグループに分ける
  const regularEras: string[] = [];
  const detailedEras: string[] = [];
  const otherEras: string[] = [];
  
  // 年単位の詳細年代を追加
  Array.from(detailedYears).sort().forEach(year => {
    detailedEras.push(`${year}`);
  });
  
  // 通常の年代とその他の年代を振り分け
  Array.from(eras).forEach(era => {
    // 年代かどうかを確認
    if (era.endsWith('s')) {
      // 数字部分を取り出す
      const yearNum = parseInt(era.replace('s', ''));
      if (!isNaN(yearNum)) {
        if (yearNum >= 1980 && yearNum < 2010) {
          // 1980-2009は通常の年代
          regularEras.push(era);
        } else if (yearNum >= 2010) {
          // 2010年以降は詳細年代に含まれるので、ここでは何もしない
          // 年単位で表示するため、この年代はスキップ
        } else {
          // 1980年以前はその他の年代
          otherEras.push(era);
        }
      } else {
        // 年代に変換できない場合はその他の年代
        otherEras.push(era);
      }
    } else {
      // 年代形式でないもの（「various」など）は「その他」に分類
      otherEras.push(era);
    }
  });
  
  // ソート
  return {
    regularEras: regularEras.sort(),
    detailedEras: detailedEras,  // すでにソート済み
    otherEras: otherEras.sort()
  };
}

/**
 * ブランドをフィルタリング用に名前でソートする
 */
export function sortBrandsByName(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * テキストから特定のプレースホルダーを置換する
 */
export function replaceColorPlaceholder(text: string, colorPalette: string[]): string {
  if (!text.includes('[color]')) return text;
  
  try {
    const randomColor = getRandomElement(colorPalette);
    return text.replace(/\[color\]/g, randomColor);
  } catch (error) {
    console.error('プレースホルダー置換エラー:', error);
    return text; // エラー時は元のテキストを返す
  }
}

/**
 * テキストから複数のプレースホルダーを置換する
 */
export function replacePlaceholders(
  text: string, 
  replacements: Record<string, string>
): string {
  if (!text || typeof text !== 'string') return '';
  
  let result = text;
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}
