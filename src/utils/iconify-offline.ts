// Registers locally bundled icons for @iconify/svelte so no request is made to api.iconify.design.
// Import this module (side effect only) in any Svelte component that uses `@iconify/svelte`.
import { addCollection } from "@iconify/svelte";
import collections from "virtual:iconify-offline";

for (const collection of collections) {
	addCollection(collection);
}
