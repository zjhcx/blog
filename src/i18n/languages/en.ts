import Key from "../i18nKey";
import type { Translation } from "../translation";

export const en: Translation = {
	[Key.home]: "Home",
	[Key.about]: "About",
	[Key.archive]: "Archive",
	[Key.links]: "Links",
	[Key.linksDescription]: "Friends' blogs and recommended sites",
	[Key.other]: "Other",
	[Key.otherDescription]: "More pages and site features",
	[Key.search]: "Search",
	[Key.searchPanel]: "Search Panel",
	[Key.searchDevTitle]: "This Is a Fake Search Result",
	[Key.searchDevDescription]:
		"Because search cannot work in the <mark>dev</mark> environment.",
	[Key.searchDevTestTitle]: "If You Want to Test Search",
	[Key.searchDevTestDescription]:
		"Try running <mark>npm build && npm preview</mark> instead.",
	[Key.language]: "Language",

	[Key.bangumi]: "Bangumi",
	[Key.bangumiDrama]: "Drama",
	[Key.bangumiDescription]: "Anime followed on Bilibili",
	[Key.bangumiDramaDescription]: "Drama series followed on Bilibili",
	[Key.bangumiDisabled]: "Bangumi page is disabled.",
	[Key.bangumiLoadFailed]: "Failed to load Bilibili bangumi data: ",
	[Key.bangumiEmpty]: "No bangumi data yet.",
	[Key.bangumiFollow]: "following",
	[Key.bangumiPlay]: "views",
	[Key.bangumiOtherDescription]: "View Bilibili bangumi list",
	[Key.bangumiDramaOtherDescription]: "View Bilibili drama list",

	[Key.moments]: "Moments",
	[Key.momentsDescription]: "Latest updates from friends' RSS feeds",
	[Key.momentsDisabled]: "Moments page is disabled.",
	[Key.momentsNoSources]:
		"No RSS sources yet. Configure MomentsConfig.sources in src/config.ts.",
	[Key.momentsLoadFailed]: "failed to load: ",
	[Key.momentsEmpty]: "No moments yet.",
	[Key.momentsUnknownTime]: "Unknown time",
	[Key.momentsUntitled]: "Untitled update",
	[Key.momentsRequestFailed]: "RSS request failed",
	[Key.momentsOtherDescription]: "View friends' latest updates from RSS feeds",

	[Key.follows]: "Bilibili Follows",
	[Key.followsDescription]: "Accounts followed on Bilibili",
	[Key.followsDisabled]: "Bilibili follows page is disabled.",
	[Key.followsLoadFailed]: "Failed to load Bilibili follows data: ",
	[Key.followsEmpty]: "No follow data yet.",
	[Key.followsOfficial]: "Verified",
	[Key.followsVip]: "VIP",
	[Key.followsOtherDescription]: "View Bilibili followings",

	[Key.fans]: "Bilibili Fans",
	[Key.fansDescription]: "Followers on Bilibili",
	[Key.fansDisabled]: "Bilibili fans page is disabled.",
	[Key.fansLoadFailed]: "Failed to load Bilibili fans data: ",
	[Key.fansEmpty]: "No fan data yet.",
	[Key.fansOtherDescription]: "View Bilibili followers",

	[Key.dynamic]: "Bilibili Dynamic",
	[Key.dynamicDescription]: "Space updates from Bilibili",
	[Key.dynamicDisabled]: "Bilibili dynamic page is disabled.",
	[Key.dynamicLoadFailed]: "Failed to load Bilibili dynamic data: ",
	[Key.dynamicEmpty]: "No dynamic data yet.",
	[Key.dynamicOtherDescription]: "View Bilibili space updates",
	[Key.dynamicStatForward]: "Forwards",
	[Key.dynamicStatComment]: "Comments",
	[Key.dynamicStatLike]: "Likes",

	[Key.friendGithubDescription]:
		"A hosting platform for open-source and private software projects",
	[Key.friendOpenAIDescription]: "AI research and product platform",
	[Key.friendBilibiliDescription]: "Video community and creative platform",
	[Key.friendXDescription]: "Social networking platform",
	[Key.friendDiscordDescription]: "A popular chat and community platform",
	[Key.friendCloudflareDescription]: "Web performance and security platform",

	[Key.tags]: "Tags",
	[Key.categories]: "Categories",
	[Key.recentPosts]: "Recent Posts",

	[Key.comments]: "Comments",

	[Key.untitled]: "Untitled",
	[Key.uncategorized]: "Uncategorized",
	[Key.noTags]: "No Tags",

	[Key.wordCount]: "word",
	[Key.wordsCount]: "words",
	[Key.minuteCount]: "minute",
	[Key.minutesCount]: "minutes",
	[Key.postCount]: "post",
	[Key.postsCount]: "posts",

	[Key.themeColor]: "Theme Color",

	[Key.lightMode]: "Light",
	[Key.darkMode]: "Dark",
	[Key.systemMode]: "System",

	[Key.more]: "More",

	[Key.author]: "Author",
	[Key.publishedAt]: "Published at",
	[Key.license]: "License",
	[Key.allRightsReserved]: "All Rights Reserved.",
	[Key.poweredBy]: "Powered by",
	[Key.siteSource]: "Source available on",
};
