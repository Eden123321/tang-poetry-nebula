// 核心意象定义
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

  // 天象扩展 (7个)
  { id: '霜', name: '霜', category: '天象', emotion: '秋思' },
  { id: '雪', name: '雪', category: '天象', emotion: '清雅' },
  { id: '雾', name: '雾', category: '天象', emotion: '清雅' },
  { id: '雷', name: '雷', category: '天象', emotion: '豪放' },
  { id: '霞', name: '霞', category: '天象', emotion: '清雅' },
  { id: '银河', name: '银河', category: '天象', emotion: '思乡' },
  { id: '夕阳', name: '夕阳', category: '天象', emotion: '离别' },

  // 山水扩展 (7个)
  { id: '溪', name: '溪', category: '山水', emotion: '清雅' },
  { id: '潭', name: '潭', category: '山水', emotion: '清雅' },
  { id: '瀑布', name: '瀑布', category: '山水', emotion: '豪放' },
  { id: '岛', name: '岛', category: '山水', emotion: '思乡' },
  { id: '沙漠', name: '沙漠', category: '山水', emotion: '豪放' },
  { id: '平原', name: '平原', category: '山水', emotion: '清雅' },
  { id: '峡谷', name: '峡谷', category: '山水', emotion: '豪放' },

  // 植物扩展 (6个)
  { id: '梧桐', name: '梧桐', category: '植物', emotion: '秋思' },
  { id: '芭蕉', name: '芭蕉', category: '植物', emotion: '秋思' },
  { id: '芦苇', name: '芦苇', category: '植物', emotion: '清雅' },
  { id: '红豆', name: '红豆', category: '植物', emotion: '思乡' },
  { id: '莲', name: '莲', category: '植物', emotion: '清雅' },
  { id: '荷', name: '荷', category: '植物', emotion: '清雅' },

  // 动物扩展 (6个)
  { id: '鸦', name: '鸦', category: '动物', emotion: '秋思' },
  { id: '鹊', name: '鹊', category: '动物', emotion: '清雅' },
  { id: '莺', name: '莺', category: '动物', emotion: '清雅' },
  { id: '杜鹃', name: '杜鹃', category: '动物', emotion: '秋思' },
  { id: '鹦鹉', name: '鹦鹉', category: '动物', emotion: '清雅' },
  { id: '萤火虫', name: '萤', category: '动物', emotion: '清雅' },

  // 行旅扩展 (4个)
  { id: '长亭', name: '长亭', category: '行旅', emotion: '离别' },
  { id: '津渡', name: '津渡', category: '行旅', emotion: '离别' },
  { id: '歧路', name: '歧路', category: '行旅', emotion: '离别' },
  { id: '荒径', name: '荒径', category: '行旅', emotion: '秋思' },

  // 情境扩展 (6个)
  { id: '醉', name: '醉', category: '情境', emotion: '豪放' },
  { id: '醒', name: '醒', category: '情境', emotion: '秋思' },
  { id: '眠', name: '眠', category: '情境', emotion: '思乡' },
  { id: '怨', name: '怨', category: '情境', emotion: '秋思' },
  { id: '吟', name: '吟', category: '情境', emotion: '清雅' },
  { id: '啸', name: '啸', category: '情境', emotion: '豪放' },

  // 建筑扩展 (5个)
  { id: '城', name: '城', category: '建筑', emotion: '离别' },
  { id: '墙', name: '墙', category: '建筑', emotion: '思乡' },
  { id: '塔', name: '塔', category: '建筑', emotion: '清雅' },
  { id: '钟', name: '钟', category: '建筑', emotion: '清雅' },
  { id: '楼台', name: '楼台', category: '建筑', emotion: '思乡' },
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
