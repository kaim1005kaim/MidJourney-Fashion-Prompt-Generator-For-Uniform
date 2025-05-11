# MidJourney Fashion Prompt Generator for Uniform

MidJourney AI画像生成のための制服デザインプロンプト生成ツールです。多様な業界（飲食店、イベントスタッフ、鉄道、ホテル、受付スタッフ、工場、建築、清掃、病院、介護など）向けの制服デザインプロンプトを簡単に生成できます。

## 特徴

- 様々な業界向けの制服デザインプロンプトを自動生成
- 業界、スタイル、素材、色などのフィルターでカスタマイズ可能
- プロンプトのお気に入り登録、履歴管理機能
- 生成したプロンプトの評価、画像結果の保存機能
- ダークモード対応

## データベース構造

制服プロンプトジェネレーターのデータベースは `uniform-database.json` に格納されており、以下のような構造になっています：

```json
{
  "uniform_types": [
    {
      "uniform_id": "hospital",
      "uniform_name": "病院制服",
      "description": "医療スタッフ向けの清潔で機能的な制服",
      "key_elements": [
        "スクラブ",
        "白衣",
        "ナースキャップ",
        "聴診器",
        "名札"
      ],
      "materials": [
        "コットン",
        "ポリエステルブレンド",
        "抗菌素材"
      ],
      "color_palette": [
        "白",
        "水色",
        "ティール",
        "ネイビー"
      ],
      "industries": [
        "医療",
        "病院",
        "看護"
      ],
      "style_keywords": [
        "機能的",
        "衛生的",
        "プロフェッショナル"
      ]
    },
    // 他の制服タイプ...
  ],
  "phrase_variations": {
    "quality": [
      "high quality",
      "detailed",
      "professional",
      "premium"
    ],
    "photo_style": [
      "fashion photograph",
      "professional photograph",
      "editorial style",
      "catalog photography"
    ],
    "lighting": [
      "studio lighting",
      "soft lighting",
      "natural lighting",
      "dramatic lighting"
    ],
    "resolution": [
      "8k resolution",
      "4k uhd",
      "high resolution"
    ],
    "parameters": [
      "--ar 2:3 --stylize 750",
      "--ar 3:4 --stylize 850",
      "--ar 1:1 --stylize 650"
    ]
  }
}
```

## セットアップ方法

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/MidJourney-Fashion-Prompt-Generator-For-Uniform.git

# ディレクトリに移動
cd MidJourney-Fashion-Prompt-Generator-For-Uniform

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルドとデプロイ

```bash
# ビルド
npm run prepare-data && npm run build

# Netlifyデプロイ（Netlify CLIがインストールされている場合）
netlify deploy --prod
```

## 主要コンポーネント

- **PromptGenerator**: メインのプロンプト生成コンポーネント
- **FilterPanel**: 業界、スタイル、素材などのフィルター機能
- **PromptCard**: 生成されたプロンプトの表示と管理
- **SettingsPanel**: アスペクト比などの設定パネル

## プロンプト生成ロジック

MidJourneyの効果的なプロンプトは一般的に以下の構造に従います：

```
A [photo_style] of a [industry] [uniform_name], [style_description], [key_elements], [color] [material], [lighting], [quality], [resolution], photorealistic, [parameters]
```

例えば：

```
A professional photograph of a hospital nurse uniform, functional, scrubs, light blue polyester blend, studio lighting, high quality, 8k resolution, photorealistic, --ar 4:5 --stylize 750
```

## ライセンス

MITライセンス

---

**注意**: このプロジェクトはMidJourney Fashion Prompt Generatorをベースに制服バージョンとして改変されています。
