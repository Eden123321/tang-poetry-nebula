# 唐诗意象星云可视化

## 当前状态
- 版本: 1.1.0
- 最近更新: 2026-03-19
- 工作阶段: 数据扩展与交互优化

## 快速链接
- 主应用: c:\claude-test\gephi-viz\src\App.jsx
- 3D可视化: c:\claude-test\gephi-viz\src\components\GraphNebula.jsx
- 诗歌面板: c:\claude-test\gephi-viz\src\components\PoetryPanel.jsx
- 意象提取: c:\claude-test\gephi-viz\src\utils\imageExtractor.js
- 星云生成: c:\claude-test\gephi-viz\src\utils\nebulaGenerator.js

## 最近完成
- 诗歌数据扩展：从300首扩展到5000首
  - 数据来源：chinese-poetry npm包
  - 仅保留出现次数>=5的核心意象
  - 连线强度阈值>=2
- 细节节点交互优化：
  - 点击具体节点显示相关诗歌
  - 修复点击检测问题
- 渲染优化：
  - 添加renderOrder解决连线遮挡问题
  - 使用depthWrite: false避免连线变黑
- 节点距离拉大：offsetRadius 80-200

## 核心模块
- src/App.jsx: 主应用入口，页面布局
- src/components/GraphNebula.jsx: Three.js 3D星云可视化
- src/components/PoetryPanel.jsx: 诗歌详情面板
- src/utils/imageExtractor.js: 意象提取与共现计算
- src/utils/nebulaGenerator.js: 星云数据生成
- src/data/coreImages.js: 核心意象定义（95个）+情绪映射
- src/data/imageDictionary.js: 具体意象到核心意象的映射
- src/data/poems.json: 诗歌数据（5000首）

## 技术栈
- 前端: React 19 + Vite
- 3D渲染: Three.js
- 构建工具: Vite

## PRD二期任务
- [x] 句级共现关系 - 按诗句提取意象并建立共现
- [x] 情绪星云雾层 - 按情绪颜色分组，使用Sprite+AdditiveBlending实现片状雾
- [x] 曲线连线 - 使用QuadraticBezierCurve3曲线
- [x] 位置固定 - 种子随机数生成器
- [x] 数据扩展 - 核心意象95个 + 诗歌5000首
