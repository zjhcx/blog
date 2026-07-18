import { h } from "hastscript";

const INVALID_DIRECTIVE =
	'Invalid directive. ("link" directive must be leaf type ::link{url="..." title="..." desc="..."})';

/**
 * Render a static link preview card from a Markdown leaf directive.
 *
 * @param {Record<string, unknown>} properties
 * @param {import('hast').RootContent[]} children
 * @returns {import('hast').Element}
 */
export function LinkCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "hidden" }, INVALID_DIRECTIVE);
	}

	const cover = typeof properties.cover === "string" ? properties.cover.trim() : "";
	const url = typeof properties.url === "string" ? properties.url.trim() : "";
	const title = typeof properties.title === "string" ? properties.title.trim() : "";
	const desc = typeof properties.desc === "string" ? properties.desc.trim() : "";

	if (!url || !title || !desc) {
		return h("div", { class: "hidden" }, INVALID_DIRECTIVE);
	}

	let hostname = url;
	try {
		hostname = new URL(url, "https://example.invalid").hostname || url;
	} catch {
		// Keep the original URL as the label when it cannot be parsed.
	}

	const card = h(
		"a",
		{
			class: "no-styling article-link-card",
			href: url,
			target: "_blank",
			rel: "noopener noreferrer",
			"aria-label": title,
		},
		[
			...(cover ? [h("div", { class: "article-link-card__cover-wrap" }, [
				h("img", {
					class: "article-link-card__cover",
					src: cover,
					alt: title,
					loading: "lazy",
					decoding: "async",
					referrerPolicy: "no-referrer",
				}),
			])] : []),
			h("div", { class: "article-link-card__body" }, [
				h("div", { class: "article-link-card__heading" }, [
					h("div", { class: "article-link-card__title" }, title),
					h("span", { class: "article-link-card__arrow", "aria-hidden": "true" }, "↗"),
			]),
			h("div", { class: "article-link-card__desc" }, desc),
			h("span", { class: "article-link-card__host", "aria-hidden": "true" }, hostname),
		]),
	],
	);

	return h("div", { class: "article-link-card-root" }, [
		h("style", {}, `
.article-link-card{position:relative;display:flex;width:100%;min-height:8.5rem;margin:1rem 0;overflow:hidden;border:1px solid var(--card-border);border-radius:var(--radius-large);color:var(--tw-prose-body);background:var(--card-bg);text-decoration:none;transition:transform .2s,box-shadow .2s}
.article-link-card:hover{transform:translateY(-2px);box-shadow:var(--card-shadow)}
.article-link-card:active{transform:translateY(0) scale(.99)}
.article-link-card:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.article-link-card__cover-wrap{width:36%;max-width:14rem;min-height:8.5rem;flex-shrink:0;overflow:hidden;background:var(--btn-regular-bg)}
.article-link-card__cover{width:100%;height:100%;margin:0;object-fit:cover;border-radius:0;transition:transform .3s}
.article-link-card:hover .article-link-card__cover{transform:scale(1.05)}
.article-link-card__body{display:flex;min-width:0;flex:1;flex-direction:column;justify-content:center;padding:1rem 1.25rem}
.article-link-card__heading{display:flex;align-items:flex-start;gap:.75rem}
.article-link-card__title{min-width:0;flex:1;overflow:hidden;color:var(--tw-prose-headings);font-size:1.125rem;font-weight:700;text-overflow:ellipsis;white-space:nowrap;transition:color .2s}
.article-link-card:hover .article-link-card__title{color:var(--primary)}
.article-link-card__arrow{flex-shrink:0;color:var(--primary);font-size:1.25rem;line-height:1.5rem;transition:transform .2s}
.article-link-card:hover .article-link-card__arrow{transform:translate(.125rem,-.125rem)}
.article-link-card__desc{display:-webkit-box;overflow:hidden;margin-top:.25rem;color:var(--tw-prose-body);font-size:.875rem;line-height:1.5rem;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.article-link-card__host{overflow:hidden;margin-top:.5rem;color:var(--tw-prose-body);font-size:.75rem;text-overflow:ellipsis;white-space:nowrap;opacity:.7}
@media(max-width:40rem){.article-link-card{flex-direction:column}.article-link-card__cover-wrap{width:100%;max-width:none;min-height:0;aspect-ratio:16/9}}
@media(prefers-reduced-motion:reduce){.article-link-card,.article-link-card__cover,.article-link-card__title,.article-link-card__arrow{transition:none}}
`),
		card,
	]);
}
