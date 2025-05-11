// split-database.js
// このスクリプトはファッションデータベースを50件ごとのチャンクに分割します

const fs = require('fs');
const path = require('path');

// ソースデータベースのパス
const SOURCE_PATH = path.join(__dirname, '../../public/fashion-database.json');
// 分割したデータを保存するディレクトリ
const TARGET_DIR = path.join(__dirname, '../../public/db-chunks');
// チャンクあたりのブランド数
const BRANDS_PER_CHUNK = 50;

// 出力ディレクトリが存在しない場合は作成
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// データベースの読み込み
try {
  console.log('データベースを読み込み中...');
  const rawData = fs.readFileSync(SOURCE_PATH, 'utf8');
  const database = JSON.parse(rawData);
  
  // ブランドの総数をログ出力
  const totalBrands = database.brands.length;
  console.log(`合計 ${totalBrands} ブランドを処理します`);
  
  // 必要なチャンク数を計算
  const totalChunks = Math.ceil(totalBrands / BRANDS_PER_CHUNK);
  console.log(`${totalChunks} チャンクに分割します`);
  
  // メタデータファイルの作成
  const metadata = {
    totalBrands,
    totalChunks,
    brandsPerChunk: BRANDS_PER_CHUNK,
    lastUpdated: new Date().toISOString(),
    chunks: []
  };
  
  // ブランドをチャンクに分割
  for (let i = 0; i < totalChunks; i++) {
    const start = i * BRANDS_PER_CHUNK;
    const end = Math.min(start + BRANDS_PER_CHUNK, totalBrands);
    const chunkBrands = database.brands.slice(start, end);
    
    // チャンクファイル名
    const chunkFilename = `brands-chunk-${i + 1}.json`;
    
    // チャンクのメタデータを追加
    metadata.chunks.push({
      id: i + 1,
      filename: chunkFilename,
      brandCount: chunkBrands.length,
      brandIds: chunkBrands.map(brand => brand.brand_id),
      brandNames: chunkBrands.map(brand => brand.brand_name)
    });
    
    // フレーズバリエーションを含めたチャンク
    const chunkData = {
      chunk_id: i + 1,
      total_chunks: totalChunks,
      brands: chunkBrands,
      phrase_variations: database.phrase_variations
    };
    
    // チャンクをファイルに書き込み
    fs.writeFileSync(
      path.join(TARGET_DIR, chunkFilename),
      JSON.stringify(chunkData, null, 2)
    );
    
    console.log(`チャンク ${i + 1}/${totalChunks} を保存しました (${chunkBrands.length} ブランド)`);
  }
  
  // メタデータファイルを書き込み
  fs.writeFileSync(
    path.join(TARGET_DIR, 'db-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('メタデータファイルを保存しました');
  console.log('データベースの分割が完了しました');
  
} catch (error) {
  console.error('エラーが発生しました:', error);
  process.exit(1);
}
