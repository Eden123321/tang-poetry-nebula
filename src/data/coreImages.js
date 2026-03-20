// 核心意象定义（简体）
// 按语义分类设计 - 2026-03-20 更新

export const CORE_IMAGES = [
  // ===== 天象/气象类（16个）=====
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

  // ===== 山水地理类（18个）=====
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

  // ===== 植物类（16个）=====
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

  // ===== 动物类（14个）=====
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

  // ===== 人文/建筑类（14个）=====
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

  // ===== 器物/日常类（12个）=====
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

  // ===== 人物/行为类（10个）=====
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

// 情绪颜色映射
export const EMOTION_COLORS = {
  '思乡': '#4A90D9',  // 蓝色
  '离别': '#D4A574',  // 金色
  '秋思': '#9B59B6',  // 紫色
  '豪放': '#E74C3C',  // 红色
  '清雅': '#1ABC9C',  // 青色
};

// 获取意象的情绪颜色
export function getEmotionColor(emotion) {
  return EMOTION_COLORS[emotion] || '#888888';
}

export default CORE_IMAGES;
