// services/promptService.ts
import { UniformType, FilterOptions, PhraseVariations, Prompt, AppSettings } from '../types';

interface GenerateOptions {
  uniformTypes: UniformType[];
  phraseVariations: PhraseVariations;
  filters?: FilterOptions;
  settings: AppSettings;
  existingPrompts?: Prompt[]; // 既存のプロンプトリスト（重複チェック用）
}

// 重複チェック用の簡易ハッシュ関数
function getPromptHash(prompt: Prompt): string {
  // ユニフォーム名、素材、要素、色、業界、性別の組み合わせをハッシュとして使用
  return `${prompt.uniformName}-${prompt.material}-${prompt.element}-${prompt.color}-${prompt.industry}-${prompt.gender}`;
}

// プロンプトが既存のプロンプトと重複しているかチェック
function isDuplicatePrompt(prompt: Prompt, existingPrompts: Prompt[] = []): boolean {
  const promptHash = getPromptHash(prompt);
  return existingPrompts.some(existing => getPromptHash(existing) === promptHash);
}

/**
 * ランダムな要素を取得する
 */
function getRandomElement<T>(array: T[] | undefined, defaultValue?: T): T {
  if (!array || array.length === 0) {
    return defaultValue as T;
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * フィルター条件に一致する制服タイプを抽出する
 */
function filterUniformTypes(uniformTypes: UniformType[], filters?: FilterOptions): UniformType[] {
  if (!filters) return uniformTypes;
  
  return uniformTypes.filter(uniform => {
    // 制服タイプIDでフィルタリング
    if (filters.uniformTypes?.length > 0 && !filters.uniformTypes.includes(uniform.uniform_id)) {
      return false;
    }
    
    // 業界でフィルタリング
    if (filters.industries?.length > 0) {
      const hasMatchingIndustry = uniform.industries.some(industry => 
        filters.industries!.some(filterIndustry => 
          industry.toLowerCase().includes(filterIndustry.toLowerCase())
        )
      );
      if (!hasMatchingIndustry) {
        return false;
      }
    }
    
    // スタイルでフィルタリング
    if (filters.styles?.length > 0) {
      const hasMatchingStyle = uniform.style_keywords.some(style => 
        filters.styles!.some(filterStyle => 
          style.toLowerCase().includes(filterStyle.toLowerCase())
        )
      );
      if (!hasMatchingStyle) {
        return false;
      }
    }
    
    // 素材でフィルタリング
    if (filters.materials?.length > 0) {
      const hasMatchingMaterial = uniform.materials.some(material => 
        filters.materials!.some(filterMaterial => 
          material.toLowerCase().includes(filterMaterial.toLowerCase())
        )
      );
      if (!hasMatchingMaterial) {
        return false;
      }
    }
    
    // 色でフィルタリング
    if (filters.colors?.length > 0) {
      const hasMatchingColor = uniform.color_palette.some(color => 
        filters.colors!.some(filterColor => 
          color.toLowerCase().includes(filterColor.toLowerCase())
        )
      );
      if (!hasMatchingColor) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * 単一のプロンプトを生成する（重複チェック対応）
 */
export function generateSinglePrompt(options: GenerateOptions): Prompt {
  const { uniformTypes, phraseVariations, filters, settings, existingPrompts = [] } = options;
  
  // 最大試行回数（無限ループ防止）
  const maxAttempts = 10;
  let attempts = 0;
  let prompt: Prompt;
  
  // 重複しないプロンプトを生成するまで試行
  do {
    // フィルタリングされた制服タイプの中からランダムに選択
    const filteredUniformTypes = filterUniformTypes(uniformTypes, filters);
    const uniform = filteredUniformTypes.length > 0 
      ? getRandomElement(filteredUniformTypes) 
      : getRandomElement(uniformTypes);
    
    // 要素を選択
    const element = getRandomElement(uniform.key_elements);
    const material = getRandomElement(uniform.materials);
    const color = getRandomElement(uniform.color_palette);
    const industry = uniform.industries.length > 0 ? getRandomElement(uniform.industries) : '';
    const styleKeyword = getRandomElement(uniform.style_keywords);
    
    // 性別を選択（フィルターに基づく）
    let gender = "unisex";
    let genderModel = "";
    
    if (filters && filters.genders && filters.genders.length > 0) {
      // フィルターで性別が指定されている場合はその中からランダムに選択
      gender = getRandomElement(filters.genders);
      
      // 性別に応じたモデル指定を追加
      if (gender === "male" && phraseVariations.gender && phraseVariations.gender.length > 0) {
        const maleModelPhrases = phraseVariations.gender.filter(p => p.includes("male"));
        if (maleModelPhrases.length > 0) {
          genderModel = getRandomElement(maleModelPhrases);
        } else {
          genderModel = "male model";
        }
      } else if (gender === "female" && phraseVariations.gender && phraseVariations.gender.length > 0) {
        const femaleModelPhrases = phraseVariations.gender.filter(p => p.includes("female"));
        if (femaleModelPhrases.length > 0) {
          genderModel = getRandomElement(femaleModelPhrases);
        } else {
          genderModel = "female model";
        }
      }
    }
    
    // プロンプト変数を選択
    const photoStyle = getRandomElement(phraseVariations.photo_style, "professional photograph");
    const lighting = getRandomElement(phraseVariations.lighting, "studio lighting");
    const quality = getRandomElement(phraseVariations.quality, "high quality");
    const resolution = getRandomElement(phraseVariations.resolution, "8k resolution");
    const parameters = getRandomElement(phraseVariations.parameters, "--ar 4:5 --stylize 750");
    
    // プロンプトの基本部分を構築
    // 全身ショットを指定するために "A full-body shot" を追加
    let promptBase = `A ${photoStyle} of a full-body shot of ${genderModel ? genderModel + " wearing a" : "person wearing a"}`;
    
    // 業界が指定されている場合は追加
    if (industry) {
      promptBase += ` ${industry}`;
    }
    
    // 制服名と説明を追加
    promptBase += ` ${uniform.uniform_name}, ${styleKeyword}, ${element}, ${color} ${material}`;
    
    // 人物は一人だけであることを明示
    promptBase += `, single person`;
    
    // ライティングと品質設定を追加
    promptBase += `, ${lighting}, ${quality}, ${resolution}, photorealistic`;
    
    // プロンプトの最終形成
    let promptText = promptBase;
    
    // パラメータを追加
    promptText += ` ${parameters}`;
    
    // カスタムサフィックスを追加
    if (settings.customSuffix) {
      promptText += ` ${settings.customSuffix}`;
    }
    
    // プロンプトオブジェクトの作成
    const now = new Date();
    prompt = {
      id: now.getTime() + Math.floor(Math.random() * 1000),
      fullPrompt: promptText,
      createdDate: now.toISOString(),
      rating: 0,
      isFavorite: false,
      uniformId: uniform.uniform_id,
      uniformName: uniform.uniform_name,
      material,
      element,
      color,
      industry,
      gender,
      styleKeywords: [styleKeyword],
      photoStyle,
      lighting,
      quality,
      resolution,
      parameters
    };
    
    attempts++;
    
    // 既存のプロンプトとの重複をチェック
    if (!isDuplicatePrompt(prompt, existingPrompts)) {
      break; // 重複がなければループを抜ける
    }
    
    // 最大試行回数に達したら重複してもそのまま返す
    if (attempts >= maxAttempts) {
      console.warn(`最大試行回数（${maxAttempts}回）に達したため、重複する可能性のあるプロンプトを使用します。`);
      break;
    }
    
  } while (true);
  
  return prompt;
}

/**
 * 複数のプロンプトを生成する（重複チェック対応）
 */
export function generatePrompts(options: GenerateOptions, count: number = 5): Prompt[] {
  const { existingPrompts = [] } = options;
  const results: Prompt[] = [];
  
  // 指定した数のプロンプトを生成
  for (let i = 0; i < count; i++) {
    // 既に生成したプロンプトも含めて重複チェック
    const prompt = generateSinglePrompt({
      ...options,
      existingPrompts: [...existingPrompts, ...results]
    });
    results.push(prompt);
  }
  
  return results;
}
