import { IMAGE_DICTIONARY, getAllSpecificImages } from '../data/imageDictionary';

/**
 * 从单句诗中提取意象
 * @param {string} line - 诗句
 * @returns {Object} - { specificImages: Set, coreImages: Set }
 */
function extractFromLine(line) {
  const specificImages = new Set();
  const coreImages = new Set();

  // 获取所有具体意象关键词，按长度降序排列（优先匹配长词）
  const keywords = getAllSpecificImages().sort((a, b) => b.length - a.length);

  // 遍历所有关键词，检查是否出现在诗句中
  for (const keyword of keywords) {
    if (line.includes(keyword)) {
      specificImages.add(keyword);

      // 映射到核心意象
      const coreImage = IMAGE_DICTIONARY[keyword];
      if (coreImage) {
        coreImages.add(coreImage);
      }
    }
  }

  return {
    specificImages: Array.from(specificImages),
    coreImages: Array.from(coreImages),
  };
}

/**
 * 从单首诗中提取意象（句级 + 整诗级）
 * @param {Object} poem - 诗歌对象 { id, title, author, dynasty, content }
 * @returns {Object} - 包含句级和整诗级的意象
 */
export function extractImages(poem) {
  const specificImages = new Set();
  const coreImages = new Set();
  const allImages = new Set();

  // 句级提取结果
  const lineImages = [];

  // 遍历每一句
  for (const line of poem.content) {
    const lineResult = extractFromLine(line);

    if (lineResult.coreImages.length > 0) {
      lineImages.push({
        line,
        ...lineResult,
      });

      // 累加到全诗
      lineResult.specificImages.forEach(img => specificImages.add(img));
      lineResult.coreImages.forEach(img => coreImages.add(img));
    }
  }

  // 全诗级别
  for (const img of specificImages) {
    allImages.add(img);
    const core = IMAGE_DICTIONARY[img];
    if (core) allImages.add(core);
  }

  return {
    poemId: poem.id,
    title: poem.title,
    author: poem.author,
    specificImages: Array.from(specificImages),
    coreImages: Array.from(coreImages),
    allImages: Array.from(allImages),
    lineImages, // 句级意象
  };
}

/**
 * 从多首诗中提取意象并统计共现关系（句级）
 * @param {Array} poems - 诗歌数组
 * @returns {Object} - { cooccurrence, imageStats, poemImages, lineCooccurrence }
 */
export function calculateCooccurrence(poems) {
  // 句级共现矩阵（主要关系）
  const lineCooccurrence = {};

  // 整诗级共现（保留兼容）
  const cooccurrence = {};

  // 意象统计
  const imageStats = {};

  // 每首诗的意象映射
  const poemImages = {};

  // 遍历每首诗
  for (const poem of poems) {
    const result = extractImages(poem);

    // 保存该诗的意象
    poemImages[poem.id] = {
      ...result,
      poem,
    };

    // 统计单个意象出现次数（整诗级）
    for (const image of result.coreImages) {
      if (!imageStats[image]) {
        imageStats[image] = {
          count: 0,
          poems: new Set(),
          lines: 0, // 句级出现次数
        };
      }
      imageStats[image].count++;
      imageStats[image].poems.add(poem.id);
      imageStats[image].lines += result.lineImages.filter(li => li.coreImages.includes(image)).length;
    }

    // === 句级共现关系 ===
    for (const lineData of result.lineImages) {
      const coreImages = lineData.coreImages;

      // 同一句中的意象产生连接
      for (let i = 0; i < coreImages.length; i++) {
        for (let j = i + 1; j < coreImages.length; j++) {
          const img1 = coreImages[i];
          const img2 = coreImages[j];

          // 创建有序键
          const key = img1 < img2 ? `${img1}-${img2}` : `${img2}-${img1}`;

          if (!lineCooccurrence[key]) {
            lineCooccurrence[key] = {
              img1,
              img2,
              count: 0,
              poems: new Set(),
              lines: [], // 存储具体诗句
            };
          }
          lineCooccurrence[key].count++;
          lineCooccurrence[key].poems.add(poem.id);
          lineCooccurrence[key].lines.push({
            poemId: poem.id,
            poemTitle: poem.title,
            line: lineData.line,
          });
        }
      }
    }

    // === 整诗级共现（兼容） ===
    const allCoreImages = result.coreImages;
    for (let i = 0; i < allCoreImages.length; i++) {
      for (let j = i + 1; j < allCoreImages.length; j++) {
        const img1 = allCoreImages[i];
        const img2 = allCoreImages[j];

        const key = img1 < img2 ? `${img1}-${img2}` : `${img2}-${img1}`;

        if (!cooccurrence[key]) {
          cooccurrence[key] = {
            img1,
            img2,
            count: 0,
            poems: new Set(),
          };
        }
        cooccurrence[key].count++;
        cooccurrence[key].poems.add(poem.id);
      }
    }
  }

  // 转换为普通对象
  const lineCooccurrenceObj = {};
  for (const key in lineCooccurrence) {
    lineCooccurrenceObj[key] = {
      ...lineCooccurrence[key],
      poems: Array.from(lineCooccurrence[key].poems),
    };
  }

  const cooccurrenceObj = {};
  for (const key in cooccurrence) {
    cooccurrenceObj[key] = {
      ...cooccurrence[key],
      poems: Array.from(cooccurrence[key].poems),
    };
  }

  const imageStatsObj = {};
  for (const image in imageStats) {
    imageStatsObj[image] = {
      count: imageStats[image].count,
      lines: imageStats[image].lines,
      poems: Array.from(imageStats[image].poems),
    };
  }

  return {
    cooccurrence: cooccurrenceObj, // 整诗级（兼容）
    lineCooccurrence: lineCooccurrenceObj, // 句级（主要）
    imageStats: imageStatsObj,
    poemImages,
  };
}

/**
 * 获取与特定意象相关的诗歌
 * @param {string} coreImage - 核心意象
 * @param {Object} imageStats - 意象统计数据
 * @param {Object} poemImages - 每首诗的意象数据
 * @returns {Array} - 相关的诗歌列表
 */
export function getRelatedPoems(coreImage, imageStats, poemImages) {
  if (!imageStats[coreImage]) {
    return [];
  }

  const poemIds = imageStats[coreImage].poems;
  return poemIds.map(id => poemImages[id]);
}

export default { extractImages, calculateCooccurrence, getRelatedPoems };
