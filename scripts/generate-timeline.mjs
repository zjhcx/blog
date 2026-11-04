import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const options = new Map();
for (let index = 0; index < args.length; index += 2) {
	const name = args[index], value = args[index + 1];
	if (!["--input", "--api-url", "--output", "--chunk-size"].includes(name) || !value || value.startsWith("--")) {
		throw new TypeError("Use --input <file> or --api-url <Worker URL>, --output <directory>, --chunk-size <positive integer>");
	}
	options.set(name, value);
}
if (options.has("--input") && options.has("--api-url")) throw new TypeError("Choose either --input or --api-url");
const apiUrl = options.has("--input") ? undefined : options.get("--api-url") ?? process.env.TIMELINE_API_URL;
const inputPath = path.resolve(options.get("--input") ?? "../tg_timeline/messages.json");
const outputDir = path.resolve(options.get("--output") ?? "public/timeline");
const chunkSize = Number(options.get("--chunk-size") ?? "30");
if (!Number.isSafeInteger(chunkSize) || chunkSize < 1) throw new TypeError("Chunk size must be a positive integer");
const manifestPath = path.join(outputDir, "manifest.json");
const statePath = path.join(outputDir, "generation-state.json");
const readJson = async (file, fallback) => {
	try { return JSON.parse(await readFile(file, "utf8")); }
	catch (error) { if (error?.code === "ENOENT" && fallback !== undefined) return fallback; throw error; }
};
const parseId = (value) => {
	if (typeof value === "number" && !Number.isSafeInteger(value)) throw new TypeError("Message IDs must not lose integer precision");
	if (!["number", "string"].includes(typeof value) || !/^\d+$/.test(String(value))) throw new TypeError("Message IDs must be non-negative decimal integer strings");
	return BigInt(value).toString();
};
const compareIds = (a, b) => BigInt(a) > BigInt(b) ? 1 : BigInt(a) < BigInt(b) ? -1 : 0;
const oldManifest = await readJson(manifestPath, { version: 1, chunks: [], total: 0 });
const oldState = await readJson(statePath, { lastMessageId: null, lastMessageTime: null });
if (!oldManifest || !Array.isArray(oldManifest.chunks) || !oldState || typeof oldState !== "object" || Array.isArray(oldState)) throw new TypeError("Invalid timeline manifest or generation state");
const cursor = oldState.lastMessageId == null ? "0" : parseId(oldState.lastMessageId);
let payload;
if (apiUrl) {
	const url = new URL(apiUrl);
	if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) throw new TypeError("Worker URL must use HTTPS (HTTP is allowed only on loopback)");
	if (url.username || url.password) throw new TypeError("Do not put credentials in the Worker URL");
	if (url.pathname === "/") url.pathname = "/messages.json";
	url.searchParams.set("lastMessageId", cursor);
	const token = process.env.EXPORT_TOKEN;
	if (!token || /[\r\n]/.test(token)) throw new TypeError("Set EXPORT_TOKEN in the generator environment");
	let response;
	try {
		response = await fetch(url, {
			headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
			cache: "no-store", redirect: "error", signal: AbortSignal.timeout(120_000),
		});
	} catch { throw new Error("Timeline Worker request failed; existing output and cursor were not changed"); }
	if (!response.ok) throw new Error(`Timeline Worker returned HTTP ${response.status}; existing output and cursor were not changed`);
	payload = await response.json();
} else {
	// Missing input is an error, not a successful empty synchronization.
	payload = await readJson(inputPath);
}
const sourceMessages = Array.isArray(payload) ? payload : payload?.messages;
if (!Array.isArray(sourceMessages)) throw new TypeError("Input must be an array or { messages: [] }");
const byId = new Map();
for (const [index, message] of sourceMessages.entries()) {
	const id = parseId(message?.id);
	const time = message?.time;
	if (typeof time !== "string" || !/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(time) || Number.isNaN(Date.parse(time)) || typeof message?.content !== "string") {
		throw new TypeError(`Message at index ${index} requires an ISO-8601 time with timezone and string content`);
	}
	byId.set(id, { id, time: new Date(time).toISOString(), content: message.content });
}
const parsed = [...byId.values()].filter((item) => compareIds(item.id, cursor) > 0);
const normalized = parsed.filter((item) => item.content.trim().length > 0);
const skipped = parsed.length - normalized.length;
if (skipped > 0) console.warn(`Timeline: skipped ${skipped} message(s) with empty content.`);
// A previous run may have published the manifest before failing to commit the
// cursor. Exclude already-published IDs so that retrying cannot duplicate them.
const publishedIds = new Set();
if (normalized.length > 0) {
	for (const chunk of oldManifest.chunks) {
		if (typeof chunk.file !== "string" || path.basename(chunk.file) !== chunk.file || !/^chunk-[\w-]+\.json$/.test(chunk.file)) throw new TypeError("Invalid timeline chunk filename");
		const existing = await readJson(path.join(outputDir, chunk.file));
		if (!Array.isArray(existing.items)) throw new TypeError("Invalid timeline chunk");
		for (const item of existing.items) publishedIds.add(parseId(item.id));
	}
}
const fresh = normalized.filter((item) => !publishedIds.has(item.id));
fresh.sort((a, b) => Date.parse(b.time) - Date.parse(a.time) || -compareIds(a.id, b.id));
await mkdir(outputDir, { recursive: true });
const atomicWrite = async (file, contents) => {
	const temporary = `${file}.${randomUUID()}.tmp`;
	try {
		await writeFile(temporary, contents, { flag: "wx" });
		await rename(temporary, file);
	} finally { await rm(temporary, { force: true }); }
};
const newChunks = [];
for (let index = 0; index < fresh.length; index += chunkSize) {
	const items = fresh.slice(index, index + chunkSize);
	const newest = items[0], oldest = items.at(-1);
	const contents = `${JSON.stringify({ items }, null, 2)}\n`;
	// Content-addressing keeps published chunk URLs immutable even after retries.
	const hash = createHash("sha256").update(contents).digest("hex").slice(0, 16);
	const file = `chunk-${oldest.id}-${newest.id}-${hash}.json`;
	await atomicWrite(path.join(outputDir, file), contents);
	newChunks.push({ file, count: items.length, newestTime: newest.time, oldestTime: oldest.time });
}
const chunks = [...newChunks, ...oldManifest.chunks].sort((a, b) => Date.parse(b.newestTime) - Date.parse(a.newestTime));
const generatedAt = new Date().toISOString();
const manifest = { version: 1, generatedAt, total: chunks.reduce((sum, chunk) => sum + Number(chunk.count || 0), 0), chunks };
parsed.sort((a, b) => -compareIds(a.id, b.id));
const latestCursor = parsed[0];
const state = { version: 1, lastMessageId: latestCursor?.id ?? cursor, lastMessageTime: latestCursor?.time ?? oldState.lastMessageTime ?? null, generatedAt };
// Never commit completion before every chunk and the manifest is published.
await atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await atomicWrite(statePath, `${JSON.stringify(state, null, 2)}\n`);
console.log(`Timeline: ${fresh.length} new message(s), ${newChunks.length} new chunk(s).`);
