import { useState } from 'react';
import GraphNebula from './components/GraphNebula';
import PoetryPanel from './components/PoetryPanel';
import './App.css';

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [relatedPoems, setRelatedPoems] = useState([]);
  const [relatedImages, setRelatedImages] = useState([]);
  const [lineData, setLineData] = useState(null); // 连线点击数据

  const handleNodeClick = ({ node, relatedPoems, relatedImages, currentColor }) => {
    setSelectedNode({ ...node, currentColor });
    setRelatedPoems(relatedPoems);
    setRelatedImages(relatedImages || []);
    setLineData(null); // 清除连线数据
  };

  const handleLineClick = ({ source, target, strength, lines }) => {
    setSelectedNode({ name: `${source}-${target}`, isLine: true, strength, source, target });
    setRelatedPoems(lines.map(l => ({
      id: l.poemId,
      title: l.poemTitle,
      content: [l.line],
      author: '',
      dynasty: '唐'
    })));
    setRelatedImages([]);
    setLineData({ source, target, strength, lines });
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
    setRelatedPoems([]);
    setRelatedImages([]);
    setLineData(null);
  };

  return (
    <div className="app-container">
      {/* 标题栏 */}
      <header className="app-header">
        <h1>诗词意象星云</h1>
        <p>唐诗意象的3D可视化宇宙</p>
      </header>

      {/* 3D星云 */}
      <div className="graph-container">
        <GraphNebula onNodeClick={handleNodeClick} onLineClick={handleLineClick} onClosePanel={handleClosePanel} />
      </div>

      {/* 诗歌详情面板 */}
      {selectedNode && (
        <PoetryPanel
          node={selectedNode}
          poems={relatedPoems}
          relatedImages={relatedImages}
          onClose={handleClosePanel}
        />
      )}

      {/* 操作提示 */}
      <div className="help-hint">
        点击意象节点查看详情 · 点击连线查看诗句 · 拖拽旋转 · 滚轮缩放
      </div>
    </div>
  );
}

export default App;
