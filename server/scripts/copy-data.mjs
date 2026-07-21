import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src/data/barangays-index.json");
const destDir = path.join(root, "dist/data");
const dest = path.join(destDir, "barangays-index.json");

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("Copied barangays-index.json to dist/data");
