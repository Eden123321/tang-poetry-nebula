import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import poems from '../data/poems.json';
import { calculateCooccurrence, extractImages, getRelatedPoems } from '../utils/imageExtractor';
import { generateNebulaData } from '../utils/nebulaGenerator';
import { CORE_IMAGES } from '../data/coreImages';

const GraphNebula = ({ onNodeClick }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const selectedNodeRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [expandedCore, setExpandedCore] = useState(null);
  const detailNodesRef = useRef([]);
  const detailLinksRef = useRef([]);

  // 提取具体意象数据
  const specificImagesData = useMemo(() => {
    const data = {};
    const extractedData = {};

    for (const poem of poems) {
      const result = extractImages(poem);
      extractedData[poem.id] = result;

      // 按核心意象分组具体意象
      for (const specificImage of result.specificImages) {
        for (const coreImage of result.coreImages) {
          if (!data[coreImage]) {
            data[coreImage] = {};
          }
          if (!data[coreImage][specificImage]) {
            data[coreImage][specificImage] = new Set();
          }
          data[coreImage][specificImage].add(poem.id);
        }
      }
    }

    // 转换为对象
    const result = {};
    for (const core in data) {
      result[core] = [];
      for (const specific in data[core]) {
        result[core].push({
          name: specific,
          count: data[core][specific].size,
          poemIds: Array.from(data[core][specific]),
        });
      }
    }

    return result;
  }, []);

  // 准备主数据
  const { graphData, metadata, processedData } = useMemo(() => {
    const extractedData = {};
    for (const poem of poems) {
      const result = extractImages(poem);
      extractedData[poem.id] = result;
    }

    const cooccurrenceData = calculateCooccurrence(poems);
    const nebulaData = generateNebulaData(cooccurrenceData);

    return {
      graphData: {
        nodes: nebulaData.nodes,
        links: nebulaData.links,
      },
      metadata: nebulaData.metadata,
      processedData: {
        ...nebulaData,
        extractedData,
        cooccurrenceData,
      },
    };
  }, []);

  // 展开/收起细节层
  const toggleDetailLayer = useCallback((coreNode) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 如果已经展开，先收起
    if (detailNodesRef.current.length > 0) {
      detailNodesRef.current.forEach(mesh => scene.remove(mesh));
      detailLinksRef.current.forEach(line => scene.remove(line));
      detailNodesRef.current = [];
      detailLinksRef.current = [];

      if (expandedCore === coreNode.userData.id) {
        setExpandedCore(null);
        return;
      }
    }

    // 获取该核心意象的具体意象
    const coreId = coreNode.userData.id;
    const specifics = specificImagesData[coreId];
    if (!specifics || specifics.length === 0) return;

    // 在核心节点周围创建细节节点
    const parentPos = coreNode.position;
    const detailNodes = [];
    const count = Math.min(specifics.length, 10); // 最多显示10个

    const baseColor = coreNode.userData.color;

    for (let i = 0; i < count; i++) {
      const specific = specifics[i];
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 40 + Math.random() * 20;

      const x = parentPos.x + radius * Math.sin(phi) * Math.cos(theta);
      const y = parentPos.y + radius * Math.sin(phi) * Math.sin(theta);
      const z = parentPos.z + radius * Math.cos(phi);

      const geometry = new THREE.SphereGeometry(3, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = {
        name: specific.name,
        count: specific.count,
        isDetail: true,
        parentCore: coreId,
      };

      scene.add(mesh);
      detailNodes.push(mesh);

      // 创建到核心节点的连线
      const points = [parentPos.clone(), new THREE.Vector3(x, y, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.4,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      detailLinksRef.current.push(line);
    }

    detailNodesRef.current = detailNodes;
    setExpandedCore(coreId);
  }, [expandedCore, specificImagesData]);

  // 初始化Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.0008);
    sceneRef.current = scene;

    // 2. 创建相机
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
    camera.position.set(0, 0, 500);
    cameraRef.current = camera;

    // 3. 创建渲染器
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. 添加轨道控制器
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;

    // 修改鼠标按键配置
    // 左键(0)：点击选择（禁用旋转）
    // 中键(1)：旋转 + 缩放
    // 右键(2)：平移（保持不变）
    controls.mouseButtons = {
      LEFT: null, // 左键留给点击
      MIDDLE: THREE.MOUSE.ROTATE, // 中键旋转
      RIGHT: THREE.MOUSE.PAN // 右键平移
    };

    // 中键缩放
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;

    // 启用中键的旋转功能（默认中键是缩放）
    controls.enableRotate = true;
    controls.rotateSpeed = 0.5;

    controlsRef.current = controls;

    // 5. 添加光照 - 多个光源增强3D效果
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // 主光源 - 产生高光
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(100, 100, 100);
    scene.add(mainLight);

    // 补光 - 从另一个方向照亮
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-100, -50, -100);
    scene.add(fillLight);

    // 背光 - 增强轮廓
    const backLight = new THREE.DirectionalLight(0xff8888, 0.3);
    backLight.position.set(0, -100, -100);
    scene.add(backLight);

    // 6. 创建节点 - 使用Sprite实现发光星体效果
    const nodes = [];

    // 创建更好的发光纹理 - 多层渐变，更像星云
    const createStarTexture = (color, size = 128) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const center = size / 2;

      // 清空
      ctx.clearRect(0, 0, size, size);

      // 外层大光晕 - 极淡
      const outerGlow = ctx.createRadialGradient(center, center, 0, center, center, center);
      outerGlow.addColorStop(0, color + '15');
      outerGlow.addColorStop(0.5, color + '08');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, size, size);

      // 中层光晕
      const midGlow = ctx.createRadialGradient(center, center, 0, center, center, center * 0.7);
      midGlow.addColorStop(0, color + '40');
      midGlow.addColorStop(0.4, color + '20');
      midGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = midGlow;
      ctx.fillRect(0, 0, size, size);

      // 内层亮光
      const innerGlow = ctx.createRadialGradient(center, center, 0, center, center, center * 0.4);
      innerGlow.addColorStop(0, color + 'CC');
      innerGlow.addColorStop(0.3, color + '80');
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.fillRect(0, 0, size, size);

      // 中心最亮一点
      const coreGlow = ctx.createRadialGradient(center, center, 0, center, center, center * 0.15);
      coreGlow.addColorStop(0, '#ffffff');
      coreGlow.addColorStop(0.5, color + 'FF');
      coreGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    };

    graphData.nodes.forEach((nodeData) => {
      const group = new THREE.Group();

      // 纯发光星体 - 只有光晕效果
      const glowMaterial = new THREE.SpriteMaterial({
        map: createStarTexture(nodeData.color, 128),
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Sprite(glowMaterial);
      // 根据节点值调整光晕大小，最小12，最大80
      const glowSize = 12 + (nodeData.val / 60) * 68;
      glow.scale.set(glowSize, glowSize, 1);
      group.add(glow);

      // 添加一个不可见的球体用于点击检测
      const hitGeometry = new THREE.SphereGeometry(nodeData.val * 0.8, 8, 8);
      const hitMaterial = new THREE.MeshBasicMaterial({
        visible: false,
      });
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
      group.add(hitMesh);

      // 设置位置
      group.position.set(nodeData.x, nodeData.y, nodeData.z);
      group.userData = { ...nodeData };
      group.isNodeGroup = true;

      scene.add(group);
      nodes.push(group);
    });
    nodesRef.current = nodes;

    // 7. 创建连线 - 简单的直线，更干净
    const links = [];
    const linkMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    });

    graphData.links.forEach((linkData) => {
      const sourceNode = nodes.find(n => n.userData.id === linkData.source);
      const targetNode = nodes.find(n => n.userData.id === linkData.target);

      if (sourceNode && targetNode) {
        const points = [
          sourceNode.position.clone(),
          targetNode.position.clone(),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, linkMaterial);
        line.userData = { source: linkData.source, target: linkData.target };
        scene.add(line);
        links.push(line);
      }
    });
    linksRef.current = links;

    // 8. 添加背景星星
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 5000;
      starPositions[i + 1] = (Math.random() - 0.5) * 5000;
      starPositions[i + 2] = (Math.random() - 0.5) * 5000;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 9. 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 10. 窗口大小调整
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [graphData]);

  // 处理鼠标移动（悬停检测）
  const handleMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const nodes = [...nodesRef.current, ...detailNodesRef.current];

    if (!canvas || !camera || nodes.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);

    // 获取所有mesh用于检测
    const allMeshes = [];
    nodes.forEach(group => {
      group.traverse(child => {
        if (child.isMesh) {
          child.parentNode = group;
          allMeshes.push(child);
        }
      });
    });
    const intersects = raycasterRef.current.intersectObjects(allMeshes);
    const hoveredGroup = intersects.length > 0 ? intersects[0].object.parentNode : null;

    if (hoveredGroup) {
      if (hoveredNode !== hoveredGroup) {
        setHoveredNode(hoveredGroup);
        canvas.style.cursor = 'pointer';
      }
    } else {
      if (hoveredNode) {
        setHoveredNode(null);
        canvas.style.cursor = 'grab';
      }
    }
  }, [hoveredNode]);

  // 处理鼠标点击
  const handleClick = useCallback((event) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const nodes = [...nodesRef.current, ...detailNodesRef.current];

    if (!canvas || !camera || nodes.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);

    // 获取所有mesh用于检测
    const allMeshes = [];
    nodes.forEach(group => {
      group.traverse(child => {
        if (child.isMesh) {
          child.parentNode = group;
          allMeshes.push(child);
        }
      });
    });
    const intersects = raycasterRef.current.intersectObjects(allMeshes);
    const clickedGroup = intersects.length > 0 ? intersects[0].object.parentNode : null;

    if (clickedGroup) {
      const clickedNode = clickedGroup;
      console.log('点击了节点:', clickedNode.userData);

      // 恢复之前选中的节点颜色
      if (selectedNodeRef.current) {
        const coreMesh = selectedNodeRef.current.children.find(c => c.isMesh && c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius < 10);
        if (coreMesh) {
          coreMesh.material.color.setStyle(selectedNodeRef.current.userData.color);
        }
      }

      // 高亮选中的节点 - 只高亮核心mesh
      const newCoreMesh = clickedGroup.children.find(c => c.isMesh && c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius < 10);
      if (newCoreMesh) {
        newCoreMesh.material.color.setHex(0xffffff);
      }
      selectedNodeRef.current = clickedGroup;

      // 如果点击的是核心节点，展开细节层
      if (clickedNode.userData.isCore) {
        toggleDetailLayer(clickedGroup);
      }

      // 获取相关诗歌
      if (processedData && processedData.cooccurrenceData) {
        const { cooccurrenceData } = processedData;

        const relatedPoems = getRelatedPoems(
          clickedNode.userData.id,
          cooccurrenceData.imageStats,
          cooccurrenceData.poemImages
        );

        if (onNodeClick) {
          onNodeClick({
            node: clickedNode.userData,
            relatedPoems: relatedPoems.map(p => p.poem),
          });
        }
      }
    }
  }, [onNodeClick, processedData, toggleDetailLayer]);

  // 绑定事件
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleClick, handleMouseMove]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
      />

      {/* 悬停提示 */}
      {hoveredNode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(5, 5, 16, 0.9)',
          padding: '10px 20px',
          borderRadius: '20px',
          border: `1px solid ${hoveredNode.userData.color || '#fff'}`,
          fontFamily: 'Noto Serif SC, serif',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {hoveredNode.userData.name}
          {hoveredNode.userData.count && (
            <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '8px', opacity: 0.7 }}>
              ({hoveredNode.userData.count}次)
            </span>
          )}
        </div>
      )}

      {/* 情绪图例 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(5, 5, 16, 0.8)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontFamily: 'Noto Serif SC, serif',
        color: '#fff',
        fontSize: '12px',
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>情绪颜色</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4A90D9' }}></span>
            思乡
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#D4A574' }}></span>
            离别
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9B59B6' }}></span>
            秋思
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E74C3C' }}></span>
            豪放
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1ABC9C' }}></span>
            清雅
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      {metadata && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'rgba(5, 5, 16, 0.8)',
          padding: '10px 15px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'Noto Serif SC, serif',
          color: '#fff',
          fontSize: '12px',
        }}>
          <div>核心意象: {metadata.totalNodes}</div>
          <div>意象连线: {metadata.totalLinks}</div>
        </div>
      )}

      {/* 操作提示 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Noto Sans SC, sans-serif',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
        background: 'rgba(5,5,16,0.6)',
        padding: '8px 16px',
        borderRadius: '20px',
      }}>
        点击节点查看详情 · 点击核心节点展开细节
      </div>
    </>
  );
};

export default GraphNebula;
