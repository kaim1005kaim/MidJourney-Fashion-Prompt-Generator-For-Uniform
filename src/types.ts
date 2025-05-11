// types.ts
export interface UniformType {
  uniform_id: string;
  uniform_name: string;
  description: string;
  key_elements: string[];
  materials: string[];
  color_palette: string[];
  industries: string[];
  style_keywords: string[];
  gender?: string; // 性別（unisex, male, female）
}

export interface Prompt {
  id: number;
  fullPrompt: string;
  createdDate: string;
  rating: number;
  isFavorite: boolean;
  resultNotes?: string;
  resultImagePath?: string;
  uniformId?: string;
  uniformName?: string;
  material?: string;
  element?: string;
  color?: string;
  industry?: string;
  gender?: string;
  styleKeywords?: string[];
  photoStyle?: string;
  lighting?: string;
  quality?: string;
  resolution?: string;
  parameters?: string;
}

export interface PhraseVariations {
  quality: string[];
  photo_style: string[];
  lighting: string[];
  resolution: string[];
  parameters: string[];
  gender?: string[]; // 性別バリエーション（"male model", "female model"）
}

export interface FilterOptions {
  uniformTypes: string[]; // Selected uniform type IDs
  industries: string[]; // Selected industries
  styles: string[]; // Selected style elements
  materials: string[]; // Selected material types
  colors: string[]; // Selected colors
  genders: string[]; // Selected genders
}

export interface AspectRatioOption {
  label: string;
  value: string;
}

export interface StyleOption {
  label: string;
  value: string;
}

export interface VersionOption {
  label: string;
  value: string;
}

export interface AppSettings {
  darkMode: boolean;
  promptCount: number; // Number of prompts to generate at once
  includeAspectRatio: boolean;
  aspectRatio: string; // 選択されたアスペクト比
  includeVersion: boolean;
  version: string; // 選択されたバージョン
  includeStylize: boolean;
  stylize: string; // 選択されたスタイライズ値
  customSuffix: string;
  useJapaneseModel: boolean; // 日本人モデルを使用するかどうか
  useNaturalLanguage: boolean; // 自然言語構造を使用するかどうか
}
