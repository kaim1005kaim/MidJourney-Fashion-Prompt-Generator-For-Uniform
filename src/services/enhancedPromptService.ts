// enhancedPromptService.ts
import { UniformType, FilterOptions, PhraseVariations, Prompt, AppSettings } from '../types';

/**
 * 拡張プロンプト生成オプション
 */
export interface EnhancedPromptOptions {
  // 生成する要素の数の範囲を指定
  elementsCount?: { min: number; max: number };
  materialsCount?: { min: number; max: number };
  colorsCount?: { min: number; max: number };
  styleKeywordsCount?: { min: number; max: number };
  
  // 追加のパラメータ
  additionalParams?: string[];
  
  // 特定の要素を強制的に使用
  forceElements?: string[];
  forceMaterials?: string[];
  forceColors?: string[];
  forceStyles?: string[];
  
  // プロンプトの生成方法
  includeIndustry?: boolean;
  naturalLanguageStructure?: boolean;
  includeSinglePerson?: boolean;
  includeBackground?: boolean;
  
  // 既存プロンプトとの重複チェック
  existingPrompts?: Prompt[];
}

/**
 * ランダムな要素を複数取得する
 * @param array 取得元の配列
 * @param count 取得する要素数の範囲
 * @param forceItems 強制的に含める要素
 * @returns ランダムに選択された要素の配列
 */
function getRandomItems<T>(
  array: T[] = [],
  count: { min: number; max: number } = { min: 1, max: 1 },
  forceItems: T[] = []
): T[] {
  if (array.length === 0 && forceItems.length === 0) return [];
  
  // 強制要素を含めた配列を作成
  const baseItems = [...forceItems];
  
  // 必要な追加要素数を計算
  const remainingCount = Math.max(0, Math.floor(Math.random() * (count.max - count.min + 1)) + count.min - forceItems.length);
  
  if (remainingCount > 0 && array.length > 0) {
    // 強制要素と重複しない要素からランダムに選択
    const availableItems = array.filter(item => !forceItems.includes(item));
    
    // 配列をシャッフル
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    
    // 必要な数だけ要素を追加
    baseItems.push(...shuffled.slice(0, Math.min(remainingCount, availableItems.length)));
  }
  
  return baseItems;
}

/**
 * 単一の要素をランダムに選択する
 * @param array 選択元の配列
 * @param defaultValue デフォルト値
 * @returns ランダムに選択された要素
 */
function getRandomItem<T>(array: T[] = [], defaultValue?: T): T | undefined {
  if (array.length === 0) return defaultValue;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 重複チェック用のハッシュ関数
 * @param prompt プロンプト
 * @returns プロンプトのハッシュ値
 */
function getPromptHash(prompt: Prompt): string {
  return `${prompt.uniformName}-${prompt.material}-${prompt.element}-${prompt.color}-${prompt.industry}-${prompt.gender}`;
}

/**
 * プロンプトの重複チェック
 * @param prompt チェック対象のプロンプト
 * @param existingPrompts 既存のプロンプト一覧
 * @returns 重複していればtrue
 */
function isDuplicatePrompt(prompt: Prompt, existingPrompts: Prompt[] = []): boolean {
  const hash = getPromptHash(prompt);
  return existingPrompts.some(p => getPromptHash(p) === hash);
}

/**
 * フィルター条件に一致する制服タイプを抽出する
 * @param uniformTypes 制服タイプの配列
 * @param filters フィルター条件
 * @returns フィルター条件に一致する制服タイプの配列
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
    
    // 性別でフィルタリング（特定の性別のユニフォームのみを選択）
    if (filters.genders?.length > 0 && uniform.gender) {
      // uniformのgenderフィールドがfiltersのgendersに含まれているかチェック
      if (!filters.genders.includes(uniform.gender)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * 拡張プロンプト生成関数
 * @param uniformTypes 制服タイプの配列
 * @param phraseVariations フレーズバリエーション
 * @param uniformId 制服ID（指定がない場合はランダム選択）
 * @param filters フィルター条件
 * @param settings アプリ設定
 * @param options プロンプト生成オプション
 * @returns 生成されたプロンプト
 */
export function generateEnhancedPrompt(
  uniformTypes: UniformType[],
  phraseVariations: PhraseVariations,
  uniformId?: string,
  filters?: FilterOptions,
  settings?: AppSettings,
  options: EnhancedPromptOptions = {}
): Prompt {
  // デフォルトオプション
  const defaultOptions: EnhancedPromptOptions = {
    elementsCount: { min: 2, max: 3 },
    materialsCount: { min: 1, max: 2 },
    colorsCount: { min: 1, max: 2 },
    styleKeywordsCount: { min: 1, max: 3 },
    additionalParams: [],
    forceElements: [],
    forceMaterials: [],
    forceColors: [],
    forceStyles: [],
    includeIndustry: true,
    naturalLanguageStructure: true,
    includeSinglePerson: true,
    includeBackground: true,
    existingPrompts: []
  };
  
  // オプションをマージ
  const opts = { ...defaultOptions, ...options };
  const appSettings = settings || {
    darkMode: false,
    promptCount: 5,
    includeAspectRatio: true,
    aspectRatio: "--ar 4:5",
    includeVersion: true,
    version: "--v 7.0",
    includeStylize: true,
    stylize: "s100",
    customSuffix: '',
    useJapaneseModel: false
  };
  
  // 最大試行回数（無限ループ防止）
  const maxAttempts = 10;
  let attempts = 0;
  let prompt: Prompt;
  
  // 重複しないプロンプトを生成するまで試行
  do {
    // フィルタリングされた制服タイプから選択
    let filteredTypes = filterUniformTypes(uniformTypes, filters);
    
    // 特定のuniformIdが指定されている場合はそれを使う
    let uniform: UniformType;
    
    if (uniformId) {
      const foundUniform = uniformTypes.find(u => u.uniform_id === uniformId);
      if (!foundUniform) {
        throw new Error(`指定されたID "${uniformId}" の制服が見つかりません。`);
      }
      uniform = foundUniform;
    } else if (filteredTypes.length > 0) {
      uniform = getRandomItem(filteredTypes) as UniformType;
    } else {
      uniform = getRandomItem(uniformTypes) as UniformType;
    }
    
    // === 各要素の選択 ===
    
    // 性別を選択
    let gender = uniform.gender || "unisex";
    let genderModel = "";
    
    if (filters && filters.genders && filters.genders.length > 0) {
      // フィルターで性別が指定されている場合はその中からランダムに選択
      gender = getRandomItem(filters.genders) || "unisex";
    }
    
    // 性別に応じたモデル指定を追加
    if (gender === "male" && phraseVariations.gender) {
      const maleModelPhrases = phraseVariations.gender.filter(p => p.toLowerCase().includes("male"));
      genderModel = maleModelPhrases.length > 0 
        ? getRandomItem(maleModelPhrases) || "male model" 
        : "male model";
    } else if (gender === "female" && phraseVariations.gender) {
      const femaleModelPhrases = phraseVariations.gender.filter(p => p.toLowerCase().includes("female"));
      genderModel = femaleModelPhrases.length > 0 
        ? getRandomItem(femaleModelPhrases) || "female model" 
        : "female model";
    } else {
      genderModel = "person";
    }
    
    // キー要素、素材、色、スタイルキーワードを選択
    const elements = getRandomItems(
      uniform.key_elements,
      opts.elementsCount || { min: 2, max: 3 },
      opts.forceElements || []
    );
    
    const materials = getRandomItems(
      uniform.materials,
      opts.materialsCount || { min: 1, max: 2 },
      opts.forceMaterials || []
    );
    
    const colors = getRandomItems(
      uniform.color_palette,
      opts.colorsCount || { min: 1, max: 2 },
      opts.forceColors || []
    );
    
    const styleKeywords = getRandomItems(
      uniform.style_keywords,
      opts.styleKeywordsCount || { min: 1, max: 3 },
      opts.forceStyles || []
    );
    
    // 業界を選択（オプションで含めるかどうか制御可能）
    const industry = opts.includeIndustry && uniform.industries.length > 0 
      ? getRandomItem(uniform.industries) || "" 
      : "";
    
    // 写真スタイル、ライティング、品質、解像度を選択
    const photoStyle = getRandomItem(phraseVariations.photo_style || [], "professional photograph") || "professional photograph";
    const lighting = getRandomItem(phraseVariations.lighting || [], "studio lighting") || "studio lighting";
    const quality = getRandomItem(phraseVariations.quality || [], "high quality") || "high quality";
    const resolution = getRandomItem(phraseVariations.resolution || [], "8k resolution") || "8k resolution";
    
    // パラメータを選択
    const baseParameters = getRandomItem(phraseVariations.parameters || []) || "";
    
    // === プロンプト構築 ===
    
    // プロンプト要素の配列
    const promptParts: string[] = [];
    
    // 自然言語構造を使うか、シンプルな要素の連結にするか
    if (opts.naturalLanguageStructure) {
      // 写真スタイルのフレーズで始める
      promptParts.push(`A ${photoStyle} of a full-body shot of`);
      
      // 日本人モデル設定
      if (appSettings.useJapaneseModel) {
        if (gender === "male") {
          promptParts.push("Japanese male model wearing a");
        } else if (gender === "female") {
          promptParts.push("Japanese female model wearing a");
        } else {
          promptParts.push("Japanese person wearing a");
        }
      } else {
        promptParts.push(`${genderModel} wearing a`);
      }
      
      // 業界が指定されている場合は追加
      if (industry) {
        promptParts[promptParts.length - 1] += ` ${industry}`;
      }
      
      // 制服名
      promptParts.push(uniform.uniform_name);
      
      // スタイルキーワード
      if (styleKeywords.length > 0) {
        promptParts.push(styleKeywords.join(", "));
      }
      
      // キー要素
      if (elements.length > 0) {
        promptParts.push(elements.join(", "));
      }
      
      // 素材と色
      if (materials.length > 0 && colors.length > 0) {
        promptParts.push(`${colors.join(" and ")} ${materials.join(" and ")}`);
      } else if (materials.length > 0) {
        promptParts.push(materials.join(" and "));
      } else if (colors.length > 0) {
        promptParts.push(colors.join(" and "));
      }
      
      // 一人のみを表示
      if (opts.includeSinglePerson) {
        promptParts.push("single person");
      }
      
      // 背景設定
      if (opts.includeBackground) {
        promptParts.push("simple white background, no background elements, studio shot");
      }
      
      // ライティング、品質、解像度
      promptParts.push(lighting);
      promptParts.push(quality);
      promptParts.push(resolution);
      promptParts.push("photorealistic");
    } else {
      // シンプルな要素の連結（指示書の形式に合わせる）
      
      // 性別
      if (appSettings.useJapaneseModel) {
        if (gender === "male") {
          promptParts.push("Japanese male model");
        } else if (gender === "female") {
          promptParts.push("Japanese female model");
        } else {
          promptParts.push("Japanese person");
        }
      } else {
        promptParts.push(genderModel);
      }
      
      // 制服名
      promptParts.push(uniform.uniform_name);
      
      // キー要素
      if (elements.length > 0) {
        promptParts.push(elements.join(", "));
      }
      
      // 素材
      if (materials.length > 0) {
        promptParts.push(materials.join(" and "));
      }
      
      // 色
      if (colors.length > 0) {
        promptParts.push(colors.join(" and "));
      }
      
      // スタイルキーワード
      if (styleKeywords.length > 0) {
        promptParts.push(styleKeywords.join(", "));
      }
      
      // 業界
      if (industry) {
        promptParts.push(industry);
      }
      
      // 写真スタイル
      promptParts.push(photoStyle);
      
      // ライティング
      promptParts.push(lighting);
      
      // 品質
      promptParts.push(quality);
      
      // 解像度
      promptParts.push(resolution);
      
      // 一人のみを表示
      if (opts.includeSinglePerson) {
        promptParts.push("single person");
      }
      
      // 背景設定
      if (opts.includeBackground) {
        promptParts.push("simple white background, studio shot");
      }
    }
    
    // 空でない要素をカンマで結合
    let promptText = promptParts
      .filter(part => part && part.trim() !== "")
      .join(", ");
    
    // MidJourneyのパラメータを追加
    
    // アスペクト比設定を追加
    if (appSettings.includeAspectRatio) {
      promptText += ` ${appSettings.aspectRatio}`;
    }
    
    // バージョン設定を追加
    if (appSettings.includeVersion) {
      promptText += ` ${appSettings.version}`;
    }
    
    // スタイライズ設定を追加
    if (appSettings.includeStylize) {
      promptText += ` --stylize ${appSettings.stylize}`;
    } else {
      // スタイライズがオフの場合は何も追加しない
      if (promptText.includes(" --style") || promptText.includes(" --stylize")) {
        // すでに入っている場合は削除するための正規表現処理
        promptText = promptText.replace(/\s--stylize\s+\w+/g, '');
      }
    }
    
    // ベースパラメータを追加（適用されていない場合）
    if (baseParameters && !promptText.includes(baseParameters)) {
      promptText += ` ${baseParameters}`;
    }
    
    // 追加パラメータを追加
    if (opts.additionalParams && opts.additionalParams.length > 0) {
      promptText += ` ${opts.additionalParams.join(" ")}`;
    }
    
    // カスタムサフィックスを追加
    if (appSettings.customSuffix) {
      promptText += ` ${appSettings.customSuffix}`;
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
      material: materials.join(", "),
      element: elements.join(", "),
      color: colors.join(", "),
      industry,
      gender,
      styleKeywords,
      photoStyle,
      lighting,
      quality,
      resolution,
      parameters: [
        appSettings.includeAspectRatio ? appSettings.aspectRatio : '', 
        appSettings.includeVersion ? appSettings.version : '', 
        appSettings.includeStylize ? `--stylize ${appSettings.stylize}` : '',
        baseParameters,
        (opts.additionalParams || []).join(" "),
        appSettings.customSuffix
      ].filter(p => p && p.trim() !== "").join(" ")
    };
    
    attempts++;
    
    // 既存のプロンプトとの重複をチェック
    if (!opts.existingPrompts || opts.existingPrompts.length === 0 || !isDuplicatePrompt(prompt, opts.existingPrompts)) {
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
 * 拡張プロンプトを複数生成する
 * @param uniformTypes 制服タイプの配列
 * @param phraseVariations フレーズバリエーション
 * @param count 生成する数
 * @param filters フィルター条件
 * @param settings アプリ設定
 * @param options プロンプト生成オプション
 * @returns 生成されたプロンプトの配列
 */
export function generateEnhancedPrompts(
  uniformTypes: UniformType[],
  phraseVariations: PhraseVariations,
  count: number = 5,
  filters?: FilterOptions,
  settings?: AppSettings,
  options: EnhancedPromptOptions = {}
): Prompt[] {
  const results: Prompt[] = [];
  
  // 指定した数のプロンプトを生成
  for (let i = 0; i < count; i++) {
    // 既に生成したプロンプトも含めて重複チェック
    const prompt = generateEnhancedPrompt(
      uniformTypes,
      phraseVariations,
      undefined, // uniformId
      filters,
      settings,
      {
        ...options,
        existingPrompts: [...(options.existingPrompts || []), ...results]
      }
    );
    results.push(prompt);
  }
  
  return results;
}
