// 上下文排除规则
// 特定搭配中的词不算意象

// 格式: { pattern: "匹配的模式", exclude: ["排除的词"] }
// 用{word}表示关键词在模式中的位置

export const CONTEXT_EXCLUSIONS = [
  // 云（语气词）- "虽云"、"乃云"等
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
  { pattern: '谁{word}', exclude: ['云', '曰', '其', '何'] },

  // 曰（说/叫做）
  { pattern: '{word}曰', exclude: ['曰', '云'] },
  { pattern: '{word}谓', exclude: ['谓', '云'] },
  { pattern: '之{word}', exclude: ['之', '云', '曰'] },
  { pattern: '其{word}', exclude: ['其', '云', '之', '曰'] },

  // 副词/助词
  { pattern: '犹{word}', exclude: ['犹', '且', '云'] },
  { pattern: '尚{word}', exclude: ['尚', '犹', '云'] },
  { pattern: '则{word}', exclude: ['则', '云', '曰'] },
  { pattern: '犹{word}', exclude: ['犹', '且'] },
  { pattern: '尚{word}', exclude: ['尚', '犹'] },

  // 独立不成词的
  { pattern: '{word}之', exclude: ['之'] },
  { pattern: '{word}然', exclude: ['然'] },
  { pattern: '{word}而', exclude: ['而'] },
  { pattern: '{word}焉', exclude: ['焉'] },
  { pattern: '{word}哉', exclude: ['哉'] },
  { pattern: '{word}矣', exclude: ['矣'] },
  { pattern: '{word}兮', exclude: ['兮'] },

  // 特殊搭配
  { pattern: '一{word}', exclude: ['一', '何'] },
  { pattern: '{word}何', exclude: ['一', '云', '日', '何'] },
  { pattern: '有{word}', exclude: ['有', '云'] },
  { pattern: '无{word}', exclude: ['无', '云'] },
];

/**
 * 检查一个词是否在特定上下文中被排除
 * @param {string} word - 待检查的词
 * @param {string} line - 诗句
 * @returns {boolean} - 如果在上下文中应排除返回true
 */
export function isExcludedByContext(word, line) {
  for (const rule of CONTEXT_EXCLUSIONS) {
    // 构建实际的匹配模式
    const regexPattern = rule.pattern.replace('{word}', word);
    if (line.includes(regexPattern)) {
      // 如果这个词在排除列表中，则返回true
      if (rule.exclude.includes(word)) {
        return true;
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

export default { CONTEXT_EXCLUSIONS, isExcludedByContext, filterWordsByContext };
