import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const option = (name, fallback) => {
	const index = args.indexOf(name);
	return index === -1 ? fallback : args[index + 1];
};
const inputPath = path.resolve(option("--input", "../tg_timeline/messages.json"));
const outputDir = path.resolve(option("--output", "public/timeline"));
const chunkSize = Math.max(Number.parseInt(option("--chunk-size", "30"), 10) || 30, 1);
const manifestPath = path.join(outputDir, "manifest.json");
const statePath = path.join(outputDir, "generation-state.json");
const readJson = async (file, fallback) => {
	try { return JSON.parse(await readFile(file, "utf8")); }
	catch (error) { if (error?.code === "ENOENT") return fallback; throw error; }
};
const payload = await readJson(inputPath, []);
const sourceMessages = Array.isArray(payload) ? payload : payload.messages;
if (!Array.isArray(sourceMessages)) throw new TypeError("Input must be an array or { messages: [] }");
const parsed = sourceMessages.map((message, index) => {
	const id = String(message?.id ?? "").trim();
	const time = String(message?.time ?? "").trim();
	const content = String(message?.content ?? "").trim();
	const invalid = [];
	if (!id) invalid.push("id");
	if (!time || Number.isNaN(Date.parse(time))) invalid.push("ISO-8601 time");
	if (invalid.length > 0) {
		throw new TypeError(`Message at index ${index} is missing or has invalid: ${invalid.join(", ")}`);
	}
	return { id, time: new Date(time).toISOString(), content };
});
const compareIds = (a, b) => {
	try { return BigInt(a) > BigInt(b) ? 1 : BigInt(a) < BigInt(b) ? -1 : 0; }
	catch { return a.localeCompare(b, undefined, { numeric: true }); }
};
const normalized = parsed.filter((message) => message.content.length > 0);
const skipped = parsed.length - normalized.length;
if (skipped > 0) console.warn(`Timeline: skipped ${skipped} message(s) with empty content.`);
const oldManifest = await readJson(manifestPath, { version: 1, chunks: [], total: 0 });
const oldState = await readJson(statePath, { lastMessageId: null, lastMessageTime: null });
const fresh = oldState.lastMessageId ? normalized.filter((item) => compareIds(item.id, oldState.lastMessageId) > 0) : normalized;
fresh.sort((a, b) => Date.parse(b.time) - Date.parse(a.time) || -compareIds(a.id, b.id));
await mkdir(outputDir, { recursive: true });
const newChunks = [];
for (let index = 0; index < fresh.length; index += chunkSize) {
	const items = fresh.slice(index, index + chunkSize);
	const newest = items[0];
	const oldest = items.at(-1);
	const file = `chunk-${oldest.id}-${newest.id}.json`;
	await writeFile(path.join(outputDir, file), `${JSON.stringify({ items }, null, 2)}\n`);
	newChunks.push({ file, count: items.length, newestTime: newest.time, oldestTime: oldest.time });
}
const chunks = [...new Map([...newChunks, ...(Array.isArray(oldManifest.chunks) ? oldManifest.chunks : [])].map((chunk) => [chunk.file, chunk])).values()];
const generatedAt = new Date().toISOString();
const manifest = { version: 1, generatedAt, total: chunks.reduce((sum, chunk) => sum + Number(chunk.count || 0), 0), chunks };
const cursorCandidates = oldState.lastMessageId ? parsed.filter((item) => compareIds(item.id, oldState.lastMessageId) > 0) : parsed;
cursorCandidates.sort((a, b) => -compareIds(a.id, b.id));
const latestCursor = cursorCandidates[0];
const state = { version: 1, lastMessageId: latestCursor?.id ?? oldState.lastMessageId ?? null, lastMessageTime: latestCursor?.time ?? oldState.lastMessageTime ?? null, generatedAt };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
console.log(`Timeline: ${fresh.length} new message(s), ${newChunks.length} new chunk(s).`);
