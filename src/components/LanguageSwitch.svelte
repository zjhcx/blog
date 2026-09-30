<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	applyLanguage,
	getCurrentLanguage,
	language,
	languageLoading,
	type SupportedLanguage,
	setLanguage,
	supportedLanguages,
	translate,
} from "@/i18n/client";

onMount(() => {
	void applyLanguage(getCurrentLanguage());

	const handlePointerDown = (event: PointerEvent) => {
		const target = event.target;
		if (!(target instanceof Node)) return;
		const wrapper = document.querySelector("#language-switch-wrapper");
		if (!wrapper?.contains(target)) {
			hidePanel();
		}
	};

	document.addEventListener("pointerdown", handlePointerDown);
	return () => {
		document.removeEventListener("pointerdown", handlePointerDown);
	};
});

function getPanel(): Element | null {
	return document.querySelector("#language-panel");
}

function showPanel() {
	const panel = getPanel();
	panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = getPanel();
	panel?.classList.add("float-panel-closed");
}

function togglePanel() {
	const panel = getPanel();
	if (!panel) return;
	panel.classList.toggle("float-panel-closed");
}

function chooseLanguage(lang: SupportedLanguage) {
	void setLanguage(lang);
	hidePanel();
}
</script>

<div id="language-switch-wrapper" class="relative z-50" role="menu" tabindex="-1">
	<button
		aria-label={translate(I18nKey.language, $language)}
		data-i18n-aria-key={I18nKey.language}
		role="menuitem"
		class="relative btn-plain scale-animation rounded-xl h-11 w-11 active:scale-90"
		id="language-switch"
		onclick={togglePanel}
	>
		<Icon icon="material-symbols:translate-rounded" class="text-[1.25rem]"></Icon>
	</button>

	<div
		id="language-panel"
		class="absolute transition float-panel-closed top-11 -right-2 pt-5"
	>
		<div class="card-base float-panel p-2 min-w-36">
			{#each supportedLanguages as item}
				<button
					class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-xl h-9 px-3 font-medium active:scale-95 mb-0.5"
					class:current-theme-btn={$language === item.code}
					onclick={() => chooseLanguage(item.code)}
				>
					<span class="w-5 mr-2 text-[var(--primary)]">
						{#if $language === item.code}
							<Icon icon="material-symbols:check-rounded" class="text-[1.1rem]"></Icon>
						{/if}
					</span>
					{item.label}
				</button>
			{/each}
		</div>
	</div>
</div>

{#if $languageLoading}
	<div class="language-loading text-90" role="alert" aria-live="assertive">
		<div class="language-loading__dialog card-base">
			<Icon icon="material-symbols:translate-rounded" class="language-loading__icon"></Icon>
			<div class="language-loading__spinner" aria-hidden="true"></div>
			<p data-i18n-key={I18nKey.languageLoading}>
				{translate(I18nKey.languageLoading, $language)}
			</p>
		</div>
	</div>
{/if}

<style>
	.language-loading {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: grid;
		pointer-events: auto;
		place-items: center;
		padding: 1rem;
		background: rgb(0 0 0 / 45%);
		backdrop-filter: blur(8px);
	}

	.language-loading__dialog {
		display: grid;
		grid-template-columns: auto auto;
		align-items: center;
		gap: 0.75rem 1rem;
		min-width: min(20rem, 90vw);
		padding: 1.25rem 1.5rem;
	}

	.language-loading__icon {
		font-size: 1.5rem;
		color: var(--primary);
	}

	.language-loading__spinner {
		justify-self: end;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		opacity: 0.65;
		animation: language-loading-spin 0.7s linear infinite;
	}

	.language-loading__dialog p {
		grid-column: 1 / -1;
		margin: 0;
		text-align: center;
	}

	@keyframes language-loading-spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.language-loading__spinner { animation-duration: 1.5s; }
	}
</style>
