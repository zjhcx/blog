<script lang="ts">
	import { onMount } from "svelte";
	import { language, translate } from "@/i18n/client";
	import I18nKey from "@/i18n/i18nKey";
	type Item = { id: string; time: string; content: string };
	type Chunk = { file: string; count: number };
	let items: Item[] = [], chunks: Chunk[] = [];
	let nextChunk = 0, loading = true, error = "";
	const loadMore = async () => {
		if (loading || nextChunk >= chunks.length) return;
		loading = true;
		try {
			const response = await fetch(`/timeline/${chunks[nextChunk].file}`);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const payload = await response.json() as { items?: Item[] };
			if (!Array.isArray(payload.items)) throw new Error("Invalid timeline chunk");
			items = [...items, ...payload.items]; nextChunk += 1;
		} catch (reason) { error = reason instanceof Error ? reason.message : String(reason); }
		finally { loading = false; }
	};
	onMount(async () => {
		try {
			const response = await fetch("/timeline/manifest.json", { cache: "no-cache" });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const manifest = await response.json() as { chunks?: Chunk[] };
			chunks = Array.isArray(manifest.chunks) ? manifest.chunks : [];
		} catch (reason) { error = reason instanceof Error ? reason.message : String(reason); }
		finally { loading = false; }
		await loadMore();
	});
	const formatTime = (value: string) => new Intl.DateTimeFormat($language.replace("_", "-"), {
		year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
	}).format(new Date(value));
</script>

<div class="timeline-page">
	<section class="timeline-hero card-base"><h1 class="text-90">{translate(I18nKey.timeline, $language)}</h1><p class="text-50">{translate(I18nKey.timelineDescription, $language)}</p></section>
	{#if error}<section class="timeline-state card-base text-50">{translate(I18nKey.timelineLoadFailed, $language)}{error}</section>
	{:else if !loading && items.length === 0}<section class="timeline-state card-base text-50">{translate(I18nKey.timelineEmpty, $language)}</section>{/if}
	{#if items.length > 0}
		<section class="timeline-list" aria-label={translate(I18nKey.timeline, $language)}>
			{#each items as item (item.id)}<article class="timeline-entry card-base"><div class="timeline-marker" aria-hidden="true"></div><time class="text-50" datetime={item.time}>{formatTime(item.time)}</time><p class="text-90">{item.content}</p></article>{/each}
		</section>
	{/if}
	{#if !error && nextChunk < chunks.length}<button class="load-more btn-regular" type="button" disabled={loading} onclick={loadMore}>{loading ? translate(I18nKey.timelineLoading, $language) : translate(I18nKey.timelineLoadMore, $language)}</button>{/if}
</div>

<style>
	.timeline-page { display: flex; flex-direction: column; gap: 1rem; }
	.timeline-hero, .timeline-state { padding: 1.5rem; }
	.timeline-hero h1 { margin: 0 0 .5rem; font-size: 2rem; font-weight: 700; }
	.timeline-hero p, .timeline-entry p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
	.timeline-list { position: relative; display: flex; flex-direction: column; gap: 1rem; padding-left: 1.5rem; }
	.timeline-list::before { content: ""; position: absolute; left: .45rem; top: 1rem; bottom: 1rem; width: 2px; background: color-mix(in oklch, var(--primary) 30%, transparent); }
	.timeline-entry { position: relative; padding: 1.25rem; }
	.timeline-marker { position: absolute; left: -1.43rem; top: 1.45rem; width: .8rem; height: .8rem; border: 3px solid var(--card-bg); border-radius: 50%; background: var(--primary); box-sizing: content-box; }
	.timeline-entry time { display: block; margin-bottom: .65rem; font-size: .85rem; }
	.load-more { align-self: center; min-width: 9rem; padding: .75rem 1.25rem; }
	.load-more:disabled { cursor: wait; opacity: .6; }
</style>
