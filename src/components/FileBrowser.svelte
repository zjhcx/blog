<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import I18nKey from "@/i18n/i18nKey";
import { language, translate } from "@/i18n/client";

type SortField =
	| "id"
	| "name"
	| "size"
	| "type"
	| "modifiedAt"
	| "createdAt"
	| "updatedAt";
type SortOrder = "asc" | "desc";

interface FileItem {
	id: number;
	name: string;
	size?: number;
	type?: string;
	modifiedAt?: string;
	link?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface FilesResponse {
	files: FileItem[];
	total: number;
	limit: number;
	offset: number;
}

interface FileResponse {
	file: FileItem;
}

export let enabled = true;
export let apiBaseUrl = "/api/files";

interface BrowserEntry {
	key: string;
	name: string;
	path: string;
	kind: "folder" | "file";
	file?: FileItem;
}

type TypeOption = {
	value: string;
	label?: string;
	labelKey?: I18nKey;
};

const sortOptions: SortField[] = [
	"modifiedAt",
	"name",
	"size",
	"type",
	"createdAt",
	"updatedAt",
	"id",
];
const limit = 50;
const typeOptions: TypeOption[] = [
	{ value: "", labelKey: I18nKey.filesAllTypes },
	{ value: "image", label: "Images" },
	{ value: "video", label: "Videos" },
	{ value: "audio", label: "Audio" },
	{ value: "application", label: "Documents" },
];

let files: FileItem[] = [];
let total = 0;
let offset = 0;
let query = "";
let type = "";
let sort: SortField = "modifiedAt";
let order: SortOrder = "desc";
let currentPath = "";
let isLoading = true;
let errorMessage = "";
let selectedFile: FileItem | null = null;
let isDetailLoading = false;
let detailError = "";
let initialized = false;
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let requestController: AbortController | null = null;

function getText(key: I18nKey): string {
	return translate(key, $language);
}

function buildApiUrl(path = "", params?: URLSearchParams): string {
	const base = apiBaseUrl.replace(/\/+$/g, "") || "/api/files";
	const cleanPath = path.replace(/^\/+/g, "");
	const url = cleanPath ? `${base}/${cleanPath}` : base;
	const queryString = params?.toString();
	return queryString ? `${url}?${queryString}` : url;
}

function getFilePath(file: FileItem): string {
	if (file.name.includes("/")) {
		return normalizePath(file.name);
	}

	if (!file.link) {
		return normalizePath(file.name);
	}

	try {
		const url = new URL(file.link);
		const parts = url.pathname
			.split("/")
			.map((part) => decodeURIComponent(part))
			.filter(Boolean);
		const uploadIndex = parts.lastIndexOf("upload");
		const pathParts = uploadIndex >= 0 ? parts.slice(uploadIndex + 1) : parts;
		return normalizePath(pathParts.join("/") || file.name);
	} catch {
		return normalizePath(file.name);
	}
}

function normalizePath(path: string): string {
	return path.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
}

function isFolder(file: FileItem): boolean {
	const itemType = file.type?.toLowerCase() || "";
	return (
		itemType === "folder" ||
		itemType === "directory" ||
		itemType === "inode/directory" ||
		itemType === "application/x-directory"
	);
}

function getDisplayName(file: FileItem): string {
	return getFilePath(file).split("/").filter(Boolean).at(-1) || file.name;
}

function buildEntries(items: FileItem[], path: string): BrowserEntry[] {
	const folders = new Map<string, BrowserEntry>();
	const entries: BrowserEntry[] = [];
	const prefix = path ? `${path}/` : "";

	for (const file of items) {
		const filePath = getFilePath(file);

		if (isFolder(file)) {
			const folderPath = normalizePath(filePath);
			if (folderPath.startsWith(prefix)) {
				const rest = folderPath.slice(prefix.length);
				const name = rest.split("/").filter(Boolean)[0];
				if (name) {
					folders.set(`${prefix}${name}`, {
						key: `folder:${prefix}${name}`,
						name,
						path: normalizePath(`${prefix}${name}`),
						kind: "folder",
						file,
					});
				}
			}
			continue;
		}

		if (!filePath.startsWith(prefix)) {
			continue;
		}

		const rest = filePath.slice(prefix.length);
		const parts = rest.split("/").filter(Boolean);
		if (parts.length > 1) {
			const folderPath = normalizePath(`${prefix}${parts[0]}`);
			folders.set(folderPath, {
				key: `folder:${folderPath}`,
				name: parts[0],
				path: folderPath,
				kind: "folder",
			});
			continue;
		}

		if (parts.length === 1) {
			entries.push({
				key: `file:${file.id}`,
				name: getDisplayName(file),
				path: filePath,
				kind: "file",
				file,
			});
		}
	}

	return [...folders.values()]
		.sort((a, b) => a.name.localeCompare(b.name))
		.concat(entries);
}

async function fetchFiles(nextOffset = offset): Promise<void> {
	requestController?.abort();
	const controller = new AbortController();
	requestController = controller;
	isLoading = true;
	errorMessage = "";

	const params = new URLSearchParams({
		limit: String(limit),
		offset: String(nextOffset),
		sort,
		order,
	});
	if (query.trim()) params.set("q", query.trim());
	if (type) params.set("type", type);

	try {
		const response = await fetch(buildApiUrl("", params), {
			signal: controller.signal,
		});
		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		const data = (await response.json()) as FilesResponse;
		files = Array.isArray(data.files) ? data.files : [];
		total = Number.isFinite(data.total) ? data.total : files.length;
		offset = Number.isFinite(data.offset) ? data.offset : nextOffset;
		currentPath = "";
		if (selectedFile && !files.some((file) => file.id === selectedFile?.id)) {
			selectedFile = null;
		}
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			return;
		}
		errorMessage = error instanceof Error ? error.message : String(error);
		files = [];
		total = 0;
	} finally {
		if (requestController === controller) {
			requestController = null;
			isLoading = false;
		}
	}
}

async function selectFile(file: FileItem): Promise<void> {
	selectedFile = file;
	isDetailLoading = true;
	detailError = "";

	try {
		const response = await fetch(buildApiUrl(String(file.id)));
		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
		const data = (await response.json()) as FileResponse;
		selectedFile = data.file || file;
	} catch (error) {
		detailError = error instanceof Error ? error.message : String(error);
		selectedFile = file;
	} finally {
		isDetailLoading = false;
	}
}

function scheduleSearch(): void {
	if (!initialized || !enabled) return;
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => fetchFiles(0), 250);
}

function setSort(nextSort: SortField): void {
	sort = nextSort;
	fetchFiles(0);
}

function toggleOrder(): void {
	order = order === "desc" ? "asc" : "desc";
	fetchFiles(0);
}

function openFolder(path: string): void {
	currentPath = path;
	selectedFile = null;
}

function openRoot(): void {
	currentPath = "";
	selectedFile = null;
}

function openBreadcrumb(index: number): void {
	currentPath = pathSegments.slice(0, index + 1).join("/");
	selectedFile = null;
}

function formatSize(size?: number): string {
	if (!Number.isFinite(size)) return "-";
	const units = ["B", "KB", "MB", "GB", "TB"];
	let value = Number(size);
	let unitIndex = 0;
	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}
	return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value?: string): string {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return new Intl.DateTimeFormat($language.replace("_", "-"), {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

function getFileIcon(file: FileItem): string {
	const itemType = file.type || "";
	if (itemType.startsWith("image/"))
		return "material-symbols:image-outline-rounded";
	if (itemType.startsWith("video/"))
		return "material-symbols:movie-outline-rounded";
	if (itemType.startsWith("audio/"))
		return "material-symbols:audio-file-outline-rounded";
	if (itemType.includes("pdf"))
		return "material-symbols:picture-as-pdf-outline-rounded";
	return "material-symbols:draft-outline-rounded";
}

function shouldPreviewImage(file: FileItem): boolean {
	return Boolean(file.link && file.type?.startsWith("image/"));
}

onMount(() => {
	initialized = true;
	if (!enabled) {
		isLoading = false;
		return;
	}
	fetchFiles(0);
});

$: entries = buildEntries(files, currentPath);
$: pathSegments = currentPath.split("/").filter(Boolean);
$: canPrevious = offset > 0;
$: canNext = offset + limit < total;
$: pageStart = total === 0 ? 0 : offset + 1;
$: pageEnd = Math.min(offset + limit, total);
</script>

<div class="files-page">
	<section class="files-hero card-base">
		<div>
			<h1 class="files-title text-90">{getText(I18nKey.files)}</h1>
			<p class="files-description text-50">{getText(I18nKey.filesDescription)}</p>
		</div>
		<button class="btn-plain files-icon-button" type="button" aria-label={getText(I18nKey.filesRefresh)} on:click={() => fetchFiles(offset)}>
			<Icon icon="material-symbols:refresh-rounded" />
		</button>
	</section>

	<section class="files-toolbar card-base">
		<label class="files-search">
			<Icon icon="material-symbols:search-rounded" />
			<input bind:value={query} placeholder={getText(I18nKey.filesSearch)} aria-label={getText(I18nKey.filesSearch)} on:input={scheduleSearch} />
		</label>

		<select bind:value={type} on:change={() => fetchFiles(0)} aria-label={getText(I18nKey.filesType)}>
			{#each typeOptions as option}
				<option value={option.value}>{option.labelKey ? getText(option.labelKey) : option.label || option.value}</option>
			{/each}
		</select>

		<select bind:value={sort} on:change={() => setSort(sort)} aria-label={getText(I18nKey.filesSort)}>
			{#each sortOptions as item}
				<option value={item}>{item}</option>
			{/each}
		</select>

		<button class="btn-plain files-order-button" type="button" on:click={toggleOrder}>
			<Icon icon={order === "desc" ? "material-symbols:south-rounded" : "material-symbols:north-rounded"} />
			<span>{getText(order === "desc" ? I18nKey.filesOrderDesc : I18nKey.filesOrderAsc)}</span>
		</button>
	</section>

	<section class="files-breadcrumb card-base">
		<button class="btn-plain files-crumb" type="button" on:click={openRoot}>
			<Icon icon="material-symbols:home-rounded" />
			<span>{getText(I18nKey.filesRoot)}</span>
		</button>
		{#each pathSegments as segment, index}
			<Icon class="files-crumb-separator" icon="fa6-solid:chevron-right" />
			<button class="btn-plain files-crumb" type="button" on:click={() => openBreadcrumb(index)}>
				{segment}
			</button>
		{/each}
	</section>

	{#if !enabled}
		<section class="files-state card-base text-50">{getText(I18nKey.filesDisabled)}</section>
	{:else if errorMessage}
		<section class="files-state card-base text-50">
			{getText(I18nKey.filesLoadFailed)}{errorMessage}
		</section>
	{:else if isLoading}
		<section class="files-state card-base text-50">
			<Icon icon="material-symbols:progress-activity-rounded" />
			{getText(I18nKey.filesLoading)}
		</section>
	{:else if entries.length === 0}
		<section class="files-state card-base text-50">{getText(I18nKey.filesEmpty)}</section>
	{:else}
		<section class="files-content">
			<div class="files-list card-base">
				{#each entries as entry}
					{#if entry.kind === "folder"}
						<button class="files-row files-folder-row" type="button" on:click={() => openFolder(entry.path)}>
							<span class="files-row-icon files-folder-icon">
								<Icon icon="material-symbols:folder-outline-rounded" />
							</span>
							<span class="files-row-main">
								<span class="files-row-name text-90">{entry.name}</span>
								<span class="files-row-meta text-50">{getText(I18nKey.filesFolder)}</span>
							</span>
							<Icon class="files-row-enter text-30" icon="fa6-solid:chevron-right" />
						</button>
					{:else if entry.file}
						<button class="files-row" type="button" class:selected={selectedFile?.id === entry.file.id} on:click={() => selectFile(entry.file)}>
							<span class="files-row-icon">
								<Icon icon={getFileIcon(entry.file)} />
							</span>
							<span class="files-row-main">
								<span class="files-row-name text-90">{entry.name}</span>
								<span class="files-row-meta text-50">{formatSize(entry.file.size)} · {entry.file.type || "-"}</span>
							</span>
							<span class="files-row-date text-50">{formatDate(entry.file.modifiedAt)}</span>
						</button>
					{/if}
				{/each}
			</div>

			<aside class="files-detail card-base">
				{#if selectedFile}
					{#if shouldPreviewImage(selectedFile)}
						<img class="files-preview" src={selectedFile.link} alt={selectedFile.name} loading="lazy" referrerpolicy="no-referrer" />
					{:else}
						<div class="files-preview-placeholder">
							<Icon icon={getFileIcon(selectedFile)} />
						</div>
					{/if}
					<div class="files-detail-header">
						<h2 class="files-detail-title text-90">{getDisplayName(selectedFile)}</h2>
						{#if selectedFile.link}
							<a class="btn-plain files-open-link" href={selectedFile.link} target="_blank" rel="noopener noreferrer">
								<Icon icon="material-symbols:open-in-new-rounded" />
								<span>{getText(I18nKey.filesOpen)}</span>
							</a>
						{/if}
					</div>
					{#if isDetailLoading}
						<p class="files-detail-loading text-50">{getText(I18nKey.filesLoading)}</p>
					{/if}
					{#if detailError}
						<p class="files-detail-loading text-50">{getText(I18nKey.filesLoadFailed)}{detailError}</p>
					{/if}
					<dl class="files-meta-list">
						<div>
							<dt class="text-50">{getText(I18nKey.filesSize)}</dt>
							<dd class="text-90">{formatSize(selectedFile.size)}</dd>
						</div>
						<div>
							<dt class="text-50">{getText(I18nKey.filesType)}</dt>
							<dd class="text-90">{selectedFile.type || "-"}</dd>
						</div>
						<div>
							<dt class="text-50">{getText(I18nKey.filesModifiedAt)}</dt>
							<dd class="text-90">{formatDate(selectedFile.modifiedAt)}</dd>
						</div>
						<div>
							<dt class="text-50">{getText(I18nKey.filesCreatedAt)}</dt>
							<dd class="text-90">{formatDate(selectedFile.createdAt)}</dd>
						</div>
						<div>
							<dt class="text-50">{getText(I18nKey.filesUpdatedAt)}</dt>
							<dd class="text-90">{formatDate(selectedFile.updatedAt)}</dd>
						</div>
					</dl>
				{:else}
					<div class="files-detail-empty text-50">
						<Icon icon="material-symbols:info-outline-rounded" />
						{getText(I18nKey.filesDetails)}
					</div>
				{/if}
			</aside>
		</section>
	{/if}

	<section class="files-pagination card-base">
		<div class="text-50">
			{getText(I18nKey.filesTotal)}: {total}
			{#if total > 0}
				<span> · {pageStart}-{pageEnd}</span>
			{/if}
		</div>
		<div class="files-page-actions">
			<button class="btn-plain files-page-button" type="button" disabled={!canPrevious} on:click={() => fetchFiles(Math.max(0, offset - limit))}>
				<Icon icon="fa6-solid:chevron-left" />
				<span>{getText(I18nKey.filesPrevious)}</span>
			</button>
			<button class="btn-plain files-page-button" type="button" disabled={!canNext} on:click={() => fetchFiles(offset + limit)}>
				<span>{getText(I18nKey.filesNext)}</span>
				<Icon icon="fa6-solid:chevron-right" />
			</button>
		</div>
	</section>
</div>

<style>
	.files-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.files-hero,
	.files-toolbar,
	.files-breadcrumb,
	.files-pagination {
		padding: 1rem;
	}

	.files-hero,
	.files-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.files-title {
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.files-description {
		margin-top: 0.25rem;
		font-size: 0.9375rem;
	}

	.files-icon-button,
	.files-order-button,
	.files-page-button,
	.files-open-link,
	.files-crumb {
		border-radius: 0.75rem;
	}

	.files-icon-button {
		width: 2.75rem;
		height: 2.75rem;
		flex: 0 0 auto;
	}

	.files-toolbar {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(8rem, auto) minmax(8rem, auto) auto;
		gap: 0.75rem;
		align-items: center;
	}

	.files-search {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 2.75rem;
		padding: 0 0.875rem;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.04);
	}

	:global(.dark) .files-search {
		background: rgba(255, 255, 255, 0.06);
	}

	.files-search input,
	.files-toolbar select {
		width: 100%;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font-size: 0.9375rem;
	}

	.files-toolbar select {
		height: 2.75rem;
		padding: 0 0.875rem;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.04);
	}

	:global(.dark) .files-toolbar select {
		background: rgba(255, 255, 255, 0.06);
	}

	.files-order-button,
	.files-page-button,
	.files-open-link {
		gap: 0.375rem;
		height: 2.75rem;
		padding: 0 0.875rem;
		white-space: nowrap;
	}

	.files-breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		overflow-x: auto;
	}

	.files-crumb {
		flex: 0 0 auto;
		gap: 0.375rem;
		height: 2.25rem;
		padding: 0 0.625rem;
	}

	.files-crumb-separator {
		flex: 0 0 auto;
		font-size: 0.65rem;
		opacity: 0.35;
	}

	.files-state {
		min-height: 12rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		text-align: center;
	}

	.files-state :global(svg) {
		font-size: 1.25rem;
	}

	.files-content {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(17rem, 22rem);
		gap: 1rem;
		align-items: start;
	}

	.files-list {
		padding: 0.5rem;
	}

	.files-row {
		width: 100%;
		min-height: 4.25rem;
		display: grid;
		grid-template-columns: 2.75rem minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: center;
		padding: 0.625rem;
		border: 0;
		border-radius: 0.75rem;
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background 150ms ease, color 150ms ease;
	}

	.files-row:hover,
	.files-row.selected {
		background: rgba(0, 0, 0, 0.05);
	}

	:global(.dark) .files-row:hover,
	:global(.dark) .files-row.selected {
		background: rgba(255, 255, 255, 0.07);
	}

	.files-row-icon {
		width: 2.75rem;
		height: 2.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.04);
		font-size: 1.45rem;
		color: var(--primary);
	}

	:global(.dark) .files-row-icon {
		background: rgba(255, 255, 255, 0.06);
	}

	.files-folder-icon {
		color: oklch(0.72 0.14 85);
	}

	.files-row-main {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.files-row-name,
	.files-row-meta {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.files-row-name {
		font-weight: 700;
	}

	.files-row-meta,
	.files-row-date {
		font-size: 0.8125rem;
	}

	.files-row-date {
		white-space: nowrap;
	}

	.files-row-enter {
		justify-self: end;
	}

	.files-detail {
		position: sticky;
		top: 5.5rem;
		padding: 1rem;
	}

	.files-preview,
	.files-preview-placeholder {
		width: 100%;
		aspect-ratio: 16 / 10;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.04);
		object-fit: cover;
	}

	:global(.dark) .files-preview,
	:global(.dark) .files-preview-placeholder {
		background: rgba(255, 255, 255, 0.06);
	}

	.files-preview-placeholder,
	.files-detail-empty {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.files-preview-placeholder {
		font-size: 3rem;
		color: var(--primary);
	}

	.files-detail-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.files-detail-title {
		min-width: 0;
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.files-detail-loading {
		margin-top: 0.75rem;
		font-size: 0.875rem;
	}

	.files-meta-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.files-meta-list div {
		display: grid;
		grid-template-columns: 6rem minmax(0, 1fr);
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.files-meta-list dd {
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.files-detail-empty {
		min-height: 16rem;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9375rem;
	}

	.files-detail-empty :global(svg) {
		font-size: 2rem;
	}

	.files-page-actions {
		display: flex;
		gap: 0.5rem;
	}

	.files-page-button:disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	@media (max-width: 900px) {
		.files-toolbar {
			grid-template-columns: 1fr 1fr;
		}

		.files-search {
			grid-column: 1 / -1;
		}

		.files-content {
			grid-template-columns: 1fr;
		}

		.files-detail {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.files-hero,
		.files-pagination {
			align-items: stretch;
		}

		.files-pagination {
			flex-direction: column;
		}

		.files-toolbar {
			grid-template-columns: 1fr;
		}

		.files-row {
			grid-template-columns: 2.75rem minmax(0, 1fr);
		}

		.files-row-date,
		.files-row-enter {
			display: none;
		}

		.files-page-actions {
			width: 100%;
		}

		.files-page-button {
			flex: 1 1 0;
		}
	}
</style>
