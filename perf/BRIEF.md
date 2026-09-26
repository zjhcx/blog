# 性能冲刺简报：Chenxi's Blog

## 核心操作与“能用”的定义

| 操作 | 页面 | 起点 | 终点 | 判定表达式 |
|---|---|---|---|---|
| 打开首页 | `/` | 导航开始 | 首页正文和主导航可见，搜索框可输入 | `document.querySelector('main')?.innerText.trim().length > 0 && document.querySelector('input[aria-label="搜索"]')?.offsetParent !== null` |

## 护栏

- 不改变视觉、已有交互、文案、国际化、SEO 字段和统计。
- 音乐仍可正常播放；只禁止用户操作前下载音频数据。
- 保持现有 Astro/Svelte 架构，不引入运行时依赖或付费平台能力。

## 目标

- 首页不再于用户播放前请求音频数据。
- 构建、静态性能预算和浏览器功能冒烟全部通过。
- 若具备稳定的限速测试环境，再以 Fast 4G 冷缓存 10 次 p75 降低 50% 为延伸目标。

## 上线与回滚

- 上线由用户批准，本轮不部署。
- 回滚：恢复两个播放器的 `preload="metadata"`，并将侧栏播放器恢复为 `client:load`。
