<script lang="ts">
import { onMount } from "svelte";

export let slug: string;
export let label: string;
export let source: "json" | "api" = "json";
export let initialCount: number | undefined = undefined;
export let apiUrl = "";

let count = initialCount;

onMount(async () => {
	if (source !== "api" || !apiUrl) return;

	const sessionKey = `post-view:${slug}`;
	const shouldIncrement = sessionStorage.getItem(sessionKey) !== "1";
	const action = shouldIncrement ? "add" : "get";
	const endpoint = `${apiUrl.replace(/\/$/, "")}/${action}?path=${encodeURIComponent(slug)}`;

	try {
		const response = await fetch(endpoint, {
			method: "GET",
			headers: { Accept: "application/json" },
		});
		if (!response.ok) return;

		const payload: unknown = await response.json();
		if (typeof payload === "number" && Number.isSafeInteger(payload) && payload >= 0) {
			count = payload;
			if (shouldIncrement) sessionStorage.setItem(sessionKey, "1");
		}
	} catch {
		// Keep the non-blocking placeholder when the statistics service is unavailable.
	}
});
</script>

<div class="flex flex-row items-center" aria-label={label}>
	<div class="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 flex items-center justify-center mr-2">
		<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="currentColor">
			<path d="M12 4.5C6.5 4.5 2 8 0 12c2 4 6.5 7.5 12 7.5S22 16 24 12c-2-4-6.5-7.5-12-7.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
		</svg>
	</div>
	<div class="text-sm" aria-live="polite">
		{count === undefined ? "--" : count.toLocaleString()} {label}
	</div>
</div>
