<script lang="ts">
	import { loadStylesheet } from "@/utils/lazy-resources";
	import { url } from "@/utils/url-utils";
	import { language } from "@/i18n/client";
	import type { WalineInstance } from "@waline/client";
	import { onMount } from "svelte";

	export let serverURL = "";
	export let path = "";
	export let capApiEndpoint = "";
	export let capWidgetUrl = "";

	let container: HTMLDivElement | null = null;
	let waline: WalineInstance | null = null;
	let mounted = false;
	let syncQueue = Promise.resolve();
	let walineModulePromise: Promise<typeof import("@waline/client")> | null = null;

	let retryTimer: ReturnType<typeof setTimeout> | undefined;
	let retryCount = 0;

	function loadWalineStyle(): Promise<void> {
		const existing = document.getElementById("waline-style") as HTMLLinkElement | null;
		if (existing?.sheet) return Promise.resolve();

		return new Promise((resolve, reject) => {
			const link = existing ?? document.createElement("link");
			const cleanup = () => {
				clearTimeout(timeout);
				link.removeEventListener("load", onLoad);
				link.removeEventListener("error", onError);
			};
			const onLoad = () => {
				cleanup();
				resolve();
			};
			const onError = () => {
				cleanup();
				link.remove();
				reject(new Error("Failed to load Waline styles"));
			};
			const timeout = setTimeout(onError, 15000);
			link.addEventListener("load", onLoad, { once: true });
			link.addEventListener("error", onError, { once: true });
			if (!existing) {
				link.id = "waline-style";
				link.rel = "stylesheet";
				link.href = url("/vendor/waline/waline.css");
				document.head.appendChild(link);
			}
		});
	}

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

	async function syncWaline(): Promise<void> {
		if (!mounted || !container?.isConnected) return;

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
			capApiEndpoint: capApiEndpoint.trim(),
			capWidgetUrl: capWidgetUrl.trim().startsWith("/")
				? url(capWidgetUrl.trim())
				: capWidgetUrl.trim(),
		};

		if (!waline) {
			walineModulePromise ??= Promise.all([
				import(/* @vite-ignore */ new URL(url("/vendor/waline/waline.js"), window.location.origin).href) as Promise<typeof import("@waline/client")>,
				loadWalineStyle(),
				loadStylesheet(url("/vendor/waline.css")),
			]).then(([module]) => module);
			const { init } = await walineModulePromise;
			if (!mounted || !container?.isConnected) return;

			waline = init({
				el: container,
				...options,
			});
			return;
		}

		waline.update(options);
	}

	function queueWalineSync(): void {
		syncQueue = syncQueue.then(syncWaline).then(() => {
			retryCount = 0;
		}).catch((error) => {
			walineModulePromise = null;
			if (!mounted) return;
			console.error("Failed to initialize Waline", error);
			if (retryCount < 3 && retryTimer === undefined) {
				retryTimer = setTimeout(() => {
					retryTimer = undefined;
					queueWalineSync();
				}, 1000 * 2 ** retryCount++);
			}
		});
	}

	onMount(() => {
		mounted = true;
		queueWalineSync();

		return () => {
			mounted = false;
			clearTimeout(retryTimer);
			waline?.destroy();
			waline = null;
		};
	});

	$: {
		serverURL;
		path;
		capApiEndpoint;
		capWidgetUrl;
		$language;
		queueWalineSync();
	}
</script>

<div bind:this={container} class="waline-root"></div>
