import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ui = readFileSync(new URL("../inventory-ui.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(ui, /function enhanceInventory\(/);
assert.match(ui, /function makeLoadoutTile\(/);
assert.match(ui, /new MutationObserver\(refreshInterface\)/);
assert.match(ui, /suppress-ui-replay/);
assert.match(ui, /tabAnimationPending/);
assert.match(html, /inventory-ui\.js\?v=17/);
assert.doesNotMatch(css, /#app > \*\s*\{\s*animation:/);
assert.match(css, /\.sheet-tab-content\.tab-enter\s*\{/);
assert.match(css, /\.picker-dialog\.restored-open\[open\]\s*\{[^}]*animation:\s*none/s);
assert.match(css, /\.loadout-grid\s*\{/);
assert.match(css, /\.loadout-slot\.is-wide\s*\{[^}]*grid-column:\s*span 2/s);

console.log("Inventário visual e proteção contra piscadas passaram.");
