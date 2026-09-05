import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

assert.match(css, /\.picker-dialog\[open\][^{]*\{[^}]*display:\s*flex/s);
assert.match(css, /\.picker-dialog\[open\][^{]*\{[^}]*flex-direction:\s*column/s);
assert.match(css, /\.picker-body\s*\{[^}]*flex:\s*1 1 auto/s);
assert.match(css, /\.picker-body\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.choice-dialog-body,[\s\S]*?\.spend-dialog-body\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.level-up-body\s*\{[^}]*overflow:\s*auto/s);
assert.match(css, /\.picker-dialog\s*\{[^}]*height:\s*min\(820px,\s*calc\(100dvh\s*-\s*28px\)\)/s);
assert.match(css, /\.level-up-dialog\[open\]\s*\{[^}]*height:\s*min\(820px,\s*calc\(100dvh\s*-\s*28px\)\)/s);
assert.doesNotMatch(css, /\.picker-body\s*\{[^}]*max-height:\s*calc\(100vh\s*-\s*128px\)/s);

console.log("Rolagem dos modais de seleção está protegida por regressão.");
