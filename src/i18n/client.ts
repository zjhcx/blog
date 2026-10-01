import { type Writable, writable } from "svelte/store";
import { siteConfig } from "@/config";
import type I18nKey from "./i18nKey";
import { zh_CN } from "./languages/zh_CN";
import type { Translation } from "./translation";

export const supportedLanguages = [
	{ code: "zh_CN", label: "简体中文" },
	{ code: "zh_TW", label: "繁體中文" },
	{ code: "en", label: "English" },
	{ code: "ja", label: "日本語" },
	{ code: "ko", label: "한국어" },
	{ code: "es", label: "Español" },
	{ code: "th", label: "ไทย" },
	{ code: "vi", label: "Tiếng Việt" },
	{ code: "tr", label: "Türkçe" },
	{ code: "id", label: "Indonesia" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

const translationLoaders: Record<
	Exclude<SupportedLanguage, "zh_CN">,
	() => Promise<Translation>
> = {
	zh_TW: () => import("./languages/zh_TW").then((module) => module.zh_TW),
	en: () => import("./languages/en").then((module) => module.en),
	ja: () => import("./languages/ja").then((module) => module.ja),
	ko: () => import("./languages/ko").then((module) => module.ko),
	es: () => import("./languages/es").then((module) => module.es),
	th: () => import("./languages/th").then((module) => module.th),
	vi: () => import("./languages/vi").then((module) => module.vi),
	tr: () => import("./languages/tr").then((module) => module.tr),
	id: () => import("./languages/id").then((module) => module.id),
};

const translations = new Map<SupportedLanguage, Translation>([
	["zh_CN", zh_CN],
]);
const pendingTranslations = new Map<SupportedLanguage, Promise<Translation>>();
let languageRequestId = 0;

function isSupportedLanguage(lang: string | null): lang is SupportedLanguage {
	return supportedLanguages.some((item) => item.code === lang);
}

function getPreferredLanguage(): SupportedLanguage {
	if (typeof window === "undefined") {
		return isSupportedLanguage(siteConfig.lang) ? siteConfig.lang : "zh_CN";
	}

	const stored = localStorage.getItem("language");
	return isSupportedLanguage(stored) ? stored : "zh_CN";
}

export function getCurrentLanguage(): SupportedLanguage {
	return getPreferredLanguage();
}

export const language: Writable<SupportedLanguage> =
	writable<SupportedLanguage>("zh_CN");
export const languageLoading: Writable<boolean> = writable(false);

async function loadTranslation(lang: SupportedLanguage): Promise<Translation> {
	const cached = translations.get(lang);
	if (cached) return cached;

	const pending = pendingTranslations.get(lang);
	if (pending) return pending;

	const loader =
		translationLoaders[lang as Exclude<SupportedLanguage, "zh_CN">];
	const request = loader().then((translation) => {
		translations.set(lang, translation);
		return translation;
	}).finally(() => {
		pendingTranslations.delete(lang);
	});
	pendingTranslations.set(lang, request);
	return request;
}

export function translate(
	key: I18nKey,
	lang: SupportedLanguage = "zh_CN",
): string {
	return translations.get(lang)?.[key] ?? zh_CN[key];
}

function updateDocument(lang: SupportedLanguage): void {
	if (typeof document === "undefined") {
		return;
	}

	document.documentElement.lang = lang.replace("_", "-");
	for (const element of document.querySelectorAll<HTMLElement>(
		"[data-i18n-key]",
	)) {
		const key = element.dataset.i18nKey as I18nKey | undefined;
		if (key) {
			element.textContent = translate(key, lang);
		}
	}
	for (const element of document.querySelectorAll<HTMLElement>(
		"[data-i18n-aria-key]",
	)) {
		const key = element.dataset.i18nAriaKey as I18nKey | undefined;
		if (key) {
			element.setAttribute("aria-label", translate(key, lang));
		}
	}
}

export async function applyLanguage(lang: SupportedLanguage): Promise<boolean> {
	if (typeof document === "undefined") return false;

	const requestId = ++languageRequestId;
	const loadingTimer = window.setTimeout(() => {
		if (requestId === languageRequestId) languageLoading.set(true);
	}, 180);
	try {
		await loadTranslation(lang);
		if (requestId !== languageRequestId) return false;
		language.set(lang);
		updateDocument(lang);
		return true;
	} catch (error) {
		console.error(`Failed to load the ${lang} translation`, error);
		if (requestId === languageRequestId) {
			language.set("zh_CN");
			updateDocument("zh_CN");
		}
		return false;
	} finally {
		window.clearTimeout(loadingTimer);
		if (requestId === languageRequestId) languageLoading.set(false);
	}
}

export async function setLanguage(lang: SupportedLanguage): Promise<void> {
	if (await applyLanguage(lang)) localStorage.setItem("language", lang);
}
