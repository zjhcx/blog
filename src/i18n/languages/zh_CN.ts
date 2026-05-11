import Key from "../i18nKey";
import type { Translation } from "../translation";

export const zh_CN: Translation = {
	[Key.home]: "主页",
	[Key.about]: "关于",
	[Key.archive]: "归档",
	[Key.links]: "友链",
	[Key.linksDescription]: "朋友们的博客和推荐站点",
	[Key.other]: "其他",
	[Key.otherDescription]: "更多页面与站点功能",
	[Key.search]: "搜索",
	[Key.searchPanel]: "搜索面板",
	[Key.searchDevTitle]: "这是一条假的搜索结果",
	[Key.searchDevDescription]: "因为搜索无法在 <mark>开发</mark> 环境中工作。",
	[Key.searchDevTestTitle]: "如果你想测试搜索",
	[Key.searchDevTestDescription]:
		"请改为运行 <mark>npm build && npm preview</mark>。",
	[Key.language]: "语言",

	[Key.bangumi]: "追番",
	[Key.bangumiDrama]: "追剧",
	[Key.bangumiDescription]: "来自哔哩哔哩的番剧收藏",
	[Key.bangumiDramaDescription]: "来自哔哩哔哩的剧集收藏",
	[Key.bangumiDisabled]: "追番页已关闭。",
	[Key.bangumiLoadFailed]: "加载哔哩哔哩追番数据失败：",
	[Key.bangumiEmpty]: "暂无追番数据。",
	[Key.bangumiFollow]: "追番",
	[Key.bangumiPlay]: "播放",
	[Key.bangumiOtherDescription]: "查看 Bilibili 追番列表",
	[Key.bangumiDramaOtherDescription]: "查看 Bilibili 追剧列表",

	[Key.moments]: "朋友圈",
	[Key.momentsDescription]: "来自 RSS 源的朋友最新动态",
	[Key.momentsDisabled]: "朋友圈已关闭。",
	[Key.momentsNoSources]:
		"暂无 RSS 源，请在 src/config.ts 的 MomentsConfig.sources 中配置。",
	[Key.momentsLoadFailed]: "加载失败：",
	[Key.momentsEmpty]: "暂无朋友圈动态。",
	[Key.momentsUnknownTime]: "未知时间",
	[Key.momentsUntitled]: "未命名动态",
	[Key.momentsRequestFailed]: "RSS 请求失败",
	[Key.momentsOtherDescription]: "查看 RSS 源聚合的朋友最新动态",

	[Key.follows]: "B站关注",
	[Key.followsDescription]: "来自哔哩哔哩的关注列表",
	[Key.followsDisabled]: "B站关注页已关闭。",
	[Key.followsLoadFailed]: "加载哔哩哔哩关注数据失败：",
	[Key.followsEmpty]: "暂无关注数据。",
	[Key.followsOfficial]: "认证",
	[Key.followsVip]: "大会员",
	[Key.followsOtherDescription]: "查看 Bilibili 关注列表",

	[Key.fans]: "B站粉丝",
	[Key.fansDescription]: "来自哔哩哔哩的粉丝列表",
	[Key.fansDisabled]: "B站粉丝页已关闭。",
	[Key.fansLoadFailed]: "加载哔哩哔哩粉丝数据失败：",
	[Key.fansEmpty]: "暂无粉丝数据。",
	[Key.fansOtherDescription]: "查看 Bilibili 粉丝列表",

	[Key.friendGithubDescription]: "面向开源及私有软件项目的托管平台",
	[Key.friendOpenAIDescription]: "AI 研究与产品平台",
	[Key.friendBilibiliDescription]: "视频社区与创作平台",
	[Key.friendXDescription]: "社交平台",
	[Key.friendDiscordDescription]: "流行的聊天和社群平台",
	[Key.friendCloudflareDescription]: "Web 性能与安全平台",

	[Key.tags]: "标签",
	[Key.categories]: "分类",
	[Key.recentPosts]: "最新文章",

	[Key.comments]: "评论",

	[Key.untitled]: "无标题",
	[Key.uncategorized]: "未分类",
	[Key.noTags]: "无标签",

	[Key.wordCount]: "字",
	[Key.wordsCount]: "字",
	[Key.minuteCount]: "分钟",
	[Key.minutesCount]: "分钟",
	[Key.postCount]: "篇文章",
	[Key.postsCount]: "篇文章",

	[Key.themeColor]: "主题色",

	[Key.lightMode]: "亮色",
	[Key.darkMode]: "暗色",
	[Key.systemMode]: "跟随系统",

	[Key.more]: "更多",

	[Key.author]: "作者",
	[Key.publishedAt]: "发布于",
	[Key.license]: "许可协议",
	[Key.allRightsReserved]: "保留所有权利。",
	[Key.poweredBy]: "由",
	[Key.siteSource]: "本站开源在",
};
