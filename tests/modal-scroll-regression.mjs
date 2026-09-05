import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(css, /\.picker-dialog\[open\][^{]*\{[^}]*display:\s*flex/s);
assert.match(css, /\.picker-dialog\[open\][^{]*\{[^}]*flex-direction:\s*column/s);
assert.match(css, /\.picker-body\s*\{[^}]*flex:\s*1 1 auto/s);
assert.match(css, /\.picker-body\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.choice-dialog-body,[\s\S]*?\.spend-dialog-body\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.level-up-body\s*\{[^}]*overflow:\s*auto/s);
assert.match(css, /\.picker-dialog\s*\{[^}]*height:\s*min\(760px,\s*calc\(100dvh\s*-\s*48px\)\)/s);
assert.match(css, /\.level-up-dialog\[open\]\s*\{[^}]*height:\s*min\(760px,\s*calc\(100dvh\s*-\s*48px\)\)/s);
assert.match(css, /\.catalog-picker-dialog\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.catalog-picker-dialog\s*>\s*\.picker-body\s*\{[^}]*overflow:\s*visible/s);
assert.match(css, /\.catalog-picker-dialog\s+\.entry-card\[open\]\s+\.entry-body\s*>\s*\.button:last-child\s*\{[^}]*position:\s*sticky/s);
assert.doesNotMatch(css, /\.picker-body\s*\{[^}]*max-height:\s*calc\(100vh\s*-\s*128px\)/s);

for (const id of ["ability-dialog", "ritual-dialog", "item-dialog"]) {
  assert.match(app, new RegExp(`<dialog class="picker-dialog catalog-picker-dialog" id="${id}"`));
}

console.log("Rolagem dos modais de seleção está protegida por regressão.");
