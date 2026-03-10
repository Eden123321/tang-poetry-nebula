import { IMAGE_DICTIONARY, getAllSpecificImages } from '../data/imageDictionary';

/**
 * 从单首诗中提取意象
 * @param {Object} poem - 诗歌对象 { id, title, author, dynasty, content }
 * @returns {Object} - { coreImages: Set, specificImages: Set, allImages: Set }
 */
export function extractImages(poem) {
  const specificImages = new Set();
  const coreImages = new Set();
  const allImages = new Set();

  // 合并所有诗句为一个文本
  const fullText = poem.content.join('');

  // 获取所有具体意象关键词，按长度降序排列（优先匹配长词）
  const keywords = getAllSpecificImages().sort((a, b) => b.length - a.length);

  // 遍历所有关键词，检查是否出现在诗句中
  for (const keyword of keywords) {
    if (fullText.includes(keyword)) {
      specificImages.add(keyword);

      // 映射到核心意象
      const coreImage = IMAGE_DICTIONARY[keyword];
      if (coreImage) {
        coreImages.add(coreImage);
        allImages.add(coreImage);
      }

      // 同时保留具体意象
      allImages.add(keyword);
    }
  }

  return {
    poemId: poem.id,
    title: poem.title,
    author: poem.author,
    specificImages: Array.from(specificImages),
    coreImages: Array.from(coreImages),
    allImages: Array.from(allImages),
  };
}

/**
 * 从多首诗中提取意象并统计共现关系
 * @param {Array} poems - 诗歌数组
 * @returns {Object} - { cooccurrence, imageStats, poemImages }
 */
export function calculateCooccurrence(poems) {
  // 共现矩阵
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

    // 统计单个意象出现次数
    for (const image of result.coreImages) {
      if (!imageStats[image]) {
        imageStats[image] = {
          count: 0,
          poems: new Set(),
        };
      }
      imageStats[image].count++;
      imageStats[image].poems.add(poem.id);
    }

    // 统计共现关系
    const coreImages = result.coreImages;
    for (let i = 0; i < coreImages.length; i++) {
      for (let j = i + 1; j < coreImages.length; j++) {
        const img1 = coreImages[i];
        const img2 = coreImages[j];

        // 创建有序键（确保 img1 < img2）
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
      poems: Array.from(imageStats[image].poems),
    };
  }

  return {
    cooccurrence: cooccurrenceObj,
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
