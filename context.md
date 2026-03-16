# 唐诗意象星云可视化

## 当前状态
- 版本: 1.0.0
- 最近更新: 2026-03-16
- 工作阶段: PRD二期功能开发 - 情绪星云雾层调优

## 快速链接
- 主应用: c:\claude-test\gephi-viz\src\App.jsx
- 3D可视化: c:\claude-test\gephi-viz\src\components\GraphNebula.jsx
- 诗歌面板: c:\claude-test\gephi-viz\src\components\PoetryPanel.jsx
- 意象提取: c:\claude-test\gephi-viz\src\utils\imageExtractor.js
- 星云生成: c:\claude-test\gephi-viz\src\utils\nebulaGenerator.js

## 最近完成
- 情绪星云雾层 - 使用Sprite实现片状雾效果，带缓慢旋转流动动画
- 节点位置固定 - 使用种子随机数生成器，刷新后位置保持一致
- 连线透明度调整 - 固定0.07，平衡可见度和美观
- 节点间距离加大 - 优化核心节点分布

## 核心模块
- src/App.jsx: 主应用入口，页面布局
- src/components/GraphNebula.jsx: Three.js 3D星云可视化
- src/components/PoetryPanel.jsx: 诗歌详情面板
- src/utils/imageExtractor.js: 意象提取与共现计算
- src/utils/nebulaGenerator.js: 星云数据生成
- src/data/coreImages.js: 核心意象定义（50个）+情绪映射
- src/data/imageDictionary.js: 具体意象到核心意象的映射

## 技术栈
- 前端: React 19 + Vite
- 3D渲染: Three.js
- 构建工具: Vite

## PRD二期任务
- [x] 句级共现关系 - 按诗句提取意象并建立共现
- [x] 情绪星云雾层 - 按情绪颜色分组，使用Sprite+AdditiveBlending实现片状雾
- [x] 曲线连线 - 使用QuadraticBezierCurve3曲线
- [x] 位置固定 - 种子随机数生成器
