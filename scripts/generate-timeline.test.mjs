import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const generator = fileURLToPath(new URL("./generate-timeline.mjs", import.meta.url));
const token = "timeline-test-secret";
const message = (id, content = `Message ${id}`, time = "2025-01-01T12:00:00Z") => ({ id, time, content });

async function fixture(t) {
	const root = await mkdtemp(path.join(os.tmpdir(), "generate-timeline-test-"));
	// The target is the exact directory returned by mkdtemp, never a project path.
	t.after(() => rm(root, { recursive: true, force: true }));
	const input = path.join(root, "messages.json");
	const output = path.join(root, "timeline");
	return {
		root, input, output,
		writeInput: (payload) => writeFile(input, JSON.stringify(payload)),
		read: async (name) => JSON.parse(await readFile(path.join(output, name), "utf8")),
		run(args = ["--input", input], env = {}) {
			return new Promise((resolve, reject) => {
				const childEnv = { ...process.env };
				delete childEnv.TIMELINE_API_URL;
				delete childEnv.EXPORT_TOKEN;
				const child = spawn(process.execPath, [generator, ...args, "--output", output], {
					cwd: root,
					env: { ...childEnv, ...env },
					stdio: ["ignore", "pipe", "pipe"],
				});
				let stdout = "", stderr = "";
				child.stdout.setEncoding("utf8").on("data", (data) => { stdout += data; });
				child.stderr.setEncoding("utf8").on("data", (data) => { stderr += data; });
				const timeout = setTimeout(() => child.kill("SIGKILL"), 15_000);
				child.once("error", (error) => { clearTimeout(timeout); reject(error); });
				child.once("close", (code, signal) => {
					clearTimeout(timeout);
					resolve({ code, signal, stdout, stderr });
				});
			});
		},
	};
}

function succeeds(result) {
	assert.equal(result.signal, null, `Generator terminated: ${result.signal}\n${result.stderr}`);
	assert.equal(result.code, 0, result.stderr);
}

function fails(result) {
	assert.equal(result.signal, null, `Generator timed out or terminated: ${result.signal}`);
	assert.notEqual(result.code, 0, "Generator unexpectedly succeeded");
}

async function published(f) {
	const manifest = await f.read("manifest.json");
	const chunks = await Promise.all(manifest.chunks.map(({ file }) => f.read(file)));
	return { manifest, items: chunks.flatMap(({ items }) => items) };
}

async function snapshot(f) {
	try {
		const names = (await readdir(f.output)).sort();
		return Object.fromEntries(await Promise.all(names.map(async (name) => [name, await readFile(path.join(f.output, name), "utf8")])));
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

async function worker(t, respond) {
	const requests = [];
	const server = createServer((request, response) => {
		requests.push({ url: new URL(request.url, "http://localhost"), headers: request.headers });
		respond(request, response, requests.length);
	});
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	t.after(() => new Promise((resolve, reject) => {
		server.close((error) => error ? reject(error) : resolve());
		server.closeAllConnections();
	}));
	return { url: `http://127.0.0.1:${server.address().port}`, requests };
}

function json(response, payload, status = 200) {
	response.writeHead(status, { "Content-Type": "application/json" });
	response.end(JSON.stringify(payload));
}

test("JSON input supports legacy arrays and messages wrappers", async (t) => {
	for (const wrapped of [false, true]) {
		await t.test(wrapped ? "messages wrapper" : "legacy array", async (t) => {
			const f = await fixture(t);
			const messages = [message(1), message(3, "Newest", "2025-01-03T12:00:00+00:00"), message(2)];
			await f.writeInput(wrapped ? { messages } : messages);
			succeeds(await f.run(["--input", f.input, "--chunk-size", "2"]));
			const { manifest, items } = await published(f);
			assert.equal(manifest.version, 1);
			assert.equal(manifest.total, 3);
			assert.deepEqual(manifest.chunks.map(({ count }) => count), [2, 1]);
			assert.deepEqual(items.map(({ id }) => id), ["3", "2", "1"]);
			assert.equal(items[0].time, "2025-01-03T12:00:00.000Z");
			assert.equal((await f.read("generation-state.json")).lastMessageId, "3");
		});
	}
});

test("content whitespace is preserved and duplicate IDs use the final record", async (t) => {
	const f = await fixture(t);
	const content = "  leading spaces\n\ntext\twith tabs\ntrailing spaces  \n";
	await f.writeInput([message(7, "old"), message("007", content), message(8, " "), message(9, "\n\t")]);
	succeeds(await f.run());
	const { manifest, items } = await published(f);
	assert.equal(manifest.total, 1);
	assert.deepEqual(items, [{ id: "7", time: "2025-01-01T12:00:00.000Z", content }]);
	assert.equal((await f.read("generation-state.json")).lastMessageId, "9");
});

test("bigint-sized string IDs retain precision and numeric cursor ordering", async (t) => {
	const f = await fixture(t);
	const first = "9007199254740993123456789";
	const next = (BigInt(first) + 1n).toString();
	await f.writeInput([message(first)]);
	succeeds(await f.run());
	assert.equal((await f.read("generation-state.json")).lastMessageId, first);
	await f.writeInput([message(first, "must not replace published content"), message(next), message("9")]);
	succeeds(await f.run());
	const { manifest, items } = await published(f);
	assert.equal(manifest.total, 2);
	assert.deepEqual(new Set(items.map(({ id }) => id)), new Set([first, next]));
	assert.equal(items.find(({ id }) => id === first).content, `Message ${first}`);
	assert.equal((await f.read("generation-state.json")).lastMessageId, next);
});

test("empty service messages advance the cursor without publishing chunks", async (t) => {
	const f = await fixture(t);
	await f.writeInput([message(11, ""), message("12", " \n\t", "2025-02-01T00:00:00Z")]);
	const result = await f.run();
	succeeds(result);
	assert.match(result.stderr, /skipped 2 message/);
	const { manifest, items } = await published(f);
	assert.equal(manifest.total, 0);
	assert.deepEqual(manifest.chunks, []);
	assert.deepEqual(items, []);
	const state = await f.read("generation-state.json");
	assert.equal(state.lastMessageId, "12");
	assert.equal(state.lastMessageTime, "2025-02-01T00:00:00.000Z");
	await f.writeInput([message(10, "too old"), message(13, "new")]);
	succeeds(await f.run());
	assert.deepEqual((await published(f)).items.map(({ id }) => id), ["13"]);
});

test("repeated identical input is idempotent and keeps published chunks immutable", async (t) => {
	const f = await fixture(t);
	await f.writeInput([message(1), message(2), message(3)]);
	succeeds(await f.run(["--input", f.input, "--chunk-size", "2"]));
	const before = await snapshot(f);
	const oldManifest = await f.read("manifest.json");
	const result = await f.run(["--input", f.input, "--chunk-size", "2"]);
	succeeds(result);
	assert.match(result.stdout, /0 new message\(s\), 0 new chunk\(s\)/);
	const after = await snapshot(f);
	assert.deepEqual(Object.keys(after), Object.keys(before));
	assert.deepEqual((await f.read("manifest.json")).chunks, oldManifest.chunks);
	assert.equal((await published(f)).manifest.total, 3);
	for (const { file } of oldManifest.chunks) assert.equal(after[file], before[file]);
	assert.equal((await f.read("generation-state.json")).lastMessageId, "3");
});

test("retry after manifest commit with stale state does not duplicate published IDs", async (t) => {
	const f = await fixture(t);
	await f.writeInput([message(1)]);
	succeeds(await f.run());
	const staleState = await readFile(path.join(f.output, "generation-state.json"), "utf8");
	await f.writeInput([message(1), message(2), message(3)]);
	succeeds(await f.run());
	const committed = await snapshot(f);
	const manifest = await f.read("manifest.json");
	await writeFile(path.join(f.output, "generation-state.json"), staleState);
	const result = await f.run();
	succeeds(result);
	assert.match(result.stdout, /0 new message\(s\), 0 new chunk\(s\)/);
	const current = await published(f);
	assert.equal(current.manifest.total, 3);
	assert.deepEqual(current.manifest.chunks, manifest.chunks);
	assert.equal(new Set(current.items.map(({ id }) => id)).size, 3);
	assert.deepEqual(current.items.map(({ id }) => id).sort(), ["1", "2", "3"]);
	assert.deepEqual(Object.keys(await snapshot(f)), Object.keys(committed));
	for (const { file } of manifest.chunks) assert.equal((await snapshot(f))[file], committed[file]);
	assert.equal((await f.read("generation-state.json")).lastMessageId, "3");
});

test("missing and malformed input leave all existing output bytes unchanged", async (t) => {
	for (const kind of ["missing", "invalid JSON", "invalid shape", "invalid message", "unsafe numeric ID"]) {
		await t.test(kind, async (t) => {
			const f = await fixture(t);
			await f.writeInput([message(1)]);
			succeeds(await f.run());
			const before = await snapshot(f);
			let input = f.input;
			if (kind === "missing") input = path.join(f.root, "does-not-exist.json");
			if (kind === "invalid JSON") await writeFile(input, "{broken");
			if (kind === "invalid shape") await f.writeInput({ messages: null });
			if (kind === "invalid message") await f.writeInput([message(2), { id: 3, time: "invalid", content: "bad" }]);
			if (kind === "unsafe numeric ID") await f.writeInput([message(Number.MAX_SAFE_INTEGER + 1)]);
			fails(await f.run(["--input", input]));
			assert.deepEqual(await snapshot(f), before);
		});
	}
});

test("missing input does not create an output directory on the first run", async (t) => {
	const f = await fixture(t);
	fails(await f.run());
	assert.equal(await snapshot(f), null);
});

test("Worker sync sends Authorization and exact cursors for incremental and no-new [] requests", async (t) => {
	const f = await fixture(t);
	const first = "9007199254740993123456789";
	const next = (BigInt(first) + 1n).toString();
	const service = (BigInt(first) + 2n).toString();
	const api = await worker(t, (_request, response, count) => {
		json(response, count === 1 ? [message(first)] : count === 2 ? [message(next), message(service, "")] : []);
	});
	const env = { TIMELINE_API_URL: api.url, EXPORT_TOKEN: token };
	succeeds(await f.run([], env));
	const initial = await f.read("manifest.json");
	succeeds(await f.run([], env));
	const incremental = await published(f);
	assert.equal(incremental.manifest.total, 2);
	assert.deepEqual(new Set(incremental.items.map(({ id }) => id)), new Set([first, next]));
	assert.ok(incremental.manifest.chunks.some(({ file }) => file === initial.chunks[0].file));
	assert.equal((await f.read("generation-state.json")).lastMessageId, service);
	const beforeEmpty = await snapshot(f);
	const result = await f.run(["--api-url", api.url], { EXPORT_TOKEN: token });
	succeeds(result);
	assert.match(result.stdout, /0 new message\(s\), 0 new chunk\(s\)/);
	assert.deepEqual((await f.read("manifest.json")).chunks, incremental.manifest.chunks);
	assert.equal((await f.read("manifest.json")).total, 2);
	const state = await f.read("generation-state.json");
	assert.equal(state.lastMessageId, service);
	assert.equal(state.lastMessageTime, "2025-01-01T12:00:00.000Z");
	const afterEmpty = await snapshot(f);
	assert.deepEqual(Object.keys(afterEmpty), Object.keys(beforeEmpty));
	for (const { file } of incremental.manifest.chunks) assert.equal(afterEmpty[file], beforeEmpty[file]);
	assert.equal(api.requests.length, 3);
	assert.deepEqual(api.requests.map(({ url }) => url.pathname), Array(3).fill("/messages.json"));
	assert.deepEqual(api.requests.map(({ url }) => url.searchParams.get("lastMessageId")), ["0", first, service]);
	for (const { headers } of api.requests) {
		assert.equal(headers.authorization, `Bearer ${token}`);
		assert.equal(headers.accept, "application/json");
	}
});

test("Worker fetch failures, HTTP 502 and invalid JSON leave existing output unchanged", async (t) => {
	for (const kind of ["failed fetch", "HTTP 502", "invalid JSON"]) {
		await t.test(kind, async (t) => {
			const f = await fixture(t);
			await f.writeInput([message(5)]);
			succeeds(await f.run());
			const before = await snapshot(f);
			const api = await worker(t, (request, response) => {
				if (kind === "failed fetch") request.socket.destroy();
				else if (kind === "HTTP 502") json(response, { error: "upstream unavailable" }, 502);
				else { response.writeHead(200, { "Content-Type": "application/json" }); response.end("{not-json"); }
			});
			const result = await f.run(["--api-url", `${api.url}/export?existing=kept&lastMessageId=999`], { EXPORT_TOKEN: token });
			fails(result);
			if (kind === "HTTP 502") assert.match(result.stderr, /HTTP 502/);
			if (kind === "failed fetch") assert.match(result.stderr, /request failed/);
			assert.deepEqual(await snapshot(f), before);
			assert.ok(api.requests.length >= 1);
			for (const { url, headers } of api.requests) {
				assert.equal(url.pathname, "/export");
				assert.equal(url.searchParams.get("existing"), "kept");
				assert.deepEqual(url.searchParams.getAll("lastMessageId"), ["5"]);
				assert.equal(headers.authorization, `Bearer ${token}`);
			}
		});
	}
});

test("explicit --input overrides the environment API without making a request", async (t) => {
	const f = await fixture(t);
	await f.writeInput({ messages: [message(17, "from local JSON")] });
	const api = await worker(t, (_request, response) => json(response, { error: "must not call Worker" }, 502));
	// No EXPORT_TOKEN: an accidental API call would also fail credential validation.
	succeeds(await f.run(["--input", f.input], { TIMELINE_API_URL: api.url }));
	assert.equal(api.requests.length, 0);
	assert.deepEqual((await published(f)).items.map(({ content }) => content), ["from local JSON"]);
	assert.equal((await f.read("generation-state.json")).lastMessageId, "17");
});
