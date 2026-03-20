import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import poems from '../data/poems.json';
import { calculateCooccurrence, extractImages, getRelatedPoems } from '../utils/imageExtractor';
import { IMAGE_DICTIONARY } from '../data/imageDictionary';
import { generateNebulaData } from '../utils/nebulaGenerator';
import { CORE_IMAGES, getEmotionColor } from '../data/coreImages';

// 固定种子随机数生成器
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

const GraphNebula = ({ onNodeClick, onLineClick }) => {
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
  const nebulaCloudsRef = useRef([]);

  // 提取具体意象数据
  const specificImagesData = useMemo(() => {
    const data = {};

    for (const poem of poems) {
      const result = extractImages(poem);

      // 按核心意象分组具体意象 - 需要正确建立映射关系
      // 从 IMAGE_DICTIONARY 获取每个具体意象对应的核心意象
      for (const specificImage of result.specificImages) {
        // 使用 IMAGE_DICTIONARY 获取正确的核心意象映射
        const coreImage = IMAGE_DICTIONARY[specificImage];
        if (!coreImage) continue;

        if (!data[coreImage]) {
          data[coreImage] = {};
        }
        if (!data[coreImage][specificImage]) {
          data[coreImage][specificImage] = new Set();
        }
        data[coreImage][specificImage].add(poem.id);
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

  // 展开/收起细节层 - 切换激活状态
  const toggleDetailLayer = useCallback((coreNode) => {
    const coreId = coreNode.userData.id;

    // 如果已经展开的是同一个，收起（恢复低亮度+隐藏连线）
    if (expandedCore === coreId) {
      detailNodesRef.current
        .filter(node => node.userData.parentCore === coreId)
        .forEach(group => {
          // detailNodes 现在是 Group，需要找到 Sprite
          const sprite = group.children.find(c => c.isSprite);
          if (sprite && sprite.material) {
            sprite.material.opacity = group.userData.originalOpacity || 0.3;
          }
        });
      detailLinksRef.current
        .filter(line => line.userData?.parentCore === coreId)
        .forEach(line => {
          line.visible = false; // 隐藏连线
        });
      setExpandedCore(null);
      return;
    }

    // 如果已经有展开的，先恢复之前的
    if (expandedCore) {
      detailNodesRef.current
        .filter(node => node.userData.parentCore === expandedCore)
        .forEach(group => {
          const sprite = group.children.find(c => c.isSprite);
          if (sprite && sprite.material) {
            sprite.material.opacity = group.userData.originalOpacity || 0.3;
          }
        });
      detailLinksRef.current
        .filter(line => line.userData?.parentCore === expandedCore)
        .forEach(line => {
          line.visible = false;
        });
    }

    // 激活当前核心节点的细节节点（高亮发光+显示连线）
    detailNodesRef.current
      .filter(node => node.userData.parentCore === coreId)
      .forEach(group => {
        // detailNodes 现在是 Group，需要找到 Sprite
        const sprite = group.children.find(c => c.isSprite);
        if (sprite && sprite.material) {
          sprite.material.opacity = 0.8; // 高亮发光
        }
      });
    detailLinksRef.current
      .filter(line => line.userData?.parentCore === coreId)
      .forEach(line => {
        line.visible = true; // 显示连线
      });

    setExpandedCore(coreId);
  }, [expandedCore]);

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
    controls.zoomToCursor = true; // 朝着鼠标位置缩放

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
      glow.renderOrder = 1; // 确保渲染在连线上方
      group.add(glow);

      // 添加一个不可见的球体用于点击检测
      const hitGeometry = new THREE.SphereGeometry(5, 8, 8);
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

    // 7. 为每个核心节点创建细节节点（小星星，初始淡色）
    const detailNodes = [];
    const detailLinks = [];

    nodes.forEach(coreNode => {
      const coreId = coreNode.userData.id;
      const specifics = specificImagesData[coreId];
      if (!specifics || specifics.length === 0) return;

      const parentPos = coreNode.position;
      const baseColor = coreNode.userData.color;
      const count = Math.min(specifics.length, 10);

      for (let i = 0; i < count; i++) {
        const specific = specifics[i];
        const theta = (i / count) * Math.PI * 2;
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const radius = 15;

        const x = parentPos.x + radius * Math.sin(phi) * Math.cos(theta);
        const y = parentPos.y + radius * Math.sin(phi) * Math.sin(theta);
        const z = parentPos.z + radius * Math.cos(phi);

        // 小星星节点 - 与核心节点一样的发光效果，但更小更暗
        const detailTexture = createStarTexture(baseColor, 64);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: detailTexture,
          color: 0xffffff,
          transparent: true,
          opacity: 0.3, // 初始更暗
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(15, 15, 1);
        sprite.position.set(x, y, z);
        sprite.renderOrder = 1; // 确保渲染在连线上方
        sprite.userData = {
          id: specific.name,
          name: specific.name,
          count: specific.count,
          poemIds: specific.poemIds || [],
          isDetail: true,
          isCore: false,
          parentCore: coreId,
          color: baseColor, // 添加color字段用于面板显示
          baseColor: baseColor,
          originalOpacity: 0.3,
        };
        sprite.visible = true;
        scene.add(sprite);

        // 创建不可见的检测区域 Mesh - 缩小检测范围
        const hitGeometry = new THREE.SphereGeometry(8, 8, 8);
        const hitMaterial = new THREE.MeshBasicMaterial({
          visible: false, // 不可见但可检测
        });
        const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
        hitMesh.position.copy(sprite.position);
        hitMesh.userData = sprite.userData; // 共享 userData
        scene.add(hitMesh);

        // 将 sprite 和 hitMesh 存储在一起
        const detailGroup = new THREE.Group();
        detailGroup.add(sprite);
        detailGroup.add(hitMesh);
        detailGroup.userData = sprite.userData;
        scene.add(detailGroup);
        detailNodes.push(detailGroup);

        // 连线 - 初始隐藏
        const points = [parentPos.clone(), new THREE.Vector3(x, y, z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.2,
          depthWrite: false, // 避免深度冲突导致变黑
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.userData = { parentCore: coreId };
        line.visible = false; // 初始隐藏
        scene.add(line);
        detailLinks.push(line);
      }
    });

    detailNodesRef.current = detailNodes;
    detailLinksRef.current = detailLinks;

    // 8. 创建连线 - 曲线表示，粗细由透明度体现
    const links = [];
    const linksData = []; // 存储连线数据用于交互

    // 计算最大强度用于归一化
    const maxStrength = Math.max(...graphData.links.map(l => l.strength), 1);

    graphData.links.forEach((linkData) => {
      const sourceNode = nodes.find(n => n.userData.id === linkData.source);
      const targetNode = nodes.find(n => n.userData.id === linkData.target);

      if (sourceNode && targetNode) {
        const start = sourceNode.position.clone();
        const end = targetNode.position.clone();

        // 计算中点，并添加偏移创建曲线效果
        const mid = start.clone().add(end).multiplyScalar(0.5);
        // 随机或基于类别差异添加偏移
        const offsetDir = new THREE.Vector3(
          (seededRandom() - 0.5) * 30,
          (seededRandom() - 0.5) * 30,
          (seededRandom() - 0.5) * 30
        );
        mid.add(offsetDir);

        // 创建二次贝塞尔曲线
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // 透明度固定0.07
        const opacity = 0.07;

        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: opacity,
          depthWrite: false, // 避免深度冲突导致变黑
        });

        const line = new THREE.Line(geometry, lineMaterial);
        line.userData = {
          source: linkData.source,
          target: linkData.target,
          strength: linkData.strength,
          lines: linkData.lines || [], // 诗句数据
        };
        scene.add(line);
        links.push(line);
        linksData.push(line.userData);
      }
    });
    linksRef.current = links;

    // 8. 添加情绪星云雾层 - 按情绪颜色分组，动态云团效果
    const emotionCenters = {};
    nodes.forEach(node => {
      const emotion = node.userData.emotion || '默认';
      if (!emotionCenters[emotion]) {
        emotionCenters[emotion] = { x: 0, y: 0, z: 0, count: 0 };
      }
      emotionCenters[emotion].x += node.position.x;
      emotionCenters[emotion].y += node.position.y;
      emotionCenters[emotion].z += node.position.z;
      emotionCenters[emotion].count++;
    });

    // 情绪颜色映射
    const emotionColors = {
      '思乡': new THREE.Color(0x3498DB),
      '离别': new THREE.Color(0xF1C40F),
      '秋思': new THREE.Color(0x9B59B6),
      '豪放': new THREE.Color(0xE74C3C),
      '清雅': new THREE.Color(0x1ABC9C),
    };

    // 存储所有星云用于动画
    const nebulaClouds = [];

    // 创建柔和的雾状纹理
    const createFogTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const center = 64;

      const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);

      return new THREE.CanvasTexture(canvas);
    };

    const fogTexture = createFogTexture();

    for (const emotion in emotionCenters) {
      const center = emotionCenters[emotion];
      center.x /= center.count;
      center.y /= center.count;
      center.z /= center.count;

      // 用 Sprite 创建雾团 - 减少数量，缩小范围，减少颜色混杂
      const cloudGroup = new THREE.Group();
      const spriteCount = 12;

      for (let i = 0; i < spriteCount; i++) {
        // 在情绪中心附近大范围分布
        const x = center.x + (seededRandom() - 0.5) * 250;
        const y = center.y + (seededRandom() - 0.5) * 180;
        const z = center.z + (seededRandom() - 0.5) * 250;

        const spriteMaterial = new THREE.SpriteMaterial({
          map: fogTexture,
          color: emotionColors[emotion] || 0xffffff,
          transparent: true,
          opacity: 0.12,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        // 保存原始位置用于动画
        sprite.userData.origX = x;
        sprite.userData.origY = y;
        sprite.userData.origZ = z;

        // 随机大小，形成自然片状
        const scale = 80 + seededRandom() * 120;
        sprite.scale.set(scale, scale, 1);

        cloudGroup.add(sprite);
      }

      scene.add(cloudGroup);
      nebulaClouds.push(cloudGroup);
    }

    // 保存星云引用用于动画
    nebulaCloudsRef.current = nebulaClouds;

    // 9. 添加背景星星
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (seededRandom() - 0.5) * 5000;
      starPositions[i + 1] = (seededRandom() - 0.5) * 5000;
      starPositions[i + 2] = (seededRandom() - 0.5) * 5000;
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
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // 整体缓慢旋转雾层
      nebulaCloudsRef.current.forEach((cloudGroup, groupIdx) => {
        // 缓慢旋转
        cloudGroup.rotation.x = time * 0.05 * (groupIdx % 2 === 0 ? 1 : -1);
        cloudGroup.rotation.y = time * 0.08;

        // 整体轻微缩放
        const scale = 1 + Math.sin(time + groupIdx) * 0.05;
        cloudGroup.scale.set(scale, scale, scale);
      });

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
    nodes.forEach(node => {
      // 处理核心节点（Group）
      if (node.traverse) {
        // 检查是否是细节节点组（包含 invisible mesh）
        if (node.userData && node.userData.isDetail) {
          // 细节节点组，找到不可见的检测Mesh
          node.traverse(child => {
            if (child.isMesh && child.material.visible === false) {
              child.parentNode = node;
              allMeshes.push(child);
            }
          });
        } else {
          // 核心节点
          node.traverse(child => {
            if (child.isMesh) {
              child.parentNode = node;
              allMeshes.push(child);
            }
          });
        }
      }
      // 处理细节节点（直接是Sprite）- 备用
      else if (node.isSprite) {
        node.parentNode = node;
        allMeshes.push(node);
      }
    });

    const intersects = raycasterRef.current.intersectObjects(allMeshes);
    let hoveredGroup = null;
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      // 如果是 Sprite（没有 traverse 方法），直接使用自身
      if (hit.isSprite) {
        hoveredGroup = hit;
      } else {
        hoveredGroup = hit.parentNode;
      }
    }

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
    const links = linksRef.current || [];

    if (!canvas || !camera) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);

    // 先检测节点点击（优先）
    if (nodes.length > 0) {
      // 获取所有可检测对象
      const allObjects = [];
      nodes.forEach(node => {
        // 处理Group节点
        if (node.isGroup || node.traverse) {
          // 检查是否是细节节点组
          if (node.userData && node.userData.isDetail) {
            // 细节节点组，找到不可见的检测Mesh
            node.traverse(child => {
              if (child.isMesh && child.material.visible === false) {
                child.parentNode = node;
                allObjects.push(child);
              }
            });
          } else {
            // 核心节点组，添加所有子对象
            node.traverse(child => {
              if (child.isMesh || child.isSprite) {
                child.parentNode = node;
                allObjects.push(child);
              }
            });
          }
        }
        // 处理直接是Sprite或Mesh的节点
        else if (node.isSprite || node.isMesh) {
          node.parentNode = node;
          allObjects.push(node);
        }
      });

      const intersects = raycasterRef.current.intersectObjects(allObjects);
      let clickedGroup = null;
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        // 如果是 Sprite，检查是否有父级 Group
        if (hit.isSprite && hit.parent && hit.parent.isGroup) {
          clickedGroup = hit.parent;
        } else if (hit.isSprite) {
          // 如果没有父级Group，使用自身
          clickedGroup = hit;
        } else {
          clickedGroup = hit.parentNode;
        }
      }

      if (clickedGroup) {
        const clickedNode = clickedGroup;

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
        let relatedPoems = [];
        if (processedData && processedData.cooccurrenceData) {
          const { cooccurrenceData } = processedData;

          // 如果点击的是具体节点，直接使用 poemIds 获取诗歌
          if (clickedNode.userData.isDetail && clickedNode.userData.poemIds && clickedNode.userData.poemIds.length > 0) {
            relatedPoems = clickedNode.userData.poemIds
              .map(id => cooccurrenceData.poemImages[id]?.poem)
              .filter(Boolean);
          } else if (clickedNode.userData.isDetail) {
            // 如果 poemIds 为空，尝试根据节点名称查找
            const nodeName = clickedNode.userData.name;
            for (const poemId in cooccurrenceData.poemImages) {
              const poemData = cooccurrenceData.poemImages[poemId];
              if (poemData.specificImages && poemData.specificImages.includes(nodeName)) {
                relatedPoems.push(poemData.poem);
              }
            }
          }

          // 如果仍然没有找到，尝试核心节点的方式
          if (relatedPoems.length === 0) {
            relatedPoems = getRelatedPoems(
              clickedNode.userData.id,
              cooccurrenceData.imageStats,
              cooccurrenceData.poemImages
            ).map(p => p.poem);
          }

          // 计算相关意象（与当前意象共现的意象）
          const relatedImages = [];
          const currentId = clickedNode.userData.id || clickedNode.userData.name;

          // 从CORE_IMAGES中查找当前意象的颜色
          const currentCore = CORE_IMAGES.find(c => c.id === currentId || c.name === currentId);
          const currentColor = currentCore ? getEmotionColor(currentCore.emotion) : '#888';

          // 查找与当前意象共现的其他意象
          // lineCooccurrence 结构是 { "img1-img2": { img1, img2, count } }
          if (cooccurrenceData.lineCooccurrence) {
            const relatedSet = new Set(); // 用于去重

            for (const key in cooccurrenceData.lineCooccurrence) {
              const data = cooccurrenceData.lineCooccurrence[key];
              let targetId = null;

              // 检查当前意象是否在这个连线中
              if (data.img1 === currentId) {
                targetId = data.img2;
              } else if (data.img2 === currentId) {
                targetId = data.img1;
              }

              // 如果找到相关意象，获取其情绪颜色
              if (targetId && !relatedSet.has(targetId)) {
                relatedSet.add(targetId);
                const targetCore = CORE_IMAGES.find(c => c.id === targetId || c.name === targetId);
                if (targetCore) {
                  relatedImages.push({
                    name: targetCore.name,
                    color: getEmotionColor(targetCore.emotion)
                  });
                }
              }
            }
          }

          if (onNodeClick) {
            onNodeClick({
              node: clickedNode.userData,
              relatedPoems,
              relatedImages,
              currentColor,
            });
          }
        }
        return; // 点击了节点，不再处理连线
      }
    }

    // 节点未点击到，检测连线点击
    if (links.length > 0) {
      const linkIntersects = raycasterRef.current.intersectObjects(links, false);
      if (linkIntersects.length > 0) {
        const clickedLine = linkIntersects[0].object;
        const lineData = clickedLine.userData;

        // 如果有诗句数据，触发回调
        if (lineData.lines && lineData.lines.length > 0 && onLineClick) {
          onLineClick({
            source: lineData.source,
            target: lineData.target,
            strength: lineData.strength,
            lines: lineData.lines,
          });
        }
      }
    }
  }, [onNodeClick, onLineClick, processedData, toggleDetailLayer]);

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
