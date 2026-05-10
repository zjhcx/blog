import I18nKey from "./i18n/i18nKey";
import type {
	BangumiConfig as BangumiConfigType,
	ExpressiveCodeConfig,
	FriendLink,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Chenxi's Blog",
	subtitle: "114514",
	lang: "zh_CN", // 语言代码, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "/gthlwp0.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const BangumiConfig: BangumiConfigType = {
	enable: true,
	uid: 3546871542843760,
	type: 1, // 1: 追番, 2: 追剧
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		LinkPreset.Links,
		...(BangumiConfig.enable
			? [
					{
						name: BangumiConfig.type === 2 ? "追剧" : "追番",
						url: "/bangumi/",
						external: false,
					},
				]
			: []),
		{
			name: "其他",
			url: "/other/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
			i18nKey: I18nKey.other,
		},
	],
};

export const linksConfig: FriendLink[] = [
	{
		name: "GitHub",
		url: "https://github.com",
		avatar: "https://github.com/github.png",
		desc: "GitHub 是一个面向开源及私有软件项目的托管平台",
		descI18nKey: I18nKey.friendGithubDescription,
	},
	{
		name: "OpenAI",
		url: "https://openai.com",
		avatar: "https://github.com/openai.png",
		desc: "ChatGPT",
		descI18nKey: I18nKey.friendOpenAIDescription,
	},
	{
		name: "哔哩哔哩",
		url: "https://www.bilibili.com",
		avatar: "https://www.bilibili.com/favicon.ico",
		desc: "哔哩哔哩",
		descI18nKey: I18nKey.friendBilibiliDescription,
	},
	{
		name: "X",
		url: "https://x.com",
		avatar: "https://x.com/favicon.ico",
		desc: "社交平台",
		descI18nKey: I18nKey.friendXDescription,
	},
	{
		name: "Discord",
		url: "https://discord.com",
		avatar:
			"https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/62fddf0fde45a8baedcc7ee5_847541504914fd33810e70a0ea73177e%20(2)-1.png",
		desc: "Discord 是一个流行的聊天和社交平台",
		descI18nKey: I18nKey.friendDiscordDescription,
	},
	{
		name: "Cloudflare",
		url: "https://cloudflare.com",
		avatar: "https://cloudflare.com/favicon.ico",
		desc: "赛博活佛",
		descI18nKey: I18nKey.friendCloudflareDescription,
	},
];

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Chenxi",
	bio: "114514",
	links: [
		{
			name: "X",
			icon: "fa6-brands:x-twitter", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://x.com/zjhcx",
		},
		{
			name: "Discord",
			icon: "fa6-brands:discord",
			url: "https://discord.com/users/1498586217070202910",
		},
		{
			name: "哔哩哔哩",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/3546871542843760",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/zjhcx",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
