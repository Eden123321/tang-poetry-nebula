import { useState } from 'react';

// 高亮诗句中的意象 - 支持多个意象各自使用自己的颜色
const highlightImages = (line, imagesWithColors, currentHighlightColor) => {
  if (!imagesWithColors || imagesWithColors.length === 0) return line;

  // 按长度降序排序，确保先匹配长词
  const sortedImages = [...imagesWithColors].sort((a, b) => b.name.length - a.name.length);

  // 构建带颜色高亮的HTML
  let finalHtml = line;
  const processed = new Set();

  for (const imgData of sortedImages) {
    const imgName = typeof imgData === 'string' ? imgData : imgData.name;
    const color = typeof imgData === 'string' ? currentHighlightColor : imgData.color;

    if (processed.has(imgName)) continue;

    const regex = new RegExp(imgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    finalHtml = finalHtml.replace(regex, (match) => {
      processed.add(imgName);
      return `<span style="color: ${color}; font-weight: bold; text-shadow: 0 0 8px ${color}80;">${match}</span>`;
    });
  }

  return <span dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};

// 将hex颜色变淡（降低透明度/亮度）
const lightenColor = (hex, factor = 0.6) => {
  // 移除#前缀
  hex = hex.replace('#', '');

  // 解析RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // 混合白色以变淡
  r = Math.round(r * factor + 255 * (1 - factor));
  g = Math.round(g * factor + 255 * (1 - factor));
  b = Math.round(b * factor + 255 * (1 - factor));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const PoetryPanel = ({ node, poems, relatedImages, onClose }) => {
  const [expandedPoem, setExpandedPoem] = useState(null);

  if (!node) return null;

  // 处理连线点击的情况
  const isLineClick = node.isLine;

  // 获取高亮颜色
  // 具体节点使用淡化颜色
  const nodeColor = node.color || node.currentColor || '#fff';
  const highlightColor = node.isDetail ? lightenColor(nodeColor, 0.5) : nodeColor;

  // 构建高亮列表：当前意象 + 相关意象（带各自颜色）
  let highlightList = [];

  if (isLineClick && node.source && node.target) {
    // 连线点击：高亮两个意象
    highlightList = [
      { name: node.source, color: nodeColor },
      { name: node.target, color: nodeColor }
    ];
  } else if (node.name) {
    // 节点点击：高亮当前意象 + 相关意象
    // 先添加当前意象
    highlightList = [{ name: node.name, color: highlightColor }];

    // 添加相关意象（如果有）
    if (relatedImages && relatedImages.length > 0) {
      for (const relImg of relatedImages) {
        // 避免重复
        if (!highlightList.find(h => h.name === relImg.name)) {
          highlightList.push({
            name: relImg.name,
            color: relImg.color || highlightColor
          });
        }
      }
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      width: '320px',
      maxHeight: '80vh',
      background: 'rgba(5, 5, 16, 0.95)',
      borderRadius: '15px',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Noto Serif SC, serif',
      color: '#fff',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: isLineClick ? '18px' : '24px',
            fontWeight: 'bold',
            color: isLineClick ? '#D4A574' : (node.color || '#fff'),
          }}>
            {node.name}
          </h2>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '5px',
          }}>
            {isLineClick
              ? `共现 ${node.strength} 次 · ${poems?.length || 0} 句`
              : `出现 ${node.count || 0} 次 · ${poems?.length || 0} 首诗`}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* 情绪标签 */}
      <div style={{
        padding: '10px 20px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          background: node.color || '#888',
          opacity: 0.8,
        }}>
          {node.emotion || '默认'}
        </span>
        {node.category && (
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            background: 'rgba(255,255,255,0.1)',
          }}>
            {node.category}
          </span>
        )}
      </div>

      {/* 诗歌列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '10px 20px 20px',
      }}>
        {poems && poems.length > 0 ? (
          poems.map((poem, index) => (
            <div
              key={poem.id || index}
              style={{
                background: expandedPoem === poem.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                marginBottom: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid transparent',
              }}
              onClick={() => setExpandedPoem(expandedPoem === poem.id ? null : poem.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = expandedPoem === poem.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{
                padding: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  {poem.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  {poem.author} · {poem.dynasty}
                </div>

                {/* 展开显示诗句 */}
                {expandedPoem === poem.id && poem.content && (
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '13px',
                    lineHeight: '1.8',
                    color: 'rgba(255,255,255,0.85)',
                  }}>
                    {poem.content.map((line, i) => (
                      <div key={i}>{highlightImages(line, highlightList, highlightColor)}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255,255,255,0.4)',
          }}>
            暂无相关诗歌
          </div>
        )}

        {poems && poems.length > 10 && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
          }}>
            还有 {poems.length - 10} 首诗歌...
          </div>
        )}
      </div>
    </div>
  );
};

export default PoetryPanel;
