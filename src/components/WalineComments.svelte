<script lang="ts">
	import { url } from "@/utils/url-utils";
	import { language, translate } from "@/i18n/client";
	import I18nKey from "@/i18n/i18nKey";
	import type { WalineInstance } from "../../public/vendor/waline/waline";
	import { onMount } from "svelte";

	export let serverURL = "";
	export let path = "";
	export let capApiEndpoint = "";
	export let capWidgetUrl = "";

	let container: HTMLDivElement | null = null;
	let waline: WalineInstance | null = null;
	let mounted = false;
	let syncQueue = Promise.resolve();
	let walineModulePromise: Promise<typeof import("../../public/vendor/waline/waline")> | null = null;

	let retryTimer: ReturnType<typeof setTimeout> | undefined;
	let retryCount = 0;
	let status: "loading" | "ready" | "error" = "loading";

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
			status = "ready";
			return;
		}

		const options = {
			serverURL: normalizedServerURL,
			path,
			lang: resolveWalineLanguage($language),
			dark: "html.dark",
			imageUploader: "s3" as const,
			capApiEndpoint: capApiEndpoint.trim(),
			capWidgetUrl: capWidgetUrl.trim().startsWith("/")
				? url(capWidgetUrl.trim())
				: capWidgetUrl.trim(),
		};

		if (!waline) {
			walineModulePromise ??= Promise.all([
				import(/* @vite-ignore */ new URL(url("/vendor/waline/waline.js"), window.location.origin).href) as Promise<typeof import("../../public/vendor/waline/waline")>,
				loadWalineStyle(),
			]).then(([module]) => module);
			const { init } = await walineModulePromise;
			if (!mounted || !container?.isConnected) return;

			waline = init({
				el: container,
				...options,
			});
			status = "ready";
			return;
		}

		waline.update(options);
	}

	function queueWalineSync(): void {
		if (!waline) status = "loading";
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
			} else if (retryTimer === undefined) {
				status = "error";
			}
		});
	}

	function retry(): void {
		retryCount = 0;
		queueWalineSync();
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

{#if status !== "ready"}
	<div class="flex items-center justify-center gap-3 py-10 text-50" role="status" aria-live="polite">
		{#if status === "loading"}
			<span class="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" aria-hidden="true"></span>
			<span>{translate(I18nKey.commentsLoading, $language)}</span>
		{:else}
			<button type="button" class="btn-plain rounded-lg px-4 py-2" on:click={retry}>
				{translate(I18nKey.commentsLoadFailed, $language)}
			</button>
		{/if}
	</div>
{/if}
<div bind:this={container} class="waline-root"></div>
