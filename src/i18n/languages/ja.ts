import Key from "../i18nKey";
import type { Translation } from "../translation";

export const ja: Translation = {
	[Key.home]: "ホーム",
	[Key.about]: "プロフィール",
	[Key.archive]: "アーカイブ",
	[Key.links]: "リンク",
	[Key.linksDescription]: "友人のブログとおすすめサイト",
	[Key.other]: "その他",
	[Key.otherDescription]: "その他のページとサイト機能",
	[Key.search]: "検索",
	[Key.searchPanel]: "検索パネル",
	[Key.searchDevTitle]: "これはダミーの検索結果です",
	[Key.searchDevDescription]: "検索は <mark>開発</mark> 環境では動作しません。",
	[Key.searchDevTestTitle]: "検索をテストする場合",
	[Key.searchDevTestDescription]:
		"<mark>npm build && npm preview</mark> を実行してください。",
	[Key.language]: "言語",

	[Key.bangumi]: "追番",
	[Key.bangumiDrama]: "ドラマ",
	[Key.bangumiDescription]: "Bilibili でフォローしているアニメ",
	[Key.bangumiDramaDescription]: "Bilibili でフォローしているドラマ",
	[Key.bangumiDisabled]: "追番ページは無効です。",
	[Key.bangumiLoadFailed]: "Bilibili の追番データの読み込みに失敗しました：",
	[Key.bangumiEmpty]: "追番データはまだありません。",
	[Key.bangumiFollow]: "フォロー",
	[Key.bangumiPlay]: "再生",
	[Key.bangumiOtherDescription]: "Bilibili の追番リストを見る",
	[Key.bangumiDramaOtherDescription]: "Bilibili のドラマリストを見る",

	[Key.moments]: "モーメント",
	[Key.momentsDescription]: "RSS ソースから取得した友人の最新更新",
	[Key.momentsDisabled]: "モーメントページは無効です。",
	[Key.momentsNoSources]:
		"RSS ソースがありません。src/config.ts の MomentsConfig.sources で設定してください。",
	[Key.momentsLoadFailed]: "読み込み失敗：",
	[Key.momentsEmpty]: "モーメントはまだありません。",
	[Key.momentsUnknownTime]: "不明な時刻",
	[Key.momentsUntitled]: "無題の更新",
	[Key.momentsRequestFailed]: "RSS リクエストに失敗しました",
	[Key.momentsOtherDescription]: "RSS で集約した友人の最新更新を見る",

	[Key.friendGithubDescription]:
		"オープンソースと非公開ソフトウェアプロジェクトのホスティングプラットフォーム",
	[Key.friendOpenAIDescription]: "AI の研究とプロダクトのプラットフォーム",
	[Key.friendBilibiliDescription]:
		"動画コミュニティとクリエイティブプラットフォーム",
	[Key.friendXDescription]: "ソーシャルネットワーキングプラットフォーム",
	[Key.friendDiscordDescription]:
		"人気のチャットとコミュニティプラットフォーム",
	[Key.friendCloudflareDescription]:
		"Web パフォーマンスとセキュリティのプラットフォーム",

	[Key.tags]: "タグ",
	[Key.categories]: "カテゴリ",
	[Key.recentPosts]: "最近の投稿",

	[Key.comments]: "コメント",

	[Key.untitled]: "タイトルなし",
	[Key.uncategorized]: "カテゴリなし",
	[Key.noTags]: "タグなし",

	[Key.wordCount]: "文字",
	[Key.wordsCount]: "文字",
	[Key.minuteCount]: "分",
	[Key.minutesCount]: "分",
	[Key.postCount]: "件の投稿",
	[Key.postsCount]: "件の投稿",

	[Key.themeColor]: "テーマカラー",

	[Key.lightMode]: "ライト",
	[Key.darkMode]: "ダーク",
	[Key.systemMode]: "システム",

	[Key.more]: "もっと",

	[Key.author]: "作者",
	[Key.publishedAt]: "公開日",
	[Key.license]: "ライセンス",
	[Key.allRightsReserved]: "全著作権所有。",
	[Key.poweredBy]: "Powered by",
	[Key.siteSource]: "このサイトのソースは",
};
