import path from "path";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import Compress from "@playform/compress";
import Compressor from "astro-compressor";
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Markdown 配置================
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import { remarkNote, addClassNames } from './src/plugins/markdown.custom'
// Markdown 配置================
import SITE_INFO from './src/config';
import swup from '@swup/astro';
// https://astro.build/config

// 自动检测各平台的默认 URL 环境变量
const getSiteUrl = () => {
  // Cloudflare Pages 默认提供 CF_PAGES_URL
  if (process.env.CF_PAGES === '1') return process.env.CF_PAGES_URL || SITE_INFO.Site;
  
  // Vercel 默认提供 VERCEL_URL
  if (process.env.VERCEL === '1') return `https://${process.env.VERCEL_URL}`;
  
  // GitHub Pages 手动指定或保持默认
  if (process.env.GITHUB_ACTIONS === 'true') return SITE_INFO.Site;
  
  // 默认指向配置中的 Site
  return SITE_INFO.Site;
};

export default defineConfig({
	site: getSiteUrl(),
	build: { assets: 'vh_static' },
	integrations: [swup({
		theme: false,
		animationClass: "vh-animation-",
		containers: [".main-inner>.main-inner-content", '.vh-header>.main'],
		smoothScrolling: true,
		progress: true,
		cache: true,
		preload: true,
		accessibility: true,
		updateHead: true,
		updateBodyClass: false,
		globalInstance: true
	}),
	Compress({ Image: false, Action: { Passed: async () => true } }),
	sitemap({
		// 处理末尾带 / 的 url
		serialize: (item) => ({ ...item, url: item.url.endsWith('/') ? item.url.slice(0, -1) : item.url })
	}),
	mdx({ extendMarkdownConfig: false }),
	Compressor({ gzip: false, brotli: true, fileExtensions: [".html", ".css", ".js"] })
	],
	markdown: {
		remarkPlugins: [remarkMath, remarkDirective, remarkNote,],
		rehypePlugins: [[
			rehypeKatex, {
				output: 'mathml',
				trust: true,
				strict: false
			}
		], rehypeSlug, addClassNames],
		syntaxHighlight: 'shiki',
		shikiConfig: { theme: 'github-light' },
	},
	vite: { resolve: { alias: { "@": path.resolve(__dirname, "./src") } } },
	server: { host: '0.0.0.0' }
});