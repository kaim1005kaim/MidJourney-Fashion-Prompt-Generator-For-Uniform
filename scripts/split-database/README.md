# Database Splitter for Fashion Prompt Generator

このツールは大きなファッションデータベース（fashion-database.json）を小さなチャンク（chunks）に分割し、アプリケーションがより効率的にデータを読み込めるようにします。

## 使い方

1. このディレクトリに移動します:
   ```
   cd ./scripts/split-database
   ```

2. 必要なパッケージをインストールします（初回のみ）:
   ```
   npm install
   ```

3. スクリプトを実行してデータベースを分割します:
   ```
   npm run split
   ```

4. 分割されたファイルは `public/db-chunks` ディレクトリに保存されます。

## 出力ファイル

- `brands-chunk-1.json`, `brands-chunk-2.json`, ... - ブランドの各チャンク（50件ごと）
- `db-metadata.json` - すべてのチャンクに関する情報を含むメタデータファイル

## カスタマイズ

チャンク内のブランド数を変更するには、`split-database.js` の `BRANDS_PER_CHUNK` 定数を編集してください。
