import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

assert.match(app, /function renderAttributeConstellation\(/);
assert.match(app, /attribute-constellation/);
assert.match(app, /attribute-geometry/);
assert.match(app, /resource-meter/);
assert.match(css, /\.attribute-agilidade\s*\{[^}]*top:\s*14%/s);
assert.match(css, /\.attribute-forca\s*\{[^}]*left:\s*18%/s);
assert.match(css, /\.attribute-intelecto\s*\{[^}]*left:\s*82%/s);
assert.match(css, /\.attribute-presenca\s*\{[^}]*left:\s*31%/s);
assert.match(css, /\.attribute-vigor\s*\{[^}]*left:\s*69%/s);
assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);

console.log("Sistema visual e constelação de atributos passaram.");
