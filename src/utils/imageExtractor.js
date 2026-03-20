import { IMAGE_DICTIONARY, getAllSpecificImages } from '../data/imageDictionary';

// 繁体转简体映射
const traditionalToSimplified = {
  '月': '月', '明': '明', '滿': '满', '殘': '残', '秋': '秋',
  '新': '新', '孤': '孤', '寒': '寒', '夜': '夜', '江': '江',
  '山': '山', '秦': '秦', '關': '关', '色': '色', '光': '光',
  '影': '影', '華': '华', '日': '日', '夕': '夕', '陽': '阳',
  '斜': '斜', '落': '落', '朝': '朝', '旭': '旭', '暉': '晖',
  '星': '星', '辰': '辰', '河': '河', '漢': '汉', '流': '流',
  '雲': '云', '白': '白', '黑': '黑', '烏': '乌', '彩': '彩',
  '青': '青', '霞': '霞', '煙': '烟', '霧': '雾', '風': '风',
  '春': '春', '西': '西', '東': '东', '北': '北', '南': '南',
  '涼': '凉', '微': '微', '疾': '疾', '狂': '狂', '清': '清',
  '雨': '雨', '細': '细', '大': '大', '暴': '暴', '聲': '声',
  '高': '高', '江': '江', '川': '川', '勢': '势', '巒': '峦',
  '峰': '峰', '嵐': '岚', '林': '林', '間': '间', '長': '长',
  '大': '大', '上': '上', '邊': '边', '水': '水', '泉': '泉',
  '溫': '温', '飛': '飞', '湖': '湖', '面': '面', '太': '太',
  '洞': '洞', '庭': '庭', '滄': '沧', '海': '海', '黃': '黄',
  '天': '天', '楊': '杨', '柳': '柳', '枝': '枝', '絲': '丝',
  '垂': '垂', '絮': '絮', '松': '松', '樹': '树', '柏': '柏',
  '梅': '梅', '蕊': '蕊', '香': '香', '冬': '冬', '臘': '腊',
  '竹': '竹', '筍': '笋', '韻': '韵', '花': '花', '鮮': '鲜',
  '瓣': '瓣', '開': '开', '落': '落', '叢': '丛', '芳': '芳',
  '草': '草', '青': '青', '野': '野', '桃': '桃', '紅': '红',
  '桂': '桂', '林': '林', '丹': '丹', '金': '金', '菊': '菊',
  '雁': '雁', '鳥': '鸟', '鳴': '鸣', '過': '过', '飛': '飞',
  '字': '字', '征': '征', '歸': '归', '鶴': '鹤', '仙': '仙',
  '黃': '黄', '鳴': '鸣', '雲': '云', '猿': '猿', '猴': '猴',
  '啼': '啼', '蝶': '蝶', '雙': '双', '舟': '舟', '扁': '扁',
  '輕': '轻', '小': '小', '畫': '画', '舫': '舫', '帆': '帆',
  '揚': '扬', '船': '船', '隻': '只', '漁': '渔', '客': '客',
  '酒': '酒', '美': '美', '濁': '浊', '烈': '烈', '舉': '举',
  '杯': '杯', '醉': '醉', '醒': '醒', '愁': '愁', '離': '离',
  '鄉': '乡', '新': '新', '舊': '旧', '思': '思', '相': '相',
  '念': '念', '歸': '归', '幽': '幽', '沉': '沉', '恨': '恨',
  '別': '别', '淚': '泪', '心': '心', '內': '内', '緒': '绪',
  '真': '真', '酸': '酸', '醉': '醉', '情': '情', '感': '感',
  '深': '深', '亭': '亭', '臺': '台', '長': '长', '驛': '驿',
  '寺': '寺', '廟': '庙', '院': '院', '古': '古', '佛': '佛',
  '霜': '霜', '降': '降', '雪': '雪', '積': '积', '化': '化',
  '瑞': '瑞', '晴': '晴', '雷': '雷', '銀': '银', '天河': '天河',
  '銀河': '银河', '夕陽': '夕阳', '餘': '余', '暉': '晖',
  '溪': '溪', '澗': '涧', '潭': '潭', '深': '深', '碧': '碧',
  '瀑': '瀑', '布': '布', '簾': '帘', '沙': '沙', '漠': '漠',
  '瀚': '瀚', '平': '平', '疇': '畴', '田': '田', '野': '野',
  '峽': '峡', '谷': '谷', '梧': '梧', '桐': '桐', '芭': '芭',
  '蕉': '蕉', '蘆': '芦', '葦': '苇', '蕩': '荡', '紅': '红',
  '豆': '豆', '蓮': '莲', '荷': '荷', '塘': '塘', '鴉': '鸦',
  '烏': '乌', '鵲': '鹊', '喜': '喜', '鶯': '莺', '黃': '黄',
  '嬌': '娇', '杜': '杜', '鵑': '鹃', '啼': '啼', '血': '血',
  '鸚': '鹦', '鵡': '鹉', '螢': '萤', '火': '火', '長': '长',
  '津': '津', '渡': '渡', '口': '口', '歧': '歧', '岔': '岔',
  '荒': '荒', '徑': '径', '路': '路', '小路': '小路', '迷': '迷',
  '陶': '陶', '覺': '觉', '清': '清', '睡': '睡', '眠': '眠',
  '安': '安', '不': '不', '怨': '怨', '哀': '哀', '吟': '吟',
  '詠': '咏', '詩': '诗', '悲': '悲', '城': '城', '市': '市',
  '池': '池', '郭': '郭', '邊': '边', '塔': '塔', '寶': '宝',
  '樓': '楼', '閣': '阁', '臺': '台', '榭': '榭', '橋': '桥',
  '樑': '梁', '石': '石', '斷': '断', '驛': '驿', '館': '馆',
  '燈': '灯', '火': '火', '夢': '梦', '境': '境', '憶': '忆',
  '回': '回', '追': '追', '傷': '伤', '心': '心', '悲': '悲',
  '憂': '忧', '惆': '惆', '悵': '怅', '腸': '肠', '關': '关',
  '口': '口', '塞': '塞', '山海': '山海', '雁門': '雁门', '鐘': '钟',
  '牆': '墙', '壁': '壁', '粉': '粉', '圍': '围',
};

// 将繁体字转换为简体字
function toSimplified(text) {
  let result = text;
  // 先处理多字符词组（按长度降序）
  const multiCharMappings = [
    ['銀河', '银河'], ['天河', '天河'], ['夕陽', '夕阳'], ['長亭', '长亭'],
    ['津渡', '津渡'], ['荒徑', '荒径'], ['樓臺', '楼台'], ['梧桐', '梧桐'],
    ['芭蕉', '芭蕉'], ['蘆葦', '芦苇'], ['紅豆', '红豆'], ['杜鵑', '杜鹃'],
    ['鸚鵡', '鹦鹉'], ['歧路', '歧路'], ['瀑布', '瀑布'], ['沙漠', '沙漠'],
    ['平原', '平原'], ['峽谷', '峡谷'], ['洞庭湖', '洞庭湖'], ['鸞翔', '鸾翔'],
    ['鳳集', '凤集'], ['蓬萊', '蓬莱'], ['扶搖', '扶摇'], ['滄海', '沧海'],
  ];

  for (const [trad, simp] of multiCharMappings) {
    result = result.replace(new RegExp(trad, 'g'), simp);
  }

  // 再处理单字符
  for (const [trad, simp] of Object.entries(traditionalToSimplified)) {
    result = result.replace(new RegExp(trad, 'g'), simp);
  }

  return result;
}

/**
 * 从单句诗中提取意象
 * @param {string} line - 诗句
 * @returns {Object} - { specificImages: Set, coreImages: Set }
 */
function extractFromLine(line) {
  // 先将诗句转换为简体
  const simplifiedLine = toSimplified(line);
  const specificImages = new Set();
  const coreImages = new Set();

  // 获取所有具体意象关键词，按长度降序排列（优先匹配长词）
  const keywords = getAllSpecificImages().sort((a, b) => b.length - a.length);

  // 遍历所有关键词，检查是否出现在简体诗句中
  for (const keyword of keywords) {
    if (simplifiedLine.includes(keyword)) {
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
 * @returns {Array} - 相关的诗歌列表（按知名程度排序）
 */
export function getRelatedPoems(coreImage, imageStats, poemImages) {
  if (!imageStats[coreImage]) {
    return [];
  }

  const poemIds = imageStats[coreImage].poems;
  const poems = poemIds.map(id => poemImages[id]);

  // 知名诗歌评分系统
  const famousAuthors = {
    // 顶级诗人（盛唐代表）
    '李白': 100, '杜甫': 100, '王维': 95, '白居易': 95,
    // 次级名家
    '孟浩然': 85, '王昌龄': 85, '高适': 80, '岑参': 80,
    '刘禹锡': 80, '韩愈': 80, '柳宗元': 80, '李商隐': 85,
    '杜牧': 85, '元稹': 75, '贾岛': 70, '韦应物': 75,
    '张九龄': 75, '王勃': 80, '骆宾王': 70, '宋之问': 65,
    '沈佺期': 65, '陈子昂': 70, '杜审言': 65,
    // 中唐诗人
    '韩翃': 60, '刘长卿': 70, '钱起': 60, '郎士元': 55,
    '李端': 55, '司空曙': 55, '皎然': 55, '陆羽': 50,
    // 晚唐
    '温庭筠': 75, '皮日休': 60, '陆龟蒙': 55, '罗隐': 55,
    '韦庄': 65, '韩偓': 55, '杜荀鹤': 50,
    // 其他
    '张继': 65, '常建': 60, '刘方平': 55, '李益': 60,
    '戎昱': 50, '戴叔伦': 50, '张籍': 60, '王建': 60,
    '元结': 55, '卢纶': 55, '李约': 45, '崔署': 45,
    // 五代/其他
    '南唐后主': 70, '李煜': 75,
  };

  // 知名诗词语控（常见的诗题）
  const famousTitles = [
    '静夜思', '春晓', '悯农', '相思', '红豆', '相思',
    '登鹳雀楼', '黄鹤楼送孟浩然之广陵', '使至塞上',
    '九月九日忆山东兄弟', '送元二使安西', '山居秋暝',
    '鸟鸣涧', '鹿柴', '竹里馆', '辛夷坞', '漆园',
    '渭城曲', '阳关三叠', '出塞', '凉州词',
    '望庐山瀑布', '早发白帝城', '蜀道难', '将进酒',
    '行路难', '月下独酌', '黄鹤楼', '登金陵凤凰台',
    '春望', '茅屋为秋风所破歌', '望岳', '春夜喜雨',
    '蜀相', '登高', '琵琶行', '长恨歌',
    '回乡偶书', '咏柳', '清明', '清明',
    '枫桥夜泊', '夜雨寄北', '无题', '锦瑟',
    '山行', '秋夕', '泊秦淮', '江南春',
    '望洞庭', '乌衣巷', '石头城', '祭柳员外文',
  ];

  /**
   * 计算诗歌知名程度评分
   * @param {Object} poem - 诗歌对象
   * @returns {number} - 评分（越高越知名）
   */
  const calculateFameScore = (poem) => {
    let score = 0;

    // 1. 作者评分
    const authorScore = famousAuthors[poem.author] || 50;
    score += authorScore;

    // 2. 诗题知名度
    const titleLower = poem.title.toLowerCase();
    if (famousTitles.some(t => titleLower.includes(t))) {
      score += 30;
    }

    // 3. 诗句数量（绝句/律诗 vs 古体）- 适当加权
    if (poem.content && poem.content.length === 4) {
      score += 5; // 绝句
    } else if (poem.content && poem.content.length === 8) {
      score += 8; // 律诗
    } else if (poem.content && poem.content.length > 8) {
      score += 3; // 古体
    }

    return score;
  };

  // 按知名程度降序排序
  poems.sort((a, b) => {
    return calculateFameScore(b) - calculateFameScore(a);
  });

  return poems;
}

export default { extractImages, calculateCooccurrence, getRelatedPoems };
