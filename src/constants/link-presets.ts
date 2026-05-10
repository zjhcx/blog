import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { BangumiConfig } from "@/config";
import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
		i18nKey: I18nKey.home,
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about),
		url: "/about/",
		i18nKey: I18nKey.about,
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
		i18nKey: I18nKey.archive,
	},
	[LinkPreset.Links]: {
		name: i18n(I18nKey.links),
		url: "/links/",
		i18nKey: I18nKey.links,
	},
	[LinkPreset.Bangumi]: {
		name: BangumiConfig.type === 2 ? "追剧" : "追番",
		url: "/bangumi/",
	},
};
