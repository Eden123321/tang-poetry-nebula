/**
 * 预计算脚本 - 生成缓存JSON（独立版本，不依赖源码）
 * 运行: node scripts/precompute.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// ==================== 数据 ====================
const poemsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/poems.json'), 'utf8'));
const keywordsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/keywords.json'), 'utf8'));
const ALL_KEYWORDS = keywordsData.keywords; // 400+ 关键词列表

// 导入 IMAGE_DICTIONARY（用于建立具体意象到核心意象的映射）
const imageDictionaryPath = path.join(rootDir, 'src/data/imageDictionary.js');
const imageDictionaryContent = fs.readFileSync(imageDictionaryPath, 'utf8');
// 提取 IMAGE_DICTIONARY 对象
const IMAGE_DICTIONARY = {};
const dictMatch = imageDictionaryContent.match(/export\s+const\s+IMAGE_DICTIONARY\s*=\s*\{([\s\S]*?)\};/);
if (dictMatch) {
  const dictContent = dictMatch[1];
  // 解析键值对
  const pairs = dictContent.matchAll(/'([^']+)':\s*'([^']+)'/g);
  for (const match of pairs) {
    IMAGE_DICTIONARY[match[1]] = match[2];
  }
}
console.log(`  导入 IMAGE_DICTIONARY: ${Object.keys(IMAGE_DICTIONARY).length} 条映射`);

// ==================== 意象过滤规则 ====================

// 黑名单：不能作为意象节点的词
const IMAGE_BLACKLIST = [
  // 功能词/助词
  '之', '其', '亦', '乃', '而', '且', '于', '以', '为', '乎', '焉', '哉', '矣', '兮', '邪',
  // 方位词
  '中', '里', '间', '上', '下', '前', '后', '内', '外', '旁',
  // 伪具象词（修饰语）
  '孤', '清', '远', '长', '深', '空', '淡', '静', '幽',
  '暮', '晓', '寒', '暖', '明', '暗', '高', '低', '近',
  // 抽象词
  '愁', '思', '情', '意', '梦', '恨', '怨', '怜', '悲', '欢',
  '喜', '怒', '惊', '恐', '爱', '憎', '慕', '羡',
  // 数词
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '亿',
  // 代词
  '我', '汝', '尔', '子', '谁', '何', '孰', '彼', '此',
  // 量词
  '个', '只', '片', '枝', '朵', '杯', '盏', '觞', '斝',
  // 时间词
  '昔', '今', '古', '往', '来', '岁', '时', '辰', '旦',
];

// 只在复合词中出现的词（单独出现时不算）
const COMPOUND_ONLY_WORDS = [
  '孤', '清', '远', '长', '深', '空', '淡', '静', '幽',
  '暮', '晓', '寒', '暖', '明', '暗', '高', '低', '近',
];

// 上下文排除规则
const CONTEXT_EXCLUSIONS = [
  { pattern: '虽{word}', exclude: ['云', '乃', '亦', '何'] },
  { pattern: '乃{word}', exclude: ['云', '曰', '亦', '何'] },
  { pattern: '亦{word}', exclude: ['云', '乃', '何', '其'] },
  { pattern: '谁{word}', exclude: ['云', '曰', '其', '何'] },
  { pattern: '何{word}', exclude: ['云', '其', '之'] },
  { pattern: '岂{word}', exclude: ['云', '曰', '其', '亦'] },
  { pattern: '况{word}', exclude: ['云', '乃', '其'] },
  { pattern: '不{word}', exclude: ['云', '之'] },
  { pattern: '莫{word}', exclude: ['云', '之', '其'] },
  { pattern: '所{word}', exclude: ['云', '之', '何'] },
  { pattern: '{word}曰', exclude: ['曰', '云'] },
  { pattern: '{word}谓', exclude: ['谓', '云'] },
  { pattern: '之{word}', exclude: ['之', '云', '曰'] },
  { pattern: '其{word}', exclude: ['其', '云', '之', '曰'] },
  { pattern: '犹{word}', exclude: ['犹', '且', '云'] },
  { pattern: '尚{word}', exclude: ['尚', '犹', '云'] },
  { pattern: '则{word}', exclude: ['则', '云', '曰'] },
  { pattern: '{word}之', exclude: ['之'] },
  { pattern: '{word}然', exclude: ['然'] },
  { pattern: '{word}而', exclude: ['而'] },
  { pattern: '{word}焉', exclude: ['焉'] },
  { pattern: '{word}哉', exclude: ['哉'] },
  { pattern: '{word}矣', exclude: ['矣'] },
  { pattern: '{word}兮', exclude: ['兮'] },
  { pattern: '一{word}', exclude: ['一', '何'] },
  { pattern: '{word}何', exclude: ['一', '云', '日', '何'] },
  { pattern: '有{word}', exclude: ['有', '云'] },
  { pattern: '无{word}', exclude: ['无', '云'] },
];

// 检查一个词是否在特定上下文中被排除
function isExcludedByContext(word, line) {
  for (const rule of CONTEXT_EXCLUSIONS) {
    const regexPattern = rule.pattern.replace('{word}', word);
    if (line.includes(regexPattern)) {
      if (rule.exclude.includes(word)) {
        return true;
      }
    }
  }
  return false;
}

// 情绪颜色
const EMOTION_COLORS = {
  '思乡': '#4A90D9',
  '离别': '#D4A574',
  '秋思': '#9B59B6',
  '豪放': '#E74C3C',
  '清雅': '#1ABC9C',
};

// 核心意象
const CORE_IMAGES = [
  { id: '月', name: '月', category: '天象', emotion: '思乡' },
  { id: '日', name: '日', category: '天象', emotion: '豪放' },
  { id: '星', name: '星', category: '天象', emotion: '清雅' },
  { id: '云', name: '云', category: '天象', emotion: '清雅' },
  { id: '风', name: '风', category: '天象', emotion: '离别' },
  { id: '雨', name: '雨', category: '天象', emotion: '秋思' },
  { id: '雪', name: '雪', category: '天象', emotion: '清雅' },
  { id: '霜', name: '霜', category: '天象', emotion: '秋思' },
  { id: '露', name: '露', category: '天象', emotion: '清雅' },
  { id: '霞', name: '霞', category: '天象', emotion: '清雅' },
  { id: '天', name: '天', category: '天象', emotion: '豪放' },
  { id: '夜', name: '夜', category: '天象', emotion: '思乡' },
  { id: '春风', name: '春风', category: '天象', emotion: '清雅' },
  { id: '秋风', name: '秋风', category: '天象', emotion: '秋思' },
  { id: '夕阳', name: '夕阳', category: '天象', emotion: '离别' },
  { id: '朝阳', name: '朝阳', category: '天象', emotion: '豪放' },
  { id: '山', name: '山', category: '山水', emotion: '豪放' },
  { id: '水', name: '水', category: '山水', emotion: '清雅' },
  { id: '江', name: '江', category: '山水', emotion: '思乡' },
  { id: '河', name: '河', category: '山水', emotion: '思乡' },
  { id: '湖', name: '湖', category: '山水', emotion: '清雅' },
  { id: '海', name: '海', category: '山水', emotion: '豪放' },
  { id: '溪', name: '溪', category: '山水', emotion: '清雅' },
  { id: '泉', name: '泉', category: '山水', emotion: '清雅' },
  { id: '石', name: '石', category: '山水', emotion: '清雅' },
  { id: '岸', name: '岸', category: '山水', emotion: '离别' },
  { id: '洲', name: '洲', category: '山水', emotion: '思乡' },
  { id: '渚', name: '渚', category: '山水', emotion: '清雅' },
  { id: '关', name: '关', category: '山水', emotion: '离别' },
  { id: '城', name: '城', category: '山水', emotion: '离别' },
  { id: '长安', name: '长安', category: '山水', emotion: '思乡' },
  { id: '洛阳', name: '洛阳', category: '山水', emotion: '思乡' },
  { id: '故乡', name: '故乡', category: '山水', emotion: '思乡' },
  { id: '天涯', name: '天涯', category: '山水', emotion: '离别' },
  { id: '柳', name: '柳', category: '植物', emotion: '离别' },
  { id: '松', name: '松', category: '植物', emotion: '清雅' },
  { id: '竹', name: '竹', category: '植物', emotion: '清雅' },
  { id: '梅', name: '梅', category: '植物', emotion: '清雅' },
  { id: '花', name: '花', category: '植物', emotion: '清雅' },
  { id: '桃花', name: '桃花', category: '植物', emotion: '清雅' },
  { id: '菊', name: '菊', category: '植物', emotion: '清雅' },
  { id: '荷', name: '荷', category: '植物', emotion: '清雅' },
  { id: '草', name: '草', category: '植物', emotion: '思乡' },
  { id: '树', name: '树', category: '植物', emotion: '清雅' },
  { id: '梧桐', name: '梧桐', category: '植物', emotion: '秋思' },
  { id: '桑', name: '桑', category: '植物', emotion: '思乡' },
  { id: '枫', name: '枫', category: '植物', emotion: '秋思' },
  { id: '苔', name: '苔', category: '植物', emotion: '清雅' },
  { id: '兰', name: '兰', category: '植物', emotion: '清雅' },
  { id: '杏花', name: '杏花', category: '植物', emotion: '清雅' },
  { id: '雁', name: '雁', category: '动物', emotion: '思乡' },
  { id: '鸟', name: '鸟', category: '动物', emotion: '清雅' },
  { id: '鹤', name: '鹤', category: '动物', emotion: '清雅' },
  { id: '鸥', name: '鸥', category: '动物', emotion: '清雅' },
  { id: '猿', name: '猿', category: '动物', emotion: '秋思' },
  { id: '马', name: '马', category: '动物', emotion: '豪放' },
  { id: '鱼', name: '鱼', category: '动物', emotion: '清雅' },
  { id: '莺', name: '莺', category: '动物', emotion: '清雅' },
  { id: '燕', name: '燕', category: '动物', emotion: '思乡' },
  { id: '鹭', name: '鹭', category: '动物', emotion: '清雅' },
  { id: '龙', name: '龙', category: '动物', emotion: '豪放' },
  { id: '凤', name: '凤', category: '动物', emotion: '清雅' },
  { id: '犬', name: '犬', category: '动物', emotion: '思乡' },
  { id: '鹿', name: '鹿', category: '动物', emotion: '清雅' },
  { id: '楼', name: '楼', category: '建筑', emotion: '思乡' },
  { id: '台', name: '台', category: '建筑', emotion: '清雅' },
  { id: '亭', name: '亭', category: '建筑', emotion: '离别' },
  { id: '桥', name: '桥', category: '建筑', emotion: '离别' },
  { id: '舟', name: '舟', category: '建筑', emotion: '思乡' },
  { id: '船', name: '船', category: '建筑', emotion: '思乡' },
  { id: '帆', name: '帆', category: '建筑', emotion: '思乡' },
  { id: '宫', name: '宫', category: '建筑', emotion: '豪放' },
  { id: '殿', name: '殿', category: '建筑', emotion: '豪放' },
  { id: '城楼', name: '城楼', category: '建筑', emotion: '离别' },
  { id: '庭院', name: '庭院', category: '建筑', emotion: '清雅' },
  { id: '驿站', name: '驿站', category: '建筑', emotion: '离别' },
  { id: '酒楼', name: '酒楼', category: '建筑', emotion: '豪放' },
  { id: '书斋', name: '书斋', category: '建筑', emotion: '清雅' },
  { id: '酒', name: '酒', category: '器物', emotion: '豪放' },
  { id: '杯', name: '杯', category: '器物', emotion: '豪放' },
  { id: '灯', name: '灯', category: '器物', emotion: '思乡' },
  { id: '烛', name: '烛', category: '器物', emotion: '思乡' },
  { id: '琴', name: '琴', category: '器物', emotion: '清雅' },
  { id: '剑', name: '剑', category: '器物', emotion: '豪放' },
  { id: '衣', name: '衣', category: '器物', emotion: '思乡' },
  { id: '帘', name: '帘', category: '器物', emotion: '清雅' },
  { id: '镜', name: '镜', category: '器物', emotion: '思乡' },
  { id: '砧', name: '砧', category: '器物', emotion: '离别' },
  { id: '席', name: '席', category: '器物', emotion: '清雅' },
  { id: '鼓', name: '鼓', category: '器物', emotion: '豪放' },
  { id: '人', name: '人', category: '人物', emotion: '思乡' },
  { id: '客', name: '客', category: '人物', emotion: '思乡' },
  { id: '行人', name: '行人', category: '人物', emotion: '离别' },
  { id: '归人', name: '归人', category: '人物', emotion: '思乡' },
  { id: '故人', name: '故人', category: '人物', emotion: '离别' },
  { id: '游子', name: '游子', category: '人物', emotion: '思乡' },
  { id: '征人', name: '征人', category: '人物', emotion: '离别' },
  { id: '美人', name: '美人', category: '人物', emotion: '清雅' },
  { id: '君', name: '君', category: '人物', emotion: '离别' },
  { id: '我', name: '我', category: '人物', emotion: '思乡' },
];

// 核心意象Set
const coreImageSet = new Set(CORE_IMAGES.map(img => img.id));

// 构建关键词到核心意象的映射（用于匹配400+关键词）
const keywordToCoreMap = {};
for (const core of CORE_IMAGES) {
  // 核心意象本身也是关键词
  keywordToCoreMap[core.name] = core;
}

// 添加 IMAGE_DICTIONARY 中的映射
for (const [specific, coreId] of Object.entries(IMAGE_DICTIONARY)) {
  if (!keywordToCoreMap[specific]) {
    const core = CORE_IMAGES.find(c => c.id === coreId);
    if (core) {
      keywordToCoreMap[specific] = core;
    }
  }
}
console.log(`  关键词到核心意象映射: ${Object.keys(keywordToCoreMap).length} 个`);

// 额外关键词：那些映射到核心意象的具体意象
// 从 coreImages.js 的 IMAGE_DICTIONARY 导出中提取（这里我们直接用 keywords.json 中的其他词）
// keywords.json 已经包含了所有需要匹配的关键词

// 简化的繁→简映射（只处理最常见的）
const traditionalToSimplified = {
  '詩': '诗', '語': '语', '詞': '词', '識': '识', '說': '说',
  '為': '为', '無': '无', '見': '见', '間': '间', '關': '关',
  '誰': '谁', '雲': '云', '誰': '谁', '雖': '虽',
  '門': '门', '開': '开', '聞': '闻', '問': '问', '學': '学',
  '國': '国', '圖': '图', '園': '园', '環': '环', '處': '处',
  '雲': '云', '電': '电', '風': '风', '飛': '飞',
  '飲': '饮', '馬': '马', '魚': '鱼', '鳥': '鸟', '龍': '龙',
  '書': '书', '畫': '画', '筆': '笔', '紙': '纸',
  '絃': '弦', '聲': '声', '歌': '歌', '曲': '曲',
  '酒': '酒', '杯': '杯', '壺': '壶', '傾': '倾', '醉': '醉',
  '夢': '梦', '醒': '醒', '淚': '泪', '心': '心', '情': '情',
  '思': '思', '念': '念', '憶': '忆', '歸': '归', '來': '来',
  '長': '长', '短': '短', '高': '高', '低': '低', '遠': '远',
  '近': '近', '深': '深', '淺': '浅', '清': '清', '濁': '浊',
  '明': '明', '暗': '暗', '黑': '黑', '白': '白', '紅': '红',
  '黃': '黄', '藍': '蓝', '綠': '绿', '青': '青', '紫': '紫',
  '新': '新', '舊': '旧', '古': '古', '今': '今', '春': '春',
  '夏': '夏', '秋': '秋', '冬': '冬', '夜': '夜', '晝': '昼',
  '朝': '朝', '暮': '暮', '曉': '晓', '晨': '晨', '夕': '夕',
  '煙': '烟', '霧': '雾', '露': '露', '光': '光', '影': '影',
  '香': '香', '色': '色', '形': '形', '態': '态', '樣': '样',
  '體': '体', '面': '面', '頭': '头', '手': '手', '足': '足',
  '眼': '眼', '耳': '耳', '口': '口', '腸': '肠', '骨': '骨',
  '肉': '肉', '血': '血', '魂': '魂', '魄': '魄', '神': '神',
  '興': '兴', '衰': '衰', '榮': '荣', '辱': '辱',
  '貧': '贫', '富': '富', '貴': '贵', '賤': '贱',
  '善': '善', '惡': '恶', '美': '美', '麗': '丽', '醜': '丑',
  '愛': '爱', '恨': '恨', '怨': '怨', '恩': '恩', '德': '德',
  '道': '道', '理': '理', '歲': '岁', '時': '时', '年': '年',
  '日': '日', '月': '月', '星': '星', '天': '天', '地': '地',
  '山': '山', '水': '水', '江': '江', '河': '河', '湖': '湖',
  '林': '林', '樹': '树', '花': '花', '草': '草', '竹': '竹',
  '梅': '梅', '柳': '柳', '松': '松', '桃': '桃', '李': '李',
  '樓': '楼', '臺': '台', '亭': '亭', '橋': '桥', '舟': '舟',
  '船': '船', '車': '车', '路': '路', '道': '道', '城': '城',
  '宮': '宫', '殿': '殿', '廟': '庙', '塔': '塔', '鐘': '钟',
  '東': '东', '西': '西', '南': '南', '北': '北', '裡': '里',
  '傷': '伤', '病': '病', '死': '死', '別': '别', '離': '离',
  '萬': '万', '與': '与', '種': '种', '經': '经', '義': '义',
  '禮': '礼', '樂': '乐', '農': '农', '報': '报', '結': '结',
  '綢': '绸', '鄉': '乡', '備': '备', '將': '将', '層': '层',
  '峽': '峡', '島': '岛', '簾': '帘', '帶': '带', '幫': '帮',
  '幣': '币', '莊': '庄', '華': '华', '著': '着', '複': '复',
  '觀': '观', '義': '义', '現': '现', '覺': '觉', '識': '识',
  '護': '护', '譯': '译', '議': '议', '變': '变', '贊': '赞',
  '贈': '赠', '趙': '赵', '賽': '赛', '軍事': '军事', '辦': '办',
  '辭': '辞', '遲': '迟', '還': '还', '過': '过', '運': '运',
  '鄉': '乡', '錢': '钱', '錶': '表', '針': '针', '間': '间',
  '關': '关', '陽': '阳', '陰': '阴', '難': '难', '雜': '杂',
  '雖': '虽', '靈': '灵', '電': '电', '養': '养', '餘': '余',
  '館': '馆', '驗': '验', '嚇': '吓', '聽': '听', '聯': '联',
  '自動': '自动', '與': '与', '學': '学', '幾': '几', '處': '处',
  '號': '号', '術': '术', '達': '达', '報': '报', '劉': '刘',
  '遷': '迁', '鄉': '乡', '鄭': '郑', '優': '优', '襲': '袭',
  '攪': '搅', '敗': '败', '敘': '叙', '敵': '敌', '糧': '粮',
  '適': '适', '廣': '广', '廁': '厕', '則': '则', '價': '价',
  '戰': '战', '戲': '戏', '戶': '户', '擔': '担', '報': '报',
  '擔': '担', '趙': '赵', '藥': '药', '蟬': '蝉', '幣': '币',
  '視': '视', '織': '织', '總': '总', '囑': '嘱', '獨': '独',
  '獲': '获', '藝術': '艺术', '贏': '赢', '贍': '赡', '貨': '货',
  '資': '资', '賺': '赚', '責': '责', '賈': '贾', '賢': '贤',
  '質': '质', '帳': '账', '賤': '贱', '賊': '贼', '賓': '宾',
  '敗': '败', '賑': '赈', '賢': '贤', '賦': '赋', '質': '质',
  '賭': '赌', '賂': '赂', '贈': '赠', '贊': '赞', '贏': '赢',
  '贍': '赡', '贓': '赃', '變': '变', '讓': '让', '論': '论',
  '諸': '诸', '講': '讲', '謝': '谢', '謠': '谣', '謊': '谎',
  '謙': '谦', '謹': '谨', '證': '证', '譽': '誉', '譯': '译',
  '讀': '读', '護': '护', '譯': '译', '讚': '赞', '議': '议',
  '識': '识', '譜': '谱', '證': '证', '警': '警', '議': '议',
  '護': '护', '譽': '誉', '變': '变', '讓': '让', '讚': '赞',
  '豆': '豆', '豐': '丰', '貓': '猫', '豬': '猪', '貝': '贝',
  '貞': '贞', '負': '负', '財': '财', '責': '责', '賢': '贤',
  '敗': '败', '貨': '货', '質': '质', '賤': '贱', '貼': '贴',
  '貴': '贵', '買': '买', '費': '费', '貸': '贷', '資': '资',
  '賊': '贼', '賄': '贿', '賂': '赂', '賑': '赈', '賢': '贤',
  '賞': '赏', '賜': '赐', '質': '质', '賭': '赌', '贖': '赎',
  '賞': '赏', '賢': '贤', '賦': '赋', '贈': '赠', '贊': '赞',
  '贈': '赠', '贏': '赢', '贍': '赡', '贓': '赃', '贏': '赢',
  '見': '见', '觀': '观', '視': '视', '覺': '觉', '覽': '览',
  '觀': '观', '見': '见', '視': '视', '覽': '览', '覺': '觉',
  '覩': '睹', '預': '预', '覽': '览', '觀': '观', '見': '见',
  '視': '视', '覺': '觉', '覽': '览', '觀': '观', '見': '见',
  '認': '认', '誤': '误', '說': '说', '講': '讲', '讀': '读',
  '論': '论', '諺': '谚', '諾': '诺', '誘': '诱', '誨': '诲',
  '說': '说', '話': '话', '語': '语', '誤': '误', '誘': '诱',
  '誨': '诲', '診': '诊', '詛': '诅', '詞': '词', '詔': '诏',
  '譽': '誉', '舉': '举', '舊': '旧', '檢': '检', '東': '东',
  '曉': '晓', '極': '极', '槍': '枪', '樁': '桩', '樂': '乐',
  '橘': '橘', '傾': '倾', '償': '偿', '優': '优', '儲': '储',
  '響': '响', '擬': '拟', '擴': '扩', '樸': '朴', '樹': '树',
  '橋': '桥', '機': '机', '橫': '横', '檢': '检', '櫃': '柜',
  '檳': '槟', '欄': '栏', '權': '权', '欖': '榄', '棧': '栈',
  '橋': '桥', '檔': '档', '榮': '荣', '輸': '输', '藥': '药',
  '櫻': '樱', '欄': '栏', '欖': '榄', '棧': '栈', '欽': '钦',
  '歐': '欧', '隴': '陇', '陽': '阳', '陰': '阴', '陳': '陈',
  '雜': '杂', '離': '离', '電': '电', '需': '需', '靈': '灵',
  '韓': '韩', '頭': '头', '題': '题', '額': '额', '顔': '颜',
  '願': '愿', '類': '类', '飄': '飘', '風': '风', '飛': '飞',
  '養': '养', '餘': '余', '館': '馆', '馬': '马', '驕': '骄',
  '驗': '验', '響': '响', '壞': '坏', '攔': '拦', '灘': '滩',
  '灣': '湾', '灝': '灏', '爐': '炉', '獵': '猎', '獻': '献',
  '贏': '赢', '鹽': '盐', '麗': '丽', '，讓': '让', '產': '产',
  '園': '园', '護': '护', '譽': '誉', '辭': '辞', '顯': '显',
  '風': '风', '養': '养', '餘': '余', '餞': '饯', '飾': '饰',
  '飽': '饱', '餓': '饿', '餘': '余', '館': '馆', '餞': '饯',
  '餞': '饯', '餓': '饿', '餒': '馁', '餘': '余', '館': '馆',
  '餅': '饼', '饑': '饥', '餞': '饯', '餞': '饯', '飽': '饱',
  '飾': '饰', '養': '养', '餐': '餐', '館': '馆', '餅': '饼',
  '讓': '让', '論': '论', '讚': '赞', '講': '讲', '診': '诊',
  '護': '护', '讀': '读', '響': '响', '譽': '誉', '變': '变',
  '讚': '赞', '讓': '让', '說': '说', '話': '话', '語': '语',
  '謎': '谜', '謊': '谎', '謠': '谣', '謙': '谦', '謹': '谨',
  '證': '证', '譽': '誉', '譯': '译', '讀': '读', '護': '护',
  '變': '变', '讓': '让', '讚': '赞', '觀': '观', '見': '见',
  '覺': '觉', '覽': '览', '視': '视', '認': '认', '誤': '误',
  '說': '说', '讀': '读', '論': '论', '講': '讲', '謝': '谢',
  '謠': '谣', '謙': '谦', '謹': '谨', '證': '证', '譽': '誉',
  '讀': '读', '讚': '赞', '讓': '让', '變': '变', '論': '论',
};

function toSimplified(text) {
  if (!text) return text;
  return text.split('').map(c => traditionalToSimplified[c] || c).join('');
}

// 简化的意象词典（只包含能匹配到核心意象的）
// 这会通过扫描诗歌动态生成

// ==================== 核心算法 ====================

console.log('开始预计算...');
console.log(`诗歌数量: ${poemsData.length}`);

// 1. 扫描所有诗歌，收集所有出现过的具体意象
console.log('\n[1/4] 扫描诗歌收集意象...');
const foundSpecificImages = new Set();
const specificImageToCore = {};

for (const poem of poemsData) {
  for (const line of poem.content || []) {
    const simplified = toSimplified(line);
    // 使用400+关键词进行匹配
    for (const keyword of ALL_KEYWORDS) {
      // 跳过黑名单词
      if (IMAGE_BLACKLIST.includes(keyword)) continue;
      // 跳过上下文排除的词
      if (isExcludedByContext(keyword, simplified)) continue;

      if (simplified.includes(keyword)) {
        foundSpecificImages.add(keyword);
        // 找到该关键词对应的核心意象
        if (!specificImageToCore[keyword] && keywordToCoreMap[keyword]) {
          specificImageToCore[keyword] = keywordToCoreMap[keyword];
        }
      }
    }
  }
}

console.log(`  找到 ${foundSpecificImages.size} 个具体意象`);

// 2. 从诗歌内容中提取每首诗的意象
console.log('\n[2/4] 提取每首诗的意象...');
const poemImages = {};
const imageStats = {};
const lineCooccurrence = {};
const cooccurrence = {};

for (const poem of poemsData) {
  const specificImages = new Set();
  const coreImages = new Set();
  const lineImages = [];

  for (const line of poem.content || []) {
    const simplified = toSimplified(line);

    // 第一步：找出所有匹配的关键词
    const allMatchedKeywords = [];
    for (const keyword of ALL_KEYWORDS) {
      if (simplified.includes(keyword)) {
        allMatchedKeywords.push(keyword);
      }
    }

    // 第二步：长词优先匹配，短词被长词包含时跳过
    // 例如："花开" 匹配后，"花" 就不能再匹配了
    allMatchedKeywords.sort((a, b) => b.length - a.length);

    const lineSpecifics = [];
    const lineCores = [];
    const matchedStrings = []; // 记录已匹配的词

    for (const keyword of allMatchedKeywords) {
      // 第一层过滤：检查黑名单
      if (IMAGE_BLACKLIST.includes(keyword)) {
        continue; // 跳过黑名单词
      }

      // 第二层过滤：检查上下文排除
      if (isExcludedByContext(keyword, simplified)) {
        continue; // 在特定上下文中被排除
      }

      // 第三层：检查这个词是否被已匹配的更长词包含
      let isSubstringOfMatched = false;
      for (const matched of matchedStrings) {
        if (matched.length > keyword.length && matched.includes(keyword)) {
          isSubstringOfMatched = true;
          break;
        }
      }

      if (!isSubstringOfMatched) {
        lineSpecifics.push(keyword);
        matchedStrings.push(keyword);
        specificImages.add(keyword);

        // 如果该关键词映射到核心意象
        if (keywordToCoreMap[keyword]) {
          const coreId = keywordToCoreMap[keyword].id;
          if (!lineCores.includes(coreId)) {
            lineCores.push(coreId);
            coreImages.add(coreId);
          }
        }
      }
    }

    if (lineCores.length > 0) {
      lineImages.push({
        line: poem.content[poem.content.indexOf(line)],
        specificImages: lineSpecifics,
        coreImages: lineCores,
      });
    }
  }

  // 计算诗歌知名度分数（预计算，用于排序优化）
  const famousAuthors = {
    '李白': 100, '杜甫': 100, '王维': 95, '白居易': 95,
    '孟浩然': 85, '王昌龄': 85, '高适': 80, '岑参': 80,
    '刘禹锡': 80, '韩愈': 80, '柳宗元': 80, '李商隐': 85,
    '杜牧': 85, '元稹': 75, '贾岛': 70, '韦应物': 75,
    '张九龄': 75, '王勃': 80, '骆宾王': 70, '宋之问': 65,
    '沈佺期': 65, '陈子昂': 70, '杜审言': 65,
  };
  const famousTitles = [
    '静夜思', '春晓', '悯农', '相思', '红豆',
    '登鹳雀楼', '黄鹤楼送孟浩然之广陵', '使至塞上',
    '九月九日忆山东兄弟', '送元二使安西', '山居秋暝',
    '望庐山瀑布', '早发白帝城', '蜀道难', '将进酒',
  ];
  const famousLinesSet = new Set([
    '床前明月光', '疑是地上霜', '举头望明月', '低头思故乡',
    '春眠不觉晓', '处处闻啼鸟', '夜来风雨声', '花落知多少',
    '白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼',
    '千山鸟飞绝', '万径人踪灭', '孤舟蓑笠翁', '独钓寒江雪',
  ]);

  const calcFameScore = (p) => {
    let score = 0;
    // 知名诗句匹配
    if (p.content) {
      for (const line of p.content) {
        if (famousLinesSet.has(line)) {
          score += 100;
          break; // 只加一次
        }
      }
    }
    // 作者评分
    if (p.author && famousAuthors[p.author]) {
      score += famousAuthors[p.author];
    }
    // 知名诗题
    if (p.title && famousTitles.some(t => p.title.includes(t))) {
      score += 30;
    }
    // 诗句数量（绝句+5，七律+8）
    if (p.content && p.content.length === 4) score += 5;
    else if (p.content && p.content.length === 8) score += 8;
    return score;
  };

  poemImages[poem.id] = {
    poemId: poem.id,
    poem,
    specificImages: Array.from(specificImages),
    coreImages: Array.from(coreImages),
    lineImages,
    fameScore: calcFameScore(poem),
  };

  // 统计意象
  for (const img of coreImages) {
    if (!imageStats[img]) {
      imageStats[img] = { count: 0, poems: new Set(), lines: 0 };
    }
    imageStats[img].count++;
    imageStats[img].poems.add(poem.id);
    imageStats[img].lines += lineImages.filter(li => li.coreImages.includes(img)).length;
  }

  // 句级共现
  for (const lineData of lineImages) {
    const cores = lineData.coreImages;
    for (let i = 0; i < cores.length; i++) {
      for (let j = i + 1; j < cores.length; j++) {
        const img1 = cores[i];
        const img2 = cores[j];
        const key = img1 < img2 ? `${img1}-${img2}` : `${img2}-${img1}`;
        if (!lineCooccurrence[key]) {
          lineCooccurrence[key] = { img1, img2, count: 0, poems: new Set(), lines: [] };
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

  // 整诗级共现
  const allCores = Array.from(coreImages);
  for (let i = 0; i < allCores.length; i++) {
    for (let j = i + 1; j < allCores.length; j++) {
      const img1 = allCores[i];
      const img2 = allCores[j];
      const key = img1 < img2 ? `${img1}-${img2}` : `${img2}-${img1}`;
      if (!cooccurrence[key]) {
        cooccurrence[key] = { img1, img2, count: 0, poems: new Set() };
      }
      cooccurrence[key].count++;
      cooccurrence[key].poems.add(poem.id);
    }
  }
}

console.log(`  完成，提取了 ${Object.keys(poemImages).length} 首诗`);
console.log(`  - 意象统计: ${Object.keys(imageStats).length}`);
console.log(`  - 句级共现: ${Object.keys(lineCooccurrence).length}`);
console.log(`  - 整诗级共现: ${Object.keys(cooccurrence).length}`);

// 3. 生成星云数据（简化版）
console.log('\n[3/4] 生成星云数据...');

// 固定种子随机数
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

const categoryGroups = {};
for (const core of CORE_IMAGES) {
  if (!categoryGroups[core.category]) {
    categoryGroups[core.category] = [];
  }
  categoryGroups[core.category].push(core);
}

const categories = Object.keys(categoryGroups);
const categoryPositions = {};
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

const nodes = [];
let nodeIndex = 0;
const MIN_COUNT_THRESHOLD = 1;

for (const core of CORE_IMAGES) {
  const stats = imageStats[core.id];
  if (!stats || stats.count < MIN_COUNT_THRESHOLD) continue;

  const catCenter = categoryPositions[core.category];
  const offsetRadius = 40 + seededRandom() * 40;
  const theta = seededRandom() * Math.PI * 2;
  const phi = Math.acos(2 * seededRandom() - 1);

  nodes.push({
    id: core.id,
    name: core.name,
    val: 8 + (stats.count / Math.max(...Object.values(imageStats).map(s => s.count))) * 52,
    color: EMOTION_COLORS[core.emotion] || '#888888',
    category: core.category,
    emotion: core.emotion,
    count: stats.count,
    poemIds: Array.from(stats.poems),
    isCore: true,
    x: catCenter.x + offsetRadius * Math.sin(phi) * Math.cos(theta),
    y: catCenter.y + offsetRadius * Math.sin(phi) * Math.sin(theta),
    z: catCenter.z + offsetRadius * Math.cos(phi),
  });
  nodeIndex++;
}

const links = [];
const linkStrength = {};
for (const key in lineCooccurrence) {
  const [img1, img2] = key.split('-');
  if (coreImageSet.has(img1) && coreImageSet.has(img2)) {
    const data = lineCooccurrence[key];
    if (!linkStrength[img1]) linkStrength[img1] = [];
    if (!linkStrength[img2]) linkStrength[img2] = [];
    linkStrength[img1].push({ target: img2, strength: data.count, lines: data.lines });
    linkStrength[img2].push({ target: img1, strength: data.count, lines: data.lines });
  }
}

const MIN_LINK_STRENGTH = 2;
for (const coreId in linkStrength) {
  const connections = linkStrength[coreId]
    .filter(c => c.strength >= MIN_LINK_STRENGTH)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);

  for (const conn of connections) {
    const linkId = [coreId, conn.target].sort().join('-');
    if (!links.find(l => [l.source, l.target].sort().join('-') === linkId)) {
      links.push({
        source: coreId,
        target: conn.target,
        strength: conn.strength,
        lines: conn.lines,
      });
    }
  }
}

console.log(`  完成`);
console.log(`  - 核心节点: ${nodes.length}`);
console.log(`  - 连线: ${links.length}`);

// 4. 生成具体意象数据
console.log('\n[4/4] 生成具体意象分组数据...');
const specificImagesData = {};

for (const poemId in poemImages) {
  const data = poemImages[poemId];
  for (const specific of data.specificImages) {
    // 查找该关键词对应的核心意象
    const coreImage = keywordToCoreMap[specific];
    if (!coreImage) continue; // 如果没有对应的核心意象，跳过

    const coreId = coreImage.id;
    if (!specificImagesData[coreId]) {
      specificImagesData[coreId] = {};
    }
    if (!specificImagesData[coreId][specific]) {
      specificImagesData[coreId][specific] = new Set();
    }
    specificImagesData[coreId][specific].add(poemId);
  }
}

const specificImagesArray = {};
for (const core in specificImagesData) {
  specificImagesArray[core] = [];
  for (const specific in specificImagesData[core]) {
    specificImagesArray[core].push({
      name: specific,
      count: specificImagesData[core][specific].size,
      poemIds: Array.from(specificImagesData[core][specific]),
    });
  }
}

console.log(`  完成，共 ${Object.keys(specificImagesArray).length} 个核心意象有细节节点`);

// 5. 转换数据：将 Set 转换为数组
console.log('\n[5/5] 转换数据格式...');

// 转换 imageStats 中的 Set 为数组
const imageStatsConverted = {};
for (const img in imageStats) {
  imageStatsConverted[img] = {
    count: imageStats[img].count,
    poems: Array.from(imageStats[img].poems),
    lines: imageStats[img].lines,
  };
}

// 转换 poemImages 中的 Set 为数组
const poemImagesConverted = {};
for (const id in poemImages) {
  poemImagesConverted[id] = poemImages[id];
}

// 转换 cooccurrence 中的 Set 为数组
const cooccurrenceConverted = {};
for (const key in cooccurrence) {
  cooccurrenceConverted[key] = {
    img1: cooccurrence[key].img1,
    img2: cooccurrence[key].img2,
    count: cooccurrence[key].count,
    poems: Array.from(cooccurrence[key].poems),
  };
}

// 转换 lineCooccurrence 中的 Set 为数组
const lineCooccurrenceConverted = {};
for (const key in lineCooccurrence) {
  lineCooccurrenceConverted[key] = {
    img1: lineCooccurrence[key].img1,
    img2: lineCooccurrence[key].img2,
    count: lineCooccurrence[key].count,
    poems: Array.from(lineCooccurrence[key].poems),
    lines: lineCooccurrence[key].lines,
  };
}

// 6. 写入JSON
const cacheData = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  summary: {
    poemsCount: poemsData.length,
    coreImagesCount: nodes.length,
    linksCount: links.length,
  },
  imageStats: imageStatsConverted,
  poemImages: poemImagesConverted,
  cooccurrence: cooccurrenceConverted,
  lineCooccurrence: lineCooccurrenceConverted,
  nebulaNodes: nodes,
  nebulaLinks: links,
  coreImagesMeta: CORE_IMAGES.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    emotion: c.emotion,
    color: EMOTION_COLORS[c.emotion] || '#888888',
  })),
  specificImagesData: specificImagesArray,
};

const outputPath = path.join(__dirname, '../src/data/cache.json');
fs.writeFileSync(outputPath, JSON.stringify(cacheData, null, 2), 'utf8');
console.log(`\n预计算完成！`);
console.log(`输出文件: ${outputPath}`);
console.log(`文件大小: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
