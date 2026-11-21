// Prints the value to paste into the DASHBOARD_DATA environment variable on Vercel.
// Usage: yarn -s data:env            (prints to the terminal)
//        yarn -s data:env | pbcopy   (copies to the clipboard on macOS)
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const file = process.argv[2] ?? "data/macwest-dashboard-data.json";
const json = JSON.stringify(JSON.parse(readFileSync(file, "utf8"))); // minify, and fail on bad JSON
process.stdout.write("gz:" + gzipSync(json, { level: 9 }).toString("base64"));
