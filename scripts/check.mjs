import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
let count = 0;
for (const directory of [".", "supplements", "scripts", "tests"]) {
  const entries = await readdir(resolve(root, directory), { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isFile() || !/\.(?:js|mjs)$/.test(entry.name)) continue;
    const file = resolve(root, directory, entry.name);
    const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
    if (result.error) console.error(result.error.message);
    if (result.status !== 0) process.exit(result.status ?? 1);
    count += 1;
  }
}
console.log(`Sintaxe validada em ${count} arquivos JavaScript.`);
