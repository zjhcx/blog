import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  parseArgs, sourceHash, entryId, scanPosts, validateSummaries, completionUrl,
  requestSummary, run, MAX_BODY_BYTES,
} from './generate-ai-summary.mjs';

const script = fileURLToPath(new URL('./generate-ai-summary.mjs', import.meta.url));
const fixedTime = '2026-01-02T03:04:05.000Z';
const article = (title = 'Hello', body = 'An article body.', extra = '') => `---\ntitle: ${title}\n${extra}---\n${body}\n`;
async function fixture(t, files = { 'Hello.md': article() }) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ai-summary-test-'));
  t.after(async () => {
    // Only delete this exact mkdtemp fixture, never a user-supplied path.
    assert.equal(path.dirname(cwd), os.tmpdir());
    assert.ok(path.basename(cwd).startsWith('ai-summary-test-'));
    await rm(cwd, { recursive: true, force: true });
  });
  const postsDir = path.join(cwd, 'src/content/posts');
  await mkdir(postsDir, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    const file = path.join(postsDir, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, contents);
  }
  return { cwd, postsDir, output: path.join(cwd, 'src/data/ai-summaries.json') };
}
async function json(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value));
}
async function mockApi(t, handler) {
  const requests = [];
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    requests.push({ url: req.url, authorization: req.headers.authorization, body: JSON.parse(body) });
    await handler(req, res, requests.length);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return { baseUrl: `http://127.0.0.1:${server.address().port}/v1`, requests };
}
function success(res, summary = '文章摘要。') {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ choices: [{ message: { content: summary } }] }));
}
function deps(cwd, extra = {}) {
  return { cwd, env: { AI_SUMMARY_API_KEY: 'local-test-secret' }, now: () => new Date(fixedTime), ...extra };
}

test('argument defaults, environment precedence and invalid arguments', () => {
  const options = parseArgs([], {});
  assert.equal(options.model, 'gpt-4o-mini');
  assert.equal(options.baseUrl, 'https://api.openai.com/v1');
  assert.equal(options.lang, 'zh-CN');
  assert.equal(options.output, 'src/data/ai-summaries.json');
  assert.equal(parseArgs([], { OPENAI_MODEL: 'fallback', AI_SUMMARY_MODEL: 'preferred' }).model, 'preferred');
  assert.equal(parseArgs(['--model', 'cli'], { AI_SUMMARY_MODEL: 'env' }).model, 'cli');
  assert.equal(parseArgs([], { OPENAI_BASE_URL: 'https://example.com' }).baseUrl, 'https://example.com');
  assert.equal(parseArgs(['--force', '--dry-run', '--lang', 'en', '--post', 'nested/article', '--input', 'in.json', '--output', 'out.json'], {}).dryRun, true);
  for (const args of [['--wat'], ['--post'], ['--post', '--force'], ['positional'], ['--model', ''], ['--force', '--force'], ['--lang', '   ']]) {
    assert.throws(() => parseArgs(args, {}));
  }
});

test('Astro IDs, nested mdx, index and YAML parsing without a build', async (t) => {
  const fixtureData = await fixture(t, {
    'Folder Name/Hello World.mdx': article('"YAML: title"', '<Widget />', 'description: |\n  One line\n  Two lines\n'),
    'Folder Name/index.md': article(),
    'override.md': article('Override', 'Body', 'slug: custom/ID\n'),
    '.hidden/file.md': article(), '.hidden.md': article(), '_skip.md': article(),
    'visible/_skip.mdx': article(), 'draft.md': article('Draft', 'Private', 'draft: true\n'),
    'image.png': 'not markdown',
  });
  const posts = await scanPosts(fixtureData.postsDir);
  assert.deepEqual(posts.map((p) => p.id).sort(), ['custom/ID', 'draft', 'folder-name', 'folder-name/hello-world'].sort());
  assert.equal(posts.find((p) => p.id === 'folder-name/hello-world').title, 'YAML: title');
  assert.equal(posts.find((p) => p.id === 'draft').draft, true);
  assert.equal(entryId('中文目录/你好 世界.md'), '中文目录/你好-世界');
  assert.equal(entryId('foo/index.mdx'), 'foo');
  assert.equal(entryId('index.md'), 'index');
});

test('local mock API, schema, full raw SHA256, idempotence, force and language/model invalidation', async (t) => {
  const { cwd, output } = await fixture(t, { 'Hello.md': article(), 'draft.md': article('Draft', 'Private', 'draft: true\n') });
  const api = await mockApi(t, (_req, res) => success(res));
  const options = parseArgs(['--base-url', api.baseUrl], {});
  const first = await run(options, deps(cwd));
  assert.equal(first.updated, 1);
  assert.equal(first.skipped, 1);
  assert.equal(api.requests[0].url, '/v1/chat/completions');
  assert.equal(api.requests[0].authorization, 'Bearer local-test-secret');
  assert.equal(api.requests[0].body.model, 'gpt-4o-mini');
  assert.match(api.requests[0].body.messages[0].content, /zh-CN/);
  assert.equal(JSON.parse(api.requests[0].body.messages[1].content).article, '\nAn article body.\n');
  const generated = JSON.parse(await readFile(output, 'utf8'));
  assert.deepEqual(generated.hello, {
    summary: '文章摘要。', sourceHash: sourceHash(article()), model: 'gpt-4o-mini', generatedAt: fixedTime, language: 'zh-CN',
  });
  const before = await readFile(output, 'utf8');
  assert.equal((await run(options, deps(cwd))).updated, 0);
  assert.equal(await readFile(output, 'utf8'), before);
  assert.equal(api.requests.length, 1);
  await run({ ...options, force: true }, deps(cwd));
  await run({ ...options, lang: 'en' }, deps(cwd));
  await run({ ...options, lang: 'en', model: 'other' }, deps(cwd));
  assert.equal(api.requests.length, 4);
  // Frontmatter-only changes also invalidate the raw-file digest.
  await writeFile(path.join(cwd, 'src/content/posts/Hello.md'), article('Changed title'));
  await run({ ...options, lang: 'en', model: 'other' }, deps(cwd));
  assert.equal(api.requests.length, 5);
});

test('offline imports fill metadata, support selection and verify hashes without API keys', async (t) => {
  const { cwd, output } = await fixture(t, { 'Folder/Hello World.md': article(), 'other.md': article() });
  const input = path.join(cwd, 'input.json');
  await json(input, { 'folder/hello-world': { summary: '  Offline  ', model: 'offline-model', generatedAt: fixedTime, sourceHash: sourceHash(article()) } });
  const options = parseArgs(['--input', 'input.json', '--post', 'Folder/Hello World.md'], {});
  const dependencies = deps(cwd, { env: {}, fetchImpl: () => { throw new Error('Network must not run'); } });
  assert.equal((await run(options, dependencies)).updated, 1);
  const result = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(result['folder/hello-world'].summary, 'Offline');
  assert.equal(result['folder/hello-world'].model, 'offline-model');
  assert.equal(result['folder/hello-world'].language, 'zh-CN');
  assert.equal((await run(options, dependencies)).updated, 0);
  await json(input, { 'folder/hello-world': { summary: 'Wrong hash', sourceHash: '0'.repeat(64) } });
  const before = await readFile(output, 'utf8');
  await assert.rejects(run({ ...options, force: true }, dependencies), /sourceHash/);
  assert.equal(await readFile(output, 'utf8'), before);
});

test('empty offline JSON never invokes the API or creates output', async (t) => {
  const { cwd, output } = await fixture(t);
  await json(path.join(cwd, 'input.json'), {});
  const result = await run(parseArgs(['--input', 'input.json'], {}), deps(cwd, {
    env: {}, fetchImpl: () => assert.fail('Offline import must never fetch'),
  }));
  assert.equal(result.updated, 0);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
});

test('post selectors accept slug and root-relative path; drafts cannot be forced', async (t) => {
  const { cwd } = await fixture(t, { 'Folder/Hello World.md': article(), 'draft.md': article('Draft', 'No', 'draft: true\n') });
  for (const post of ['folder/hello-world', 'Folder/Hello World.md', 'src/content/posts/Folder/Hello World.md']) {
    const result = await run(parseArgs(['--post', post, '--dry-run'], {}), deps(cwd, { env: {} }));
    assert.equal(result.planned, 1);
  }
  const draft = await run(parseArgs(['--post', 'draft', '--force', '--dry-run'], {}), deps(cwd));
  assert.equal(draft.planned, 0);
  assert.equal(draft.skipped, 1);
  await assert.rejects(run(parseArgs(['--post', '../outside.md', '--dry-run'], {}), deps(cwd)), /exactly one/);
});

test('dry-run never fetches or creates output; missing credentials do not write', async (t) => {
  const { cwd, output } = await fixture(t);
  const dependencies = deps(cwd, { env: {}, fetchImpl: () => assert.fail('Unexpected fetch') });
  assert.equal((await run(parseArgs(['--dry-run'], {}), dependencies)).planned, 1);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
  await assert.rejects(run(parseArgs([], {}), dependencies), /API_KEY/);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
});

for (const mode of ['http', 'redirect', 'bad-json', 'bad-schema', 'empty-summary', 'timeout']) {
  test(`API ${mode} failure preserves the complete existing output and hides secrets`, async (t) => {
    const { cwd, output } = await fixture(t, { 'a.md': article(), 'b.md': article('B') });
    const old = { a: { summary: 'Existing', sourceHash: '0'.repeat(64), model: 'old', generatedAt: fixedTime, language: 'zh-CN' } };
    await json(output, old);
    const before = await readFile(output, 'utf8');
    const api = await mockApi(t, (_req, res, count) => {
      if (count === 1) return success(res, 'First succeeds but must not commit');
      if (mode === 'timeout') return; // Closed by fixture teardown, no timer leak.
      if (mode === 'http') { res.writeHead(401); res.end('local-test-secret'); }
      if (mode === 'redirect') { res.writeHead(302, { Location: '/steal-secret' }); res.end(); }
      if (mode === 'bad-json') { res.writeHead(200); res.end('not JSON local-test-secret'); }
      if (mode === 'bad-schema') { res.writeHead(200); res.end(JSON.stringify({ choices: [] })); }
      if (mode === 'empty-summary') success(res, '   ');
    });
    await assert.rejects(run(parseArgs(['--base-url', api.baseUrl], {}), deps(cwd, { timeoutMs: mode === 'timeout' ? 50 : 2000 })), (error) => {
      assert.match(error.message, /request failed/);
      assert.ok(!error.message.includes('local-test-secret'));
      return true;
    });
    assert.equal(await readFile(output, 'utf8'), before);
    assert.equal(api.requests.length, 2);
    assert.deepEqual(await readdir(path.dirname(output)), ['ai-summaries.json']);
  });
}

test('reject unsafe URL schemes, credentials, nonlocal HTTP and redirects', () => {
  for (const url of ['http://example.com/v1', 'file:///tmp/a', 'https://user:secret@example.com', 'https://example.com/?key=secret', 'https://example.com/#fragment', 'not a URL']) {
    assert.throws(() => completionUrl(url));
  }
  assert.equal(completionUrl('https://example.com/v1/').href, 'https://example.com/v1/chat/completions');
  assert.equal(completionUrl('http://[::1]:123/v1').hostname, '[::1]');
});

test('oversize bodies fail before API calls, never truncate or commit', async (t) => {
  const { cwd, output } = await fixture(t, { 'a.md': article(), 'z.md': article('Long', '中'.repeat(Math.ceil(MAX_BODY_BYTES / 3))) });
  let calls = 0;
  await assert.rejects(run(parseArgs([], {}), deps(cwd, { fetchImpl: () => { calls++; } })), /exceeds/);
  assert.equal(calls, 0);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
  await assert.rejects(requestSummary({ body: 'a'.repeat(MAX_BODY_BYTES + 1), id: 'long' }, { apiKey: 'secret' }), /exceeds/);
});

test('invalid existing and imported JSON is rejected without modifying output', async (t) => {
  const { cwd, output } = await fixture(t);
  const input = path.join(cwd, 'input.json');
  const options = parseArgs(['--input', 'input.json'], {});
  const invalid = [null, [], { hello: { summary: '' } }, { hello: { summary: 'X', sourceHash: 'bad' } }, { hello: { summary: 'X', generatedAt: 'yesterday' } }, { hello: { summary: 'X', unknown: true } }, { unknown: { summary: 'X' } }];
  await json(output, {});
  const before = await readFile(output, 'utf8');
  for (const value of invalid) {
    await json(input, value);
    await assert.rejects(run(options, deps(cwd)));
    assert.equal(await readFile(output, 'utf8'), before);
  }
  await writeFile(input, '{ broken JSON');
  await assert.rejects(run(options, deps(cwd)), /Invalid JSON/);
  await json(input, { hello: { summary: 'Fine' } });
  await writeFile(output, '{ broken existing JSON');
  await assert.rejects(run(options, deps(cwd)), /Invalid JSON/);
  assert.equal(await readFile(output, 'utf8'), '{ broken existing JSON');
  await json(output, { hello: { summary: 'Hand-authored summary' } });
  assert.equal((await run(options, deps(cwd, { env: {} }))).updated, 1);
  assert.equal(JSON.parse(await readFile(output, 'utf8')).hello.summary, 'Fine');
  assert.throws(() => validateSummaries({ x: { summary: 'ok', model: 1 } }));
});

test('non-JSON, source collection, symlink and same-input output protections', async (t) => {
  const { cwd, postsDir } = await fixture(t);
  const source = path.join(postsDir, 'Hello.md');
  const original = await readFile(source, 'utf8');
  for (const output of ['src/content/posts/Hello.md', 'src/content/posts/anything.json', 'out.txt']) {
    await assert.rejects(run(parseArgs(['--output', output, '--dry-run'], {}), deps(cwd)), /Output/);
  }
  const linked = path.join(cwd, 'linked.json');
  await symlink(source, linked);
  await assert.rejects(run(parseArgs(['--output', linked, '--dry-run'], {}), deps(cwd)), /symlink/);
  await symlink(postsDir, path.join(cwd, 'linked-posts'));
  await json(path.join(cwd, 'input.json'), { hello: { summary: 'No write in source folder' } });
  await assert.rejects(run(parseArgs(['--input', 'input.json', '--output', 'linked-posts/out.json'], {}), deps(cwd)), /source posts/);
  await assert.rejects(run(parseArgs(['--input', 'same.json', '--output', 'same.json'], {}), deps(cwd)), /different/);
  assert.equal(await readFile(source, 'utf8'), original);
});

test('duplicate IDs, invalid YAML and invalid draft metadata fail closed', async (t) => {
  const duplicate = await fixture(t, { 'a b.md': article(), 'a-b.md': article() });
  await assert.rejects(scanPosts(duplicate.postsDir), /duplicate/);
  const malformed = await fixture(t, { 'bad.md': '---\ntitle: [unclosed\n---\nbody' });
  await assert.rejects(scanPosts(malformed.postsDir), /YAML/);
  const draft = await fixture(t, { 'bad.md': article('Bad', 'Body', 'draft: "false"\n') });
  await assert.rejects(scanPosts(draft.postsDir), /boolean/);
});

test('CLI help and errors have exit codes and never leak configured keys', () => {
  const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--input/);
  const result = spawnSync(process.execPath, [script, '--invalid-secret'], {
    encoding: 'utf8', env: { ...process.env, AI_SUMMARY_API_KEY: 'invalid-secret' },
  });
  assert.equal(result.status, 1);
  assert.ok(!result.stderr.includes('invalid-secret'));
  assert.match(result.stderr, /REDACTED/);
});
