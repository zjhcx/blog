import Key from "../i18nKey";
import type { Translation } from "../translation";

export const zh_TW: Translation = {
	[Key.home]: "首頁",
	[Key.about]: "關於",
	[Key.archive]: "彙整",
	[Key.links]: "友鏈",
	[Key.linksDescription]: "朋友們的部落格和推薦站點",
	[Key.other]: "其他",
	[Key.otherDescription]: "更多頁面與站點功能",
	[Key.search]: "搜尋",
	[Key.searchPanel]: "搜尋面板",
	[Key.searchDevTitle]: "這是一條假的搜尋結果",
	[Key.searchDevDescription]: "因為搜尋無法在 <mark>開發</mark> 環境中運作。",
	[Key.searchDevTestTitle]: "如果你想測試搜尋",
	[Key.searchDevTestDescription]:
		"請改為執行 <mark>npm build && npm preview</mark>。",
	[Key.language]: "語言",

	[Key.bangumi]: "追番",
	[Key.bangumiDrama]: "追劇",
	[Key.bangumiDescription]: "來自嗶哩嗶哩的番劇收藏",
	[Key.bangumiDramaDescription]: "來自嗶哩嗶哩的劇集收藏",
	[Key.bangumiDisabled]: "追番頁已關閉。",
	[Key.bangumiLoadFailed]: "載入嗶哩嗶哩追番資料失敗：",
	[Key.bangumiEmpty]: "暫無追番資料。",
	[Key.bangumiFollow]: "追番",
	[Key.bangumiPlay]: "播放",
	[Key.bangumiOtherDescription]: "查看 Bilibili 追番列表",
	[Key.bangumiDramaOtherDescription]: "查看 Bilibili 追劇列表",

	[Key.moments]: "朋友圈",
	[Key.momentsDescription]: "來自 RSS 源的朋友最新動態",
	[Key.momentsDisabled]: "朋友圈已關閉。",
	[Key.momentsNoSources]:
		"暫無 RSS 源，請在 src/config.ts 的 MomentsConfig.sources 中配置。",
	[Key.momentsLoadFailed]: "載入失敗：",
	[Key.momentsEmpty]: "暫無朋友圈動態。",
	[Key.momentsUnknownTime]: "未知時間",
	[Key.momentsUntitled]: "未命名動態",
	[Key.momentsRequestFailed]: "RSS 請求失敗",
	[Key.momentsOtherDescription]: "查看 RSS 源聚合的朋友最新動態",

	[Key.friendGithubDescription]: "面向開源及私有軟體專案的託管平台",
	[Key.friendOpenAIDescription]: "AI 研究與產品平台",
	[Key.friendBilibiliDescription]: "影音社群與創作平台",
	[Key.friendXDescription]: "社群平台",
	[Key.friendDiscordDescription]: "流行的聊天和社群平台",
	[Key.friendCloudflareDescription]: "Web 效能與安全平台",

	[Key.tags]: "標籤",
	[Key.categories]: "分類",
	[Key.recentPosts]: "最新文章",

	[Key.comments]: "評論",

	[Key.untitled]: "無標題",
	[Key.uncategorized]: "未分類",
	[Key.noTags]: "無標籤",

	[Key.wordCount]: "字",
	[Key.wordsCount]: "字",
	[Key.minuteCount]: "分鐘",
	[Key.minutesCount]: "分鐘",
	[Key.postCount]: "篇文章",
	[Key.postsCount]: "篇文章",

	[Key.themeColor]: "主題色",

	[Key.lightMode]: "亮色",
	[Key.darkMode]: "暗色",
	[Key.systemMode]: "跟隨系統",

	[Key.more]: "更多",

	[Key.author]: "作者",
	[Key.publishedAt]: "發佈於",
	[Key.license]: "許可協議",
	[Key.allRightsReserved]: "保留所有權利。",
	[Key.poweredBy]: "由",
	[Key.siteSource]: "本站開源於",
};
