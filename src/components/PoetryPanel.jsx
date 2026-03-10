import { useState } from 'react';

const PoetryPanel = ({ node, poems, onClose }) => {
  const [expandedPoem, setExpandedPoem] = useState(null);

  if (!node) return null;

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
            fontSize: '24px',
            fontWeight: 'bold',
            color: node.color || '#fff',
          }}>
            {node.name}
          </h2>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '5px',
          }}>
            出现 {node.count || 0} 次 · {poems?.length || 0} 首诗
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
          poems.slice(0, 10).map((poem, index) => (
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
                      <div key={i}>{line}</div>
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
