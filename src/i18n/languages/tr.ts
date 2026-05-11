import Key from "../i18nKey";
import type { Translation } from "../translation";

export const tr: Translation = {
	[Key.home]: "Anasayfa",
	[Key.about]: "Hakkında",
	[Key.archive]: "Arşiv",
	[Key.links]: "Bağlantılar",
	[Key.linksDescription]: "Arkadaş blogları ve önerilen siteler",
	[Key.other]: "Diğer",
	[Key.otherDescription]: "Daha fazla sayfa ve site özelliği",
	[Key.search]: "Ara",
	[Key.searchPanel]: "Arama Paneli",
	[Key.searchDevTitle]: "Bu Sahte Bir Arama Sonucudur",
	[Key.searchDevDescription]:
		"Arama <mark>dev</mark> ortamında çalışmadığı için gösterilir.",
	[Key.searchDevTestTitle]: "Aramayı Test Etmek İsterseniz",
	[Key.searchDevTestDescription]:
		"Bunun yerine <mark>npm build && npm preview</mark> çalıştırın.",
	[Key.language]: "Dil",

	[Key.bangumi]: "Bangumi",
	[Key.bangumiDrama]: "Dizi",
	[Key.bangumiDescription]: "Bilibili'de takip edilen animeler",
	[Key.bangumiDramaDescription]: "Bilibili'de takip edilen diziler",
	[Key.bangumiDisabled]: "Bangumi sayfası devre dışı.",
	[Key.bangumiLoadFailed]: "Bilibili bangumi verisi yüklenemedi: ",
	[Key.bangumiEmpty]: "Henüz bangumi verisi yok.",
	[Key.bangumiFollow]: "takip",
	[Key.bangumiPlay]: "izlenme",
	[Key.bangumiOtherDescription]: "Bilibili bangumi listesini görüntüle",
	[Key.bangumiDramaOtherDescription]: "Bilibili dizi listesini görüntüle",

	[Key.moments]: "Anlar",
	[Key.momentsDescription]: "Arkadaş RSS kaynaklarından son güncellemeler",
	[Key.momentsDisabled]: "Anlar sayfası devre dışı.",
	[Key.momentsNoSources]:
		"RSS kaynağı yok. src/config.ts içinde MomentsConfig.sources yapılandırın.",
	[Key.momentsLoadFailed]: "yüklenemedi: ",
	[Key.momentsEmpty]: "Henüz an yok.",
	[Key.momentsUnknownTime]: "Bilinmeyen zaman",
	[Key.momentsUntitled]: "Başlıksız güncelleme",
	[Key.momentsRequestFailed]: "RSS isteği başarısız",
	[Key.momentsOtherDescription]: "Arkadaşların RSS güncellemelerini görüntüle",

	[Key.follows]: "Bilibili Takipleri",
	[Key.followsDescription]: "Bilibili'de takip edilen hesaplar",
	[Key.followsDisabled]: "Bilibili takipleri sayfası devre dışı.",
	[Key.followsLoadFailed]: "Bilibili takip verileri yüklenemedi: ",
	[Key.followsEmpty]: "Henüz takip verisi yok.",
	[Key.followsOfficial]: "Doğrulanmış",
	[Key.followsVip]: "VIP",
	[Key.followsOtherDescription]: "Bilibili takiplerini görüntüle",

	[Key.fans]: "Bilibili Hayranları",
	[Key.fansDescription]: "Bilibili takipçileri",
	[Key.fansDisabled]: "Bilibili hayranları sayfası devre dışı.",
	[Key.fansLoadFailed]: "Bilibili hayran verileri yüklenemedi: ",
	[Key.fansEmpty]: "Henüz hayran verisi yok.",
	[Key.fansOtherDescription]: "Bilibili takipçilerini görüntüle",

	[Key.dynamic]: "Bilibili Dinamik",
	[Key.dynamicDescription]: "Bilibili alan güncellemeleri",
	[Key.dynamicDisabled]: "Bilibili dinamik sayfası devre dışı.",
	[Key.dynamicLoadFailed]: "Bilibili dinamik verileri yüklenemedi: ",
	[Key.dynamicEmpty]: "Henüz dinamik verisi yok.",
	[Key.dynamicOtherDescription]: "Bilibili alan güncellemelerini görüntüle",
	[Key.dynamicStatForward]: "Paylaşım",
	[Key.dynamicStatComment]: "Yorum",
	[Key.dynamicStatLike]: "Beğeni",

	[Key.friendGithubDescription]:
		"Açık kaynak ve özel yazılım projeleri için barındırma platformu",
	[Key.friendOpenAIDescription]: "AI araştırma ve ürün platformu",
	[Key.friendBilibiliDescription]: "Video topluluğu ve yaratıcı platform",
	[Key.friendXDescription]: "Sosyal ağ platformu",
	[Key.friendDiscordDescription]: "Popüler sohbet ve topluluk platformu",
	[Key.friendCloudflareDescription]: "Web performansı ve güvenlik platformu",

	[Key.tags]: "Etiketler",
	[Key.categories]: "Kategoriler",
	[Key.recentPosts]: "Son Yazılar",

	[Key.comments]: "Yorumlar",

	[Key.untitled]: "Başlıksız",
	[Key.uncategorized]: "Kategorisiz",
	[Key.noTags]: "Etiket yok",

	[Key.wordCount]: "kelime",
	[Key.wordsCount]: "kelime",
	[Key.minuteCount]: "dakika",
	[Key.minutesCount]: "dakika",
	[Key.postCount]: "gönderi",
	[Key.postsCount]: "gönderiler",

	[Key.themeColor]: "Tema Rengi",

	[Key.lightMode]: "Aydınlık",
	[Key.darkMode]: "Koyu",
	[Key.systemMode]: "Sistem",

	[Key.more]: "Daha Fazla",

	[Key.author]: "Yazar",
	[Key.publishedAt]: "Yayınlandı",
	[Key.license]: "Lisans",
	[Key.allRightsReserved]: "Tüm hakları saklıdır.",
	[Key.poweredBy]: "Powered by",
	[Key.siteSource]: "Site kaynağı",
};
