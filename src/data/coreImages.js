// 50个核心意象定义
// 按PRD分类设计

export const CORE_IMAGES = [
  // 天象 (6个)
  { id: '月', name: '月', category: '天象', emotion: '思乡' },
  { id: '日', name: '日', category: '天象', emotion: '豪放' },
  { id: '星', name: '星', category: '天象', emotion: '清雅' },
  { id: '云', name: '云', category: '天象', emotion: '清雅' },
  { id: '风', name: '风', category: '天象', emotion: '离别' },
  { id: '雨', name: '雨', category: '天象', emotion: '秋思' },

  // 山水 (7个)
  { id: '山', name: '山', category: '山水', emotion: '豪放' },
  { id: '江', name: '江', category: '山水', emotion: '思乡' },
  { id: '水', name: '水', category: '山水', emotion: '清雅' },
  { id: '湖', name: '湖', category: '山水', emotion: '清雅' },
  { id: '泉', name: '泉', category: '山水', emotion: '清雅' },
  { id: '海', name: '海', category: '山水', emotion: '豪放' },
  { id: '河', name: '河', category: '山水', emotion: '思乡' },

  // 植物 (9个)
  { id: '柳', name: '柳', category: '植物', emotion: '离别' },
  { id: '松', name: '松', category: '植物', emotion: '清雅' },
  { id: '梅', name: '梅', category: '植物', emotion: '清雅' },
  { id: '竹', name: '竹', category: '植物', emotion: '清雅' },
  { id: '花', name: '花', category: '植物', emotion: '清雅' },
  { id: '草', name: '草', category: '植物', emotion: '思乡' },
  { id: '桃', name: '桃', category: '植物', emotion: '清雅' },
  { id: '桂', name: '桂', category: '植物', emotion: '清雅' },
  { id: '菊', name: '菊', category: '植物', emotion: '清雅' },

  // 动物 (7个)
  { id: '雁', name: '雁', category: '动物', emotion: '思乡' },
  { id: '鸟', name: '鸟', category: '动物', emotion: '清雅' },
  { id: '鹤', name: '鹤', category: '动物', emotion: '清雅' },
  { id: '蝉', name: '蝉', category: '动物', emotion: '秋思' },
  { id: '猿', name: '猿', category: '动物', emotion: '秋思' },
  { id: '鱼', name: '鱼', category: '动物', emotion: '清雅' },
  { id: '蝶', name: '蝶', category: '动物', emotion: '清雅' },

  // 行旅 (7个)
  { id: '舟', name: '舟', category: '行旅', emotion: '思乡' },
  { id: '马', name: '马', category: '行旅', emotion: '豪放' },
  { id: '桥', name: '桥', category: '行旅', emotion: '离别' },
  { id: '路', name: '路', category: '行旅', emotion: '离别' },
  { id: '帆', name: '帆', category: '行旅', emotion: '思乡' },
  { id: '船', name: '船', category: '行旅', emotion: '思乡' },
  { id: '驿', name: '驿', category: '行旅', emotion: '离别' },

  // 情境 (14个)
  { id: '酒', name: '酒', category: '情境', emotion: '豪放' },
  { id: '灯', name: '灯', category: '情境', emotion: '思乡' },
  { id: '梦', name: '梦', category: '情境', emotion: '思乡' },
  { id: '愁', name: '愁', category: '情境', emotion: '秋思' },
  { id: '思', name: '思', category: '情境', emotion: '思乡' },
  { id: '别', name: '别', category: '情境', emotion: '离别' },
  { id: '归', name: '归', category: '情境', emotion: '思乡' },
  { id: '恨', name: '恨', category: '情境', emotion: '秋思' },
  { id: '泪', name: '泪', category: '情境', emotion: '离别' },
  { id: '心', name: '心', category: '情境', emotion: '思乡' },
  { id: '情', name: '情', category: '情境', emotion: '离别' },
  { id: '忆', name: '忆', category: '情境', emotion: '思乡' },
  { id: '恨', name: '恨', category: '情境', emotion: '秋思' },
  { id: '伤', name: '伤', category: '情境', emotion: '秋思' },

  // 建筑 (4个)
  { id: '楼', name: '楼', category: '建筑', emotion: '思乡' },
  { id: '亭', name: '亭', category: '建筑', emotion: '离别' },
  { id: '寺', name: '寺', category: '建筑', emotion: '清雅' },
  { id: '关', name: '关', category: '建筑', emotion: '离别' },
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
