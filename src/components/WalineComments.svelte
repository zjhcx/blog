<script lang="ts">
	import { language } from "@/i18n/client";
	import { init, type WalineInstance } from "@waline/client";
	import "@waline/client/style";
	import { onMount } from "svelte";

	export let serverURL = "";
	export let path = "";

	let container: HTMLDivElement | null = null;
	let waline: WalineInstance | null = null;
	let mounted = false;

	function resolveWalineLanguage(lang: string): string {
		switch (lang) {
			case "zh_CN":
				return "zh-CN";
			case "zh_TW":
				return "zh-TW";
			case "ja":
				return "jp";
			case "es":
				return "es";
			case "vi":
				return "vi";
			default:
				return "en";
		}
	}

	function syncWaline(): void {
		if (!mounted || !container) return;

		const normalizedServerURL = serverURL.trim();
		if (!normalizedServerURL) {
			waline?.destroy();
			waline = null;
			return;
		}

		const options = {
			serverURL: normalizedServerURL,
			path,
			lang: resolveWalineLanguage($language),
			dark: "html.dark",
		};

		if (!waline) {
			waline = init({
				el: container,
				...options,
			});
			return;
		}

		waline.update(options);
	}

	onMount(() => {
		mounted = true;
		syncWaline();

		return () => {
			waline?.destroy();
			waline = null;
		};
	});

	$: syncWaline();
</script>

<div bind:this={container} class="waline-root"></div>

<style>
	.waline-root {
		min-height: 12rem;
	}

	:global(.waline-root) {
		--waline-font-size: 0.95rem;
		--waline-theme-color: var(--primary);
		--waline-active-color: var(--primary);
		--waline-color: color-mix(in srgb, var(--deep-text) 88%, transparent);
		--waline-bg-color: transparent;
		--waline-bg-color-light: color-mix(in srgb, var(--card-bg) 70%, white 30%);
		--waline-bg-color-hover: var(--btn-plain-bg-hover);
		--waline-border-color: var(--line-divider);
		--waline-disable-bg-color: var(--btn-regular-bg);
		--waline-disable-color: color-mix(in srgb, var(--deep-text) 42%, transparent);
		--waline-bq-color: var(--btn-regular-bg);
		--waline-info-bg-color: var(--btn-regular-bg);
		--waline-info-color: color-mix(in srgb, var(--deep-text) 45%, transparent);
		--waline-border: 1px solid var(--waline-border-color);
		--waline-box-shadow: none;
	}

	:global(html.dark .waline-root) {
		--waline-color: color-mix(in srgb, white 70%, transparent);
		--waline-bg-color-light: color-mix(in srgb, var(--card-bg) 72%, black 28%);
		--waline-border-color: var(--line-divider);
		--waline-disable-bg-color: var(--btn-regular-bg);
		--waline-disable-color: color-mix(in srgb, white 35%, transparent);
		--waline-bq-color: var(--btn-regular-bg);
		--waline-info-bg-color: var(--btn-regular-bg);
		--waline-info-color: color-mix(in srgb, white 42%, transparent);
	}

	:global(.waline-root .wl-card) {
		box-shadow: none;
	}

	:global(.waline-root .wl-editor),
	:global(.waline-root .wl-input),
	:global(.waline-root .wl-panel),
	:global(.waline-root .wl-preview),
	:global(.waline-root .wl-meta),
	:global(.waline-root .wl-sort),
	:global(.waline-root .wl-content),
	:global(.waline-root .wl-empty),
	:global(.waline-root .wl-count) {
		transition: all 150ms ease;
	}
</style>
