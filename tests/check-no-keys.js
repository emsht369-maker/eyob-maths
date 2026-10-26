"use strict";

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const ignoredDirectories = new Set([".git", ".venv", "node_modules", ".wrangler"]);
const ignoredFiles = new Set([".dev.vars", ".env", "key.gemini"]);
const geminiPrefix = ["AI", "za"].join("");
const groqPrefix = ["g", "sk_"].join("");
const providerPrefix = ["AQ", ".", "Ab"].join("");
const patterns = [
  new RegExp(geminiPrefix),
  new RegExp(groqPrefix),
  new RegExp(providerPrefix)
];
const findings = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    if (entry.isFile() && ignoredFiles.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(file);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(file);
      if (content.includes(0)) continue;
      const text = content.toString("utf8");
      if (patterns.some(pattern => pattern.test(text))) findings.push(path.relative(root, file));
    }
  }
}

walk(root);
if (findings.length) {
  console.error(`Possible API key string found in: ${findings.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("No API key-like strings found in project text files.");
}
