# 唐诗意象星云可视化

## 当前状态
- 版本: 1.0.0
- 最近更新: 2026-03-12
- 工作阶段: 实现PRD二期功能 - 句级共现关系、情绪星云雾层

## 快速链接
- 主应用: c:\claude-test\gephi-viz\src\App.jsx
- 3D可视化: c:\claude-test\gephi-viz\src\components\GraphNebula.jsx
- 诗歌面板: c:\claude-test\gephi-viz\src\components\PoetryPanel.jsx
- 意象提取: c:\claude-test\gephi-viz\src\utils\imageExtractor.js
- 星云生成: c:\claude-test\gephi-viz\src\utils\nebulaGenerator.js

## 最近完成
- 句级共现关系 - 按诗句提取意象并建立共现
- 情绪星云雾层 - 按情绪颜色分组生成动态云团（简化版）
- 细节节点改进 - 点击核心节点显示细分意象+连线
- 核心意象颜色 - 按情绪（思乡/离别/秋思/豪放/清雅）着色

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
- [x] 句级共现关系
- [x] 情绪星云雾层
- [x] 曲线连线
- [ ] 简化彩色雾效果（进行中）
