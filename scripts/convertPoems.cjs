const fs = require('fs');
const path = require('path');

// 唐诗数据目录
const dataDir = path.join(__dirname, '..', 'node_modules', 'chinese-poetry', 'chinese-poetry', 'json');

// 收集唐诗 - 限制数量以提高性能
const allPoems = [];
const MAX_POEMS = 5000; // 限制5000首
let fileCount = 0;

// 遍历所有唐诗文件
for (let i = 0; i <= 55000 && allPoems.length < MAX_POEMS; i += 1000) {
  const filePath = path.join(dataDir, `poet.tang.${i}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      for (const poem of data) {
        if (allPoems.length >= MAX_POEMS) break;

        // 转换格式
        const newPoem = {
          id: allPoems.length + 1,
          title: poem.title,
          author: poem.author,
          dynasty: 'Tang',
          content: poem.paragraphs, // 将 paragraphs 转为 content
        };
        allPoems.push(newPoem);
      }

      fileCount++;
      console.log(`Processed ${filePath}: ${data.length} poems, total: ${allPoems.length}`);
    } catch (e) {
      console.log(`Error processing ${filePath}: ${e.message}`);
    }
  }
}

console.log(`\nTotal files processed: ${fileCount}`);
console.log(`Total poems collected: ${allPoems.length}`);

// 保存到 poems.json
const outputPath = path.join(__dirname, '..', 'src', 'data', 'poems.json');
fs.writeFileSync(outputPath, JSON.stringify(allPoems, null, 2), 'utf8');
console.log(`Saved to ${outputPath}`);
