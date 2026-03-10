# Tang Poetry Nebula Visualization

3D visualization of Tang Dynasty poetry imagery using Three.js and React.

## Features

- **Three.js 3D Visualization**: Interactive 3D nebula displaying Tang poetry imagery
- **50+ Core Imagery Nodes**: Visualize key poetic images from Tang Dynasty poems
- **Emotional Color Coding**:
  - 思乡 (Nostalgia) - Blue
  - 离别 (Farewell) - Gold
  - 秋思 (Autumn Reflection) - Purple
  - 豪放 (Bold) - Red
  - 清雅 (Elegant) - Teal
- **Interactive Nodes**: Click to view related poems
- **Two-layer Structure**: Core images + specific images (e.g., "月" → "明月/残月/秋月")
- **AdditiveBlending Glow Effect**: Star-like glowing nodes
- **OrbitControls**: Rotate (middle mouse), pan (right mouse), zoom (scroll)

## Tech Stack

- React 19
- Three.js
- Vite

## Getting Started

```bash
npm install
npm run dev
```

## Controls

- **Left Click**: Select node
- **Middle Click**: Rotate view
- **Right Click**: Pan view
- **Scroll**: Zoom

## Data

- 100 Tang Dynasty poems
- 50 core imagery categories
- 200+ specific imagery mappings
