# Chenxi Blog - 项目说明文档

## 项目概览
- **项目类型**: Astro 静态博客网站
- **技术栈**: Astro 5.x + TypeScript + Less
- **主题**: vhAstro-Theme（基于 Astro 的博客主题）
- **部署端口**: 5000

## 核心功能

### 1. 深色模式（Dark Mode）
项目已完整支持深色模式，包括：

#### 实现方式
- **配置文件**: `blog/src/config.ts`
  - `Theme`: 浅色模式主题配置
  - `DarkTheme`: 深色模式主题配置
  
- **主题切换脚本**: `blog/src/scripts/Theme.ts`
  - 自动检测系统主题偏好
  - localStorage 持久化用户选择
  - 无闪烁加载（inline script）
  
- **切换按钮**: Header 组件中的月亮/太阳图标
  - 位置：导航栏右侧
  - 图标：浅色模式显示月亮，深色模式显示太阳

#### 深色模式颜色配置
```typescript
DarkTheme: {
  "--vh-main-color": "#00D4C4",      // 主题色
  "--vh-font-color": "#E8E8E8",      // 字体颜色
  "--vh-white-color": "#1A1A1A",     // 背景色
  "--vh-body-bg": "#0D0D0D",         // Body 背景色
  "--vh-box-shadow": "0 3px 8px 6px rgba(0, 0, 0, 0.3)" // 阴影
}
```

### 2. 背景图配置
- **位置**: `blog/public/assets/images/b4847170889c59518a1d2861856ef2e5.jpg`
- **配置**: `blog/src/config.ts` 中的 `HomeBanner.background`

## 项目结构

```
blog/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Header/         # 顶部导航（含主题切换按钮）
│   │   ├── Footer/         # 页脚
│   │   ├── Aside/          # 侧边栏
│   │   └── ...
│   ├── layouts/            # 布局组件
│   │   └── Layout/         # 主布局（主题初始化）
│   ├── scripts/            # JavaScript 脚本
│   │   ├── Theme.ts        # 主题切换逻辑 ★
│   │   └── Init.ts         # 初始化脚本
│   ├── styles/             # 全局样式
│   │   ├── Base.less       # 基础样式（含深色模式变量）
│   │   └── Reset.less      # 样式重置
│   └── config.ts           # 配置文件 ★
├── public/                 # 静态资源
│   └── assets/
│       └── images/         # 图片资源
└── dist/                   # 构建输出
```

## 开发命令

### 构建项目
```bash
cd blog && pnpm build
```

### 启动开发服务器
```bash
cd blog && pnpm dev
```

### 预览构建结果
```bash
bash run.sh
# 或
python3 -m http.server 5000 -d blog/dist
```

## 主题系统详解

### CSS 变量体系
项目使用 CSS 变量实现主题切换，所有颜色通过变量控制：

#### 浅色模式变量
```css
:root {
  --vh-white-color: #fff;
  --vh-body-bg: #F8F8F8;
  --vh-main-color: #01C4B6;
  --vh-font-color: #34495e;
}
```

#### 深色模式变量
```css
:root.dark-theme {
  --vh-white-color: #1A1A1A;
  --vh-body-bg: #0D0D0D;
  --vh-main-color: #00D4C4;
  --vh-font-color: #E8E8E8;
}
```

### 组件深色模式适配
以下组件已适配深色模式：
- ✅ Header（顶部导航）
- ✅ Footer（页脚）
- ✅ ArticleCard（文章卡片）
- ✅ Aside（侧边栏）
- ✅ 所有使用 CSS 变量的组件

## 修改指南

### 修改主题颜色
编辑 `blog/src/config.ts`:
```typescript
Theme: {
  "--vh-main-color": "#你的颜色",
  // ...
}

DarkTheme: {
  "--vh-main-color": "#你的颜色",
  // ...
}
```

### 修改背景图
1. 将图片放到 `blog/public/assets/images/`
2. 修改 `blog/src/config.ts`:
```typescript
HomeBanner: {
  background: "url('/assets/images/你的图片.jpg') no-repeat center 60%/cover"
}
```

### 添加新的深色模式样式
在组件的 `.less` 文件中添加：
```less
:root.dark-theme .your-component {
  // 深色模式样式
}
```

## 注意事项

1. **避免硬编码颜色**: 所有颜色应使用 CSS 变量，不要直接写死颜色值
2. **测试深色模式**: 修改样式后，务必测试两种模式下的显示效果
3. **构建后测试**: 某些样式问题仅在构建后出现，建议执行 `pnpm build` 后测试
4. **变量命名**: 添加新的 CSS 变量时，请在 `Base.less` 和配置文件中同步定义

---
最后更新: 2026-03-30
