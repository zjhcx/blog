<script lang="ts">
	import { language, translate } from "@/i18n/client";
	import Key from "@/i18n/i18nKey";
	import type { MusicTrack } from "@/utils/music";

	export let tracks: MusicTrack[] = [];
	export let musicPageUrl = "/music/";

	let audio: HTMLAudioElement | null = null;
	let currentIndex = 0;
	let currentTime = 0;
	let duration = 0;
	let isPlaying = false;
	let volume = 0.7;
	let isMuted = false;

	$: currentTrack = tracks[currentIndex] ?? null;
	$: progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	$: volumeProgress = (isMuted ? 0 : volume) * 100;

	function formatTime(seconds: number): string {
		if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
		const minutes = Math.floor(seconds / 60);
		const remain = Math.floor(seconds % 60);
		return `${minutes}:${String(remain).padStart(2, "0")}`;
	}

	function updatePlayState(next: boolean): void {
		isPlaying = next;
	}

	function loadTrack(index: number, autoplay = false): void {
		if (tracks.length === 0) return;
		currentIndex = (index + tracks.length) % tracks.length;
		currentTime = 0;
		duration = 0;

		if (!audio || !currentTrack) return;
		audio.src = currentTrack.sourceUrl;
		audio.load();

		if (autoplay) {
			audio.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
		} else {
			updatePlayState(false);
		}
	}

	function togglePlay(): void {
		if (!audio || !currentTrack) return;
		if (audio.paused) {
			audio.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
			return;
		}
		audio.pause();
		updatePlayState(false);
	}

	function toggleMute(): void {
		if (!audio) return;
		isMuted = !isMuted;
		audio.muted = isMuted;
	}

	function playNext(): void {
		loadTrack(currentIndex + 1, true);
	}

	function playPrevious(): void {
		loadTrack(currentIndex - 1, true);
	}

	function seek(event: MouseEvent): void {
		if (!audio || !duration) return;
		const element = event.currentTarget;
		if (!(element instanceof HTMLElement)) return;
		const rect = element.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		audio.currentTime = ratio * duration;
	}

	function changeVolume(event: MouseEvent): void {
		if (!audio) return;
		const element = event.currentTarget;
		if (!(element instanceof HTMLElement)) return;
		const rect = element.getBoundingClientRect();
		volume = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		isMuted = false;
		audio.volume = volume;
		audio.muted = false;
	}

	function onTimeUpdate(): void {
		if (!audio) return;
		currentTime = audio.currentTime;
		duration = audio.duration || 0;
	}

	function onAudioReady(): void {
		if (!audio) return;
		audio.volume = volume;
		audio.muted = isMuted;
		onTimeUpdate();
	}
</script>

{#if tracks.length === 0}
	<div class="rounded-xl border border-white/10 bg-white/30 px-4 py-4 text-sm text-50 dark:bg-white/5">
		{translate(Key.musicEmpty, $language)}
	</div>
{:else}
	<div class="firefly-music-player relative w-full transition-all duration-300 text-90">
		<div class="mb-2 flex items-center gap-2 px-1">
			<div class="group relative h-11 w-11 shrink-0">
				<a
					href={musicPageUrl}
					class="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[rgba(var(--primary),0.1)] shadow-lg dark:border-neutral-700"
					aria-label={translate(Key.music, $language)}
				>
					<svg
						viewBox="0 0 24 24"
						aria-hidden="true"
						class:hidden={!!currentTrack?.cover}
						class="absolute text-xl text-[rgb(var(--primary))] opacity-40"
					>
						<path
							d="M10 21q-1.65 0-2.825-1.175T6 17t1.175-2.825T10 13q.575 0 1.063.138t.937.412V4q0-.425.288-.712T13 3h4q.425 0 .713.288T18 4v2q0 .425-.288.713T17 7h-3v10q0 1.65-1.175 2.825T10 21"
							fill="currentColor"
						/>
					</svg>
					{#if currentTrack?.cover}
						<img
							class:animate-spin-slow={isPlaying}
							class="music-cover relative z-10 h-full w-full object-cover transition-opacity duration-300"
							src={currentTrack.cover}
							alt={currentTrack.title}
							loading="lazy"
							referrerpolicy="no-referrer"
							style={`animation-play-state: ${isPlaying ? "running" : "paused"};`}
						/>
					{/if}
				</a>
			</div>

			<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
				<div class="flex items-center justify-between gap-2 overflow-hidden">
					<div class="relative min-w-0 flex-1 overflow-hidden">
						<a href={musicPageUrl} class="block min-w-0">
							<h3 class="music-title truncate text-base font-bold leading-tight text-90">
								{currentTrack?.title}
							</h3>
						</a>
					</div>
				</div>

				<div class="min-w-0 overflow-hidden">
					<p class="music-artist truncate text-xs font-medium text-50">
						{currentTrack?.artist || translate(Key.musicUnknownArtist, $language)}
					</p>
				</div>

				<div class="flex h-5 items-center gap-3 text-neutral-400">
					<div class="flex h-full shrink-0 items-center gap-1 font-mono text-[10px]" aria-live="polite">
						<span class="current-time text-50">{formatTime(currentTime)}</span>
						<span class="opacity-50" aria-hidden="true">/</span>
						<span class="total-time text-50">
							{currentTrack?.duration || formatTime(duration)}
						</span>
					</div>

					<div class="ml-auto flex h-full items-center gap-1 bg-transparent">
						<button
							class="btn-mute flex items-center rounded-md p-0.5 text-neutral-400 transition-all duration-300 hover:text-[rgb(var(--primary))] active:scale-95"
							type="button"
							aria-label="Volume"
							on:click={toggleMute}
						>
							{#if isMuted || volume === 0}
								<svg viewBox="0 0 24 24" aria-hidden="true" class="text-lg">
									<path
										d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71 0 1.2-.31 2.33-.86 3.32l1.46 1.46A8.94 8.94 0 0 0 21 12c0-4.29-3-7.89-7-8.77zm5 18.77L4 7l-1.41 1.41 5.08 5.08L7 14H3v-4h4l5-5v6.17l5.59 5.59c-.45.37-.95.69-1.5.94V21zM16.5 12c0-.83-.23-1.61-.63-2.28l1.51 1.51c.07.25.12.5.12.77 0 .42-.08.82-.2 1.2l-1.45-1.45c.08-.24.15-.49.15-.75zM12 3 9.91 5.09 12 7.18z"
										fill="currentColor"
									></path>
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" aria-hidden="true" class="text-lg">
									<path
										d="M3 10v4h4l5 5V5L7 10zm12.5 2a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 15.5 12M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"
										fill="currentColor"
									></path>
								</svg>
							{/if}
						</button>
						<div class="flex w-16 items-center transition-all duration-300 ease-out">
							<button
								type="button"
								class="vol-container relative ml-1 h-1 w-16 cursor-pointer rounded-full bg-neutral-200 dark:bg-neutral-600"
								role="slider"
								aria-label="Volume"
								aria-valuemin="0"
								aria-valuemax="100"
								aria-valuenow={Math.round(volumeProgress)}
								on:click={changeVolume}
							>
								<span
									class="vol-bar absolute left-0 top-0 h-full rounded-full bg-[rgb(var(--primary))]"
									style={`width: ${volumeProgress}%`}
								></span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="px-1">
			<button
				type="button"
				class="progress-container group relative mb-2 mt-2 h-1 w-full cursor-pointer touch-none rounded-full bg-neutral-100 dark:bg-neutral-700/50"
				role="slider"
				aria-label={translate(Key.musicNowPlaying, $language)}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={Math.round(progress)}
				on:click={seek}
			>
				<span
					class="progress-bar absolute left-0 top-0 h-full rounded-full bg-[rgb(var(--primary))] transition-[width] duration-100"
					style={`width: ${progress}%`}
				></span>
				<span
					class="progress-thumb absolute top-1/2 h-3 w-3 rounded-full bg-[rgb(var(--primary))] shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-100 dark:ring-neutral-800"
					style={`left: ${progress}%; transform: translate(-50%, -50%) scale(1);`}
				></span>
			</button>
		</div>

		<div class="flex select-none items-center justify-between px-1">
			<button
				class="btn-prev p-2 text-neutral-600 transition-colors hover:text-[rgb(var(--primary))] active:scale-95 dark:text-neutral-300"
				type="button"
				aria-label={translate(Key.musicPrevious, $language)}
				on:click={playPrevious}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" class="text-3xl">
					<path
						d="M16.7 5.4a1 1 0 0 0-1.6-.8l-8.4 6.4a1 1 0 0 0 0 1.6l8.4 6.4a1 1 0 0 0 1.6-.8zm-10.8-.2H4.1v13.6h1.8z"
						fill="currentColor"
					/>
				</svg>
			</button>

			<button
				class="btn-play flex h-12 w-12 items-center justify-center rounded-full bg-[var(--btn-regular-bg)] text-[rgb(var(--primary))] transition-all duration-300 hover:bg-[var(--btn-regular-bg-hover)] active:bg-[var(--btn-regular-bg-active)]"
				type="button"
				aria-label={isPlaying
					? translate(Key.musicPause, $language)
					: translate(Key.musicPlay, $language)}
				on:click={togglePlay}
			>
				{#if isPlaying}
					<svg viewBox="0 0 24 24" aria-hidden="true" class="text-3xl">
						<path d="M7 5.2h3.2v13.6H7zm6.8 0H17v13.6h-3.2z" fill="currentColor"></path>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true" class="ml-0.5 text-3xl">
						<path
							d="M8 5.8a1 1 0 0 1 1.5-.9l8 5.1a1 1 0 0 1 0 1.7l-8 5.1A1 1 0 0 1 8 16z"
							fill="currentColor"
						></path>
					</svg>
				{/if}
			</button>

			<button
				class="btn-next p-2 text-neutral-600 transition-colors hover:text-[rgb(var(--primary))] active:scale-95 dark:text-neutral-300"
				type="button"
				aria-label={translate(Key.musicNext, $language)}
				on:click={playNext}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" class="text-3xl">
					<path
						d="M7.3 5.4a1 1 0 0 1 1.6-.8l8.4 6.4a1 1 0 0 1 0 1.6l-8.4 6.4a1 1 0 0 1-1.6-.8zm10.8-.2h1.8v13.6h-1.8z"
						fill="currentColor"
					/>
				</svg>
			</button>
		</div>

		<audio
			bind:this={audio}
			src={currentTrack?.sourceUrl}
			preload="metadata"
			referrerpolicy="no-referrer"
			on:loadedmetadata={onAudioReady}
			on:timeupdate={onTimeUpdate}
			on:play={() => updatePlayState(true)}
			on:pause={() => updatePlayState(false)}
			on:ended={playNext}
		></audio>
	</div>
{/if}
