import { CORE_IMAGES, getEmotionColor } from '../data/coreImages';

// 固定种子随机数生成器
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

/**
 * 生成星云数据结构
 * @param {Object} cooccurrenceData - 共现统计数据 from calculateCooccurrence
 * @returns {Object} - { nodes, links, metadata }
 */
export function generateNebulaData(cooccurrenceData) {
  // 优先使用句级共现，如果没有则回退到整诗级
  const { cooccurrence, lineCooccurrence, imageStats, poemImages } = cooccurrenceData;

  // 使用句级共现作为主要数据源
  const activeCooccurrence = lineCooccurrence || cooccurrence;

  const nodes = [];
  const links = [];
  const coreImageSet = new Set(CORE_IMAGES.map(img => img.id));

  // 创建核心意象节点
  const coreNodes = {};
  const maxCount = Math.max(...Object.values(imageStats).map(s => s.count));
  const minCount = Math.min(...Object.values(imageStats).map(s => s.count));
  const countRange = maxCount - minCount || 1;
  console.log('minCount:', minCount, 'maxCount:', maxCount, 'range:', countRange);

  // 按类别分组，便于星团分布
  const categoryGroups = {};
  for (const coreImage of CORE_IMAGES) {
    if (!categoryGroups[coreImage.category]) {
      categoryGroups[coreImage.category] = [];
    }
    categoryGroups[coreImage.category].push(coreImage);
  }

  // ========== 星云分布算法 ==========
  //
  // 参数调整：
  // - 类别中心半径扩大至180-250，拉大类间距离
  // - 高斯σ减小至20-30，节点紧密围绕类中心

  const categories = Object.keys(categoryGroups);
  const categoryPositions = {};

  // 类别中心分布：球壳半径160-220
  const CATEGORY_RADIUS_MIN = 160;
  const CATEGORY_RADIUS_MAX = 220;

  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  categories.forEach((cat, idx) => {
    const theta = 2 * Math.PI * idx / goldenRatio;
    const phi = Math.acos(1 - 2 * (idx + 0.5) / categories.length);
    const radius = CATEGORY_RADIUS_MIN + seededRandom() * (CATEGORY_RADIUS_MAX - CATEGORY_RADIUS_MIN);

    categoryPositions[cat] = {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta) * 0.6,
      z: radius * Math.cos(phi),
    };
  });

  let nodeIndex = 0;
  console.log(`=== 总诗歌数量: ${Object.keys(poemImages).length} ===`);
  console.log('=== 节点count调试 ===');

  // 过滤阈值：只保留出现次数>=1的核心意象
  const MIN_COUNT_THRESHOLD = 1;

  // 统计被跳过的意象
  const skippedImages = [];
  const keptImages = [];

  for (const coreImage of CORE_IMAGES) {
    const stats = imageStats[coreImage.id] || { count: 0, poems: [] };

    // 跳过出现次数太少的意象
    if (stats.count < MIN_COUNT_THRESHOLD) {
      skippedImages.push({ name: coreImage.name, count: stats.count });
      continue;
    }

    keptImages.push({ name: coreImage.name, count: stats.count });
  }

  console.log(`=== 总意象: ${CORE_IMAGES.length}, 保留: ${keptImages.length}, 跳过: ${skippedImages.length} ===`);
  console.log('保留的意象:', keptImages.map(i => `${i.name}(${i.count})`).join(', '));
  console.log('跳过的意象:', skippedImages.map(i => `${i.name}(${i.count})`).join(', '));

  for (const coreImage of CORE_IMAGES) {
    const stats = imageStats[coreImage.id] || { count: 0, poems: [] };
    if (stats.count < MIN_COUNT_THRESHOLD) continue;

    console.log(`${coreImage.name}: count=${stats.count}`);

    // 计算节点大小（基于出现次数）- 使用非线性缩放使差异更明显
    const normalizedCount = (stats.count - minCount) / countRange;
    // 使用平方函数放大差异: 最小8，最大60
    const val = 8 + Math.pow(normalizedCount, 0.7) * 52;

    // 获取情绪颜色
    const color = getEmotionColor(coreImage.emotion);

    // 获取类别中心位置
    const catCenter = categoryPositions[coreImage.category];

    // 同类节点分散：增大偏移半径，让每个节点围绕类中心均匀散开
    // 使用均匀分布而非高斯，避免节点过于集中在类中心
    const offsetRadius = 40 + seededRandom() * 40; // 40-80范围
    const theta = seededRandom() * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom() - 1);

    const x = catCenter.x + offsetRadius * Math.sin(phi) * Math.cos(theta);
    const y = catCenter.y + offsetRadius * Math.sin(phi) * Math.sin(theta);
    const z = catCenter.z + offsetRadius * Math.cos(phi);

    const node = {
      id: coreImage.id,
      name: coreImage.name,
      val,
      color,
      category: coreImage.category,
      emotion: coreImage.emotion,
      count: stats.count,
      poemIds: stats.poems || [],
      isCore: true,
      // 初始位置分布在球面上
      x,
      y,
      z,
    };

    coreNodes[coreImage.id] = node;
    nodes.push(node);
    nodeIndex++;
  }

  // 生成核心意象之间的连线（句级共现）
  // 只显示最强的共现关系
  const linkStrength = {};
  for (const key in activeCooccurrence) {
    const [img1, img2] = key.split('-');
    // 只处理两个都是核心意象的情况
    if (coreImageSet.has(img1) && coreImageSet.has(img2)) {
      const data = activeCooccurrence[key];
      const strength = data.count;
      const lines = data.lines || []; // 保存诗句信息

      if (!linkStrength[img1]) linkStrength[img1] = [];
      if (!linkStrength[img2]) linkStrength[img2] = [];
      linkStrength[img1].push({ target: img2, strength, lines });
      linkStrength[img2].push({ target: img1, strength, lines });
    }
  }

  // 为每个核心节点添加最多5条最强连线（过滤太弱的）
  const MIN_LINK_STRENGTH = 2; // 最小连线强度
  for (const coreId in linkStrength) {
    const connections = linkStrength[coreId]
      .filter(c => c.strength >= MIN_LINK_STRENGTH)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);

    for (const conn of connections) {
      // 避免重复连线
      const linkId = [coreId, conn.target].sort().join('-');
      if (!links.find(l => [l.source, l.target].sort().join('-') === linkId)) {
        links.push({
          source: coreId,
          target: conn.target,
          strength: conn.strength,
          lines: conn.lines, // 保存诗句供交互使用
        });
      }
    }
  }

  return {
    nodes,
    links,
    metadata: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      imageStats,
      poemImages,
      lineCooccurrence, // 句级共现数据，包含诗句
    },
  };
}

/**
 * 生成包含细节意象的完整星云数据
 * @param {Object} cooccurrenceData - 共现统计数据
 * @param {Object} extractedData - 提取的意象数据
 * @returns {Object} - 扩展后的星云数据
 */
export function generateFullNebulaData(cooccurrenceData, extractedData) {
  const { nodes, links, metadata } = generateNebulaData(cooccurrenceData);

  // 添加具体意象节点（细节层）
  const specificImageNodes = {};
  const specificImageCount = {};

  // 统计每个核心意象下的具体意象
  for (const poemId in extractedData.poemImages) {
    const poemData = extractedData.poemImages[poemId];
    for (const specificImage of poemData.specificImages) {
      if (!specificImageCount[specificImage]) {
        specificImageCount[specificImage] = new Set();
      }
      specificImageCount[specificImage].add(poemId);
    }
  }

  // 创建具体意象节点
  for (const specificImage in specificImageCount) {
    // 获取对应的核心意象
    let parentCore = null;
    for (const poemId in extractedData.poemImages) {
      if (extractedData.poemImages[poemId].specificImages.includes(specificImage)) {
        const coreImages = extractedData.poemImages[poemId].coreImages;
        // 简单取第一个
        if (coreImages.length > 0) {
          parentCore = coreImages[0];
          break;
        }
      }
    }

    if (!parentCore) continue;

    // 计算大小（比核心节点小）
    const count = specificImageCount[specificImage].size;
    const val = 3 + Math.min(count * 2, 8); // 3-11

    // 使用父节点的颜色，但稍微暗淡一些
    const parentNode = nodes.find(n => n.id === parentCore);
    const baseColor = parentNode ? parentNode.color : '#888888';

    const node = {
      id: specificImage,
      name: specificImage,
      val,
      color: baseColor,
      category: '细节',
      parentCore,
      count,
      poemIds: Array.from(specificImageCount[specificImage]),
      isCore: false,
      // 细节节点聚集在父节点附近
      x: parentNode.x + (seededRandom() - 0.5) * 10,
      y: parentNode.y + (seededRandom() - 0.5) * 10,
      z: parentNode.z + (seededRandom() - 0.5) * 10,
    };

    specificImageNodes[specificImage] = node;
    nodes.push(node);

    // 添加到核心节点的连线
    links.push({
      source: parentCore,
      target: specificImage,
      strength: count,
      isDetail: true,
    });
  }

  return {
    nodes,
    links,
    metadata: {
      ...metadata,
      specificImageNodes,
    },
  };
}

export default { generateNebulaData, generateFullNebulaData };
