/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare module "virtual:iconify-offline" {
	const collections: import("@iconify/types").IconifyJSON[];
	export default collections;
}
