// 上下文排除规则
// 特定搭配中的词不算意象

// 格式: { pattern: "匹配的模式", exclude: ["排除的词"] }
// 用{word}表示关键词在模式中的位置

// 正向保留规则：当这些模式匹配时，即使满足排除条件也保留
// 格式: { pattern: "匹配的模式", keep: ["保留的词"] }
const POSITIVE_PATTERNS = [
  // 云的正向保留：白云、浮云、云嶠、云端、云海、云天等
  { pattern: '白云', keep: ['云'] },
  { pattern: '浮云', keep: ['云'] },
  { pattern: '云嶠', keep: ['云'] },
  { pattern: '云端', keep: ['云'] },
  { pattern: '云海', keep: ['云'] },
  { pattern: '云天', keep: ['云'] },
  { pattern: '云月', keep: ['云'] },
  { pattern: '云雾', keep: ['云'] },
  { pattern: '云雨', keep: ['云'] },
  { pattern: '云霞', keep: ['云'] },
  { pattern: '云开', keep: ['云'] },
  { pattern: '云收', keep: ['云'] },
  { pattern: '云散', keep: ['云'] },
  { pattern: '云飞', keep: ['云'] },
  { pattern: '云起', keep: ['云'] },
  { pattern: '云归', keep: ['云'] },
  { pattern: '云来', keep: ['云'] },
  { pattern: '云去', keep: ['云'] },
  { pattern: '孤云', keep: ['云'] },
  { pattern: '闲云', keep: ['云'] },
  { pattern: '暮云', keep: ['云'] },
  { pattern: '朝云', keep: ['云'] },
  { pattern: '秋云', keep: ['云'] },
  { pattern: '春云', keep: ['云'] },
  { pattern: '云深', keep: ['云'] },
  { pattern: '云高', keep: ['云'] },
  { pattern: '云淡', keep: ['云'] },
  { pattern: '云轻', keep: ['云'] },
  { pattern: '云薄', keep: ['云'] },
  { pattern: '云阴', keep: ['云'] },
  { pattern: '云光', keep: ['云'] },
  { pattern: '云日', keep: ['云'] },
  { pattern: '云寒', keep: ['云'] },
  { pattern: '云暖', keep: ['云'] },
  { pattern: '云凉', keep: ['云'] },
  { pattern: '云湿', keep: ['云'] },
  { pattern: '云干', keep: ['云'] },
  { pattern: '云破', keep: ['云'] },
  { pattern: '云卷', keep: ['云'] },
  { pattern: '云舒', keep: ['云'] },
  { pattern: '云展', keep: ['云'] },
  { pattern: '云横', keep: ['云'] },
  { pattern: '云复', keep: ['云'] },

  // 日的正向保留
  { pattern: '红日', keep: ['日'] },
  { pattern: '白日', keep: ['日'] },
  { pattern: '明日', keep: ['日'] },
  { pattern: '今日', keep: ['日'] },
  { pattern: '昔日', keep: ['日'] },
  { pattern: '来日', keep: ['日'] },
  { pattern: '终日', keep: ['日'] },
  { pattern: '朝日', keep: ['日'] },
  { pattern: '暮日', keep: ['日'] },
  { pattern: '晴日', keep: ['日'] },
  { pattern: '春日', keep: ['日'] },
  { pattern: '秋日', keep: ['日'] },
  { pattern: '夏日', keep: ['日'] },
  { pattern: '冬日', keep: ['日'] },
  { pattern: '日斜', keep: ['日'] },
  { pattern: '日暮', keep: ['日'] },
  { pattern: '日落', keep: ['日'] },
  { pattern: '日出', keep: ['日'] },
  { pattern: '日高', keep: ['日'] },
  { pattern: '日低', keep: ['日'] },
  { pattern: '日长', keep: ['日'] },
  { pattern: '日短', keep: ['日'] },
  { pattern: '日暖', keep: ['日'] },
  { pattern: '日寒', keep: ['日'] },
  { pattern: '日明', keep: ['日'] },
  { pattern: '日暗', keep: ['日'] },
  { pattern: '日丽', keep: ['日'] },
  { pattern: '日鲜', keep: ['日'] },

  // 风的正向保留
  { pattern: '春风', keep: ['风'] },
  { pattern: '秋风', keep: ['风'] },
  { pattern: '北风', keep: ['风'] },
  { pattern: '南风', keep: ['风'] },
  { pattern: '东风', keep: ['风'] },
  { pattern: '西风', keep: ['风'] },
  { pattern: '微风', keep: ['风'] },
  { pattern: '寒风', keep: ['风'] },
  { pattern: '暖风', keep: ['风'] },
  { pattern: '和风', keep: ['风'] },
  { pattern: '长风', keep: ['风'] },
  { pattern: '高风', keep: ['风'] },
  { pattern: '清风', keep: ['风'] },
  { pattern: '凉风', keep: ['风'] },
  { pattern: '朔风', keep: ['风'] },
  { pattern: '江风', keep: ['风'] },
  { pattern: '湖风', keep: ['风'] },
  { pattern: '山风', keep: ['风'] },
  { pattern: '林风', keep: ['风'] },
  { pattern: '松风', keep: ['风'] },
  { pattern: '竹风', keep: ['风'] },
  { pattern: '荷风', keep: ['风'] },
  { pattern: '风向', keep: ['风'] },
  { pattern: '风起', keep: ['风'] },
  { pattern: '风生', keep: ['风'] },
  { pattern: '风过', keep: ['风'] },
  { pattern: '风来', keep: ['风'] },
  { pattern: '风去', keep: ['风'] },
  { pattern: '风回', keep: ['风'] },
  { pattern: '风转', keep: ['风'] },
  { pattern: '风送', keep: ['风'] },
  { pattern: '风随', keep: ['风'] },
  { pattern: '风引', keep: ['风'] },
  { pattern: '风摇', keep: ['风'] },
  { pattern: '风拂', keep: ['风'] },
  { pattern: '风动', keep: ['风'] },
  { pattern: '风飘', keep: ['风'] },
  { pattern: '风扬', keep: ['风'] },
  { pattern: '风卷', keep: ['风'] },
  { pattern: '风散', keep: ['风'] },
  { pattern: '风清', keep: ['风'] },

  // 一的正向保留：一旦、一举、一定等是词组
  { pattern: '一旦', keep: ['一'] },
  { pattern: '一举', keep: ['一'] },
  { pattern: '一定', keep: ['一'] },
  { pattern: '一同', keep: ['一'] },
  { pattern: '一路', keep: ['一'] },
  { pattern: '一色', keep: ['一'] },
  { pattern: '一片', keep: ['一'] },
  { pattern: '一身', keep: ['一'] },
  { pattern: '一心', keep: ['一'] },
  { pattern: '一眼', keep: ['一'] },
  { pattern: '一手', keep: ['一'] },
  { pattern: '一首', keep: ['一'] },
  { pattern: '一帘', keep: ['一'] },
];

// 负向排除规则
const NEGATIVE_PATTERNS = [
  // 云（语气词）
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

  // 曰（说/叫做）
  { pattern: '{word}曰', exclude: ['曰', '云'] },
  { pattern: '{word}谓', exclude: ['谓', '云'] },
  { pattern: '之{word}', exclude: ['之', '云', '曰'] },
  { pattern: '其{word}', exclude: ['其', '云', '之', '曰'] },

  // 副词/助词
  { pattern: '犹{word}', exclude: ['犹', '且', '云'] },
  { pattern: '尚{word}', exclude: ['尚', '犹', '云'] },
  { pattern: '则{word}', exclude: ['则', '云', '曰'] },

  // 独立不成词的
  { pattern: '{word}之', exclude: ['之'] },
  { pattern: '{word}然', exclude: ['然'] },
  { pattern: '{word}而', exclude: ['而'] },
  { pattern: '{word}焉', exclude: ['焉'] },
  { pattern: '{word}哉', exclude: ['哉'] },
  { pattern: '{word}矣', exclude: ['矣'] },
  { pattern: '{word}兮', exclude: ['兮'] },

  // 特殊搭配
  { pattern: '{word}何', exclude: ['一', '云', '日', '何'] },
  { pattern: '有{word}', exclude: ['有', '云'] },
  { pattern: '无{word}', exclude: ['无', '云'] },
];

// 合并为CONTEXT_EXCLUSIONS（保持向后兼容）
export const CONTEXT_EXCLUSIONS = [
  ...POSITIVE_PATTERNS.map(p => ({ type: 'positive', ...p })),
  ...NEGATIVE_PATTERNS.map(p => ({ type: 'negative', ...p })),
];

/**
 * 获取应该被保留的词（正向匹配优先）
 * @param {string} line - 诗句
 * @returns {Set<string>} - 应保留的词集合
 */
export function getPositiveWords(line) {
  const positiveWords = new Set();
  for (const rule of POSITIVE_PATTERNS) {
    if (line.includes(rule.pattern)) {
      positiveWords.add(rule.keep);
    }
  }
  return positiveWords;
}

/**
 * 检查一个词是否在特定上下文中被排除（正向优先）
 * @param {string} word - 待检查的词
 * @param {string} line - 诗句
 * @returns {boolean} - 如果在上下文中应排除返回true
 */
export function isExcludedByContext(word, line) {
  // 先检查正向保留规则
  for (const rule of POSITIVE_PATTERNS) {
    if (line.includes(rule.pattern) && rule.keep.includes(word)) {
      return false; // 被正向规则保留，不排除
    }
  }

  // 再检查负向排除规则
  for (const rule of NEGATIVE_PATTERNS) {
    const regexPattern = rule.pattern.replace('{word}', word);
    if (line.includes(regexPattern)) {
      if (rule.exclude.includes(word)) {
        return true; // 匹配排除规则，应排除
      }
    }
  }

  return false;
}

/**
 * 从诗句中过滤掉在上下文中不应算作意象的词
 * @param {string[]} words - 提取出的词列表
 * @param {string} line - 原始诗句
 * @returns {string[]} - 过滤后的词列表
 */
export function filterWordsByContext(words, line) {
  return words.filter(word => !isExcludedByContext(word, line));
}

export default { CONTEXT_EXCLUSIONS, isExcludedByContext, filterWordsByContext, getPositiveWords };
