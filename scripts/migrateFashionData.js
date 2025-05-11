// scripts/migrateFashionData.js
const fs = require('fs');
const path = require('path');

// パス設定
const rootDir = path.resolve(__dirname, '../..');
const sourceFile = path.join(rootDir, 'fashion-database.json');
const targetDir = path.join(rootDir, 'project', 'public');
const targetFile = path.join(targetDir, 'fashion-database.json');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// ファイルをコピー
try {
  const data = fs.readFileSync(sourceFile, 'utf8');
  fs.writeFileSync(targetFile, data, 'utf8');
  console.log(`Successfully copied data from ${sourceFile} to ${targetFile}`);
} catch (error) {
  console.error('Error during file migration:', error);
  process.exit(1);
}

// データの検証
try {
  const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  console.log(`Data validation successful. Found ${data.brands.length} brands.`);
  console.log(`Found ${Object.keys(data.phrase_variations).length} phrase variation categories.`);
} catch (error) {
  console.error('Error validating migrated data:', error);
  process.exit(1);
}

console.log('Data migration completed successfully!');
