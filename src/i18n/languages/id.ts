import Key from "../i18nKey";
import type { Translation } from "../translation";

export const id: Translation = {
	[Key.home]: "Beranda",
	[Key.about]: "Tentang",
	[Key.archive]: "Arsip",
	[Key.links]: "Tautan",
	[Key.linksDescription]: "Blog teman dan situs rekomendasi",
	[Key.other]: "Lainnya",
	[Key.otherDescription]: "Halaman dan fitur situs lainnya",
	[Key.search]: "Cari",
	[Key.searchPanel]: "Panel Pencarian",
	[Key.searchDevTitle]: "Ini adalah hasil pencarian palsu",
	[Key.searchDevDescription]:
		"Karena pencarian tidak dapat berjalan di lingkungan <mark>dev</mark>.",
	[Key.searchDevTestTitle]: "Jika ingin menguji pencarian",
	[Key.searchDevTestDescription]:
		"Jalankan <mark>npm build && npm preview</mark> sebagai gantinya.",
	[Key.language]: "Bahasa",

	[Key.bangumi]: "Bangumi",
	[Key.bangumiDrama]: "Drama",
	[Key.bangumiDescription]: "Anime yang diikuti di Bilibili",
	[Key.bangumiDramaDescription]: "Drama yang diikuti di Bilibili",
	[Key.bangumiDisabled]: "Halaman bangumi dinonaktifkan.",
	[Key.bangumiLoadFailed]: "Gagal memuat data bangumi Bilibili: ",
	[Key.bangumiEmpty]: "Belum ada data bangumi.",
	[Key.bangumiFollow]: "mengikuti",
	[Key.bangumiPlay]: "tayangan",
	[Key.bangumiOtherDescription]: "Lihat daftar bangumi Bilibili",
	[Key.bangumiDramaOtherDescription]: "Lihat daftar drama Bilibili",

	[Key.moments]: "Momen",
	[Key.momentsDescription]: "Pembaruan terbaru dari RSS teman",
	[Key.momentsDisabled]: "Halaman momen dinonaktifkan.",
	[Key.momentsNoSources]:
		"Belum ada sumber RSS. Atur MomentsConfig.sources di src/config.ts.",
	[Key.momentsLoadFailed]: "gagal dimuat: ",
	[Key.momentsEmpty]: "Belum ada momen.",
	[Key.momentsUnknownTime]: "Waktu tidak diketahui",
	[Key.momentsUntitled]: "Pembaruan tanpa judul",
	[Key.momentsRequestFailed]: "Permintaan RSS gagal",
	[Key.momentsOtherDescription]: "Lihat pembaruan terbaru teman dari RSS",

	[Key.follows]: "Bilibili Follows",
	[Key.followsDescription]: "Akun yang diikuti di Bilibili",
	[Key.followsDisabled]: "Halaman Bilibili follows dinonaktifkan.",
	[Key.followsLoadFailed]: "Gagal memuat data Bilibili follows: ",
	[Key.followsEmpty]: "Belum ada data follows.",
	[Key.followsOfficial]: "Terverifikasi",
	[Key.followsVip]: "VIP",
	[Key.followsOtherDescription]: "Lihat daftar follows Bilibili",

	[Key.friendGithubDescription]:
		"Platform hosting untuk proyek perangkat lunak terbuka dan privat",
	[Key.friendOpenAIDescription]: "Platform riset dan produk AI",
	[Key.friendBilibiliDescription]: "Komunitas video dan platform kreatif",
	[Key.friendXDescription]: "Platform jejaring sosial",
	[Key.friendDiscordDescription]: "Platform chat dan komunitas populer",
	[Key.friendCloudflareDescription]: "Platform performa dan keamanan web",

	[Key.tags]: "Tag",
	[Key.categories]: "Kategori",
	[Key.recentPosts]: "Postingan Terbaru",

	[Key.comments]: "Komentar",

	[Key.untitled]: "Tanpa Judul",
	[Key.uncategorized]: "Tanpa Kategori",
	[Key.noTags]: "Tanpa Tag",

	[Key.wordCount]: "kata",
	[Key.wordsCount]: "kata",
	[Key.minuteCount]: "menit",
	[Key.minutesCount]: "menit",
	[Key.postCount]: "postingan",
	[Key.postsCount]: "postingan",

	[Key.themeColor]: "Warna Tema",

	[Key.lightMode]: "Terang",
	[Key.darkMode]: "Gelap",
	[Key.systemMode]: "Sistem",

	[Key.more]: "Lainnya",

	[Key.author]: "Penulis",
	[Key.publishedAt]: "Diterbitkan pada",
	[Key.license]: "Lisensi",
	[Key.allRightsReserved]: "Hak cipta dilindungi.",
	[Key.poweredBy]: "Didukung oleh",
	[Key.siteSource]: "Sumber situs tersedia di",
};
