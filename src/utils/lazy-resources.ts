/** Retry transient resource failures without retaining a rejected promise. */
export async function retryResource<T>(load: () => Promise<T>): Promise<T> {
	for (let attempt = 0; ; attempt++) {
		try {
			return await load();
		} catch (error) {
			if (attempt >= 2) throw error;
			await new Promise<void>((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
		}
	}
}

const pendingStyles = new Map<string, { link: HTMLLinkElement; promise: Promise<void> }>();

export function loadStylesheet(href: string): Promise<void> {
	const existing = Array.from(document.querySelectorAll<HTMLLinkElement>("link[data-lazy-style]"))
		.find((link) => link.dataset.lazyStyle === href);
	if (existing?.sheet) return Promise.resolve();
	const pending = pendingStyles.get(href);
	if (pending && pending.link === existing && existing?.isConnected) return pending.promise;

	const link = existing ?? document.createElement("link");
	const promise = new Promise<void>((resolve, reject) => {
		const cleanup = () => {
			clearTimeout(timeout);
			link.removeEventListener("load", onLoad);
			link.removeEventListener("error", onError);
		};
		const onLoad = () => { cleanup(); resolve(); };
		const onError = () => {
			cleanup();
			link.remove();
			reject(new Error(`Failed to load stylesheet: ${href}`));
		};
		const timeout = setTimeout(onError, 15000);
		link.addEventListener("load", onLoad, { once: true });
		link.addEventListener("error", onError, { once: true });
		if (!existing) {
			link.rel = "stylesheet";
			link.href = href;
			link.dataset.lazyStyle = href;
			document.head.appendChild(link);
		}
	}).finally(() => {
		if (pendingStyles.get(href)?.link === link) pendingStyles.delete(href);
	});
	pendingStyles.set(href, { link, promise });
	return promise;
}
