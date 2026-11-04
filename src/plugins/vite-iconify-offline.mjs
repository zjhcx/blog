// Vite plugin: exposes `virtual:iconify-offline`, a tiny IconifyJSON bundle that
// contains only the icons referenced by Svelte components using @iconify/svelte.
// This removes the runtime dependency on api.iconify.design.
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const VIRTUAL_ID = "virtual:iconify-offline";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const ICON_NAME = /["'`]([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)["'`]/g;
const require = createRequire(import.meta.url);

function listSvelteFiles(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...listSvelteFiles(full));
		else if (entry.name.endsWith(".svelte")) out.push(full);
	}
	return out;
}

function collectIconNames(srcDir) {
	const byPrefix = new Map();
	for (const file of listSvelteFiles(srcDir)) {
		const code = readFileSync(file, "utf8");
		if (!code.includes("@iconify/svelte")) continue;
		for (const [, prefix, name] of code.matchAll(ICON_NAME)) {
			if (!byPrefix.has(prefix)) byPrefix.set(prefix, new Set());
			byPrefix.get(prefix).add(name);
		}
	}
	return byPrefix;
}

function loadIconSet(prefix) {
	try {
		return JSON.parse(readFileSync(require.resolve(`@iconify-json/${prefix}/icons.json`), "utf8"));
	} catch {
		return null; // not an icon prefix (e.g. a "0:00" string) or set not installed
	}
}

function pickIcons(set, names) {
	const result = { prefix: set.prefix, icons: {}, aliases: {} };
	for (const key of ["width", "height", "left", "top"]) {
		if (set[key] !== undefined) result[key] = set[key];
	}
	const missing = [];
	const add = (name, depth = 0) => {
		if (depth > 5) return false;
		if (set.icons[name]) {
			result.icons[name] = set.icons[name];
			return true;
		}
		const alias = set.aliases?.[name];
		if (alias && add(alias.parent, depth + 1)) {
			result.aliases[name] = alias;
			return true;
		}
		return false;
	};
	for (const name of names) if (!add(name)) missing.push(name);
	return { result, missing };
}

export function iconifyOffline({ srcDir = path.resolve("src") } = {}) {
	return {
		name: "iconify-offline",
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
		},
		load(id) {
			if (id !== RESOLVED_ID) return;
			const collections = [];
			for (const [prefix, names] of collectIconNames(srcDir)) {
				const set = loadIconSet(prefix);
				if (!set) continue;
				const { result, missing } = pickIcons(set, names);
				if (missing.length) this.warn(`Unknown ${prefix} icons: ${missing.join(", ")}`);
				if (Object.keys(result.icons).length) collections.push(result);
			}
			return `export default ${JSON.stringify(collections)};`;
		},
	};
}
