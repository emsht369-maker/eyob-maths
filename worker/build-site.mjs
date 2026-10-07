import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = process.argv[2] && path.resolve(process.argv[2]);
if (!output || output === repo || output.startsWith(repo + path.sep)) {
  throw new Error("Pass a build directory outside the repository, such as /tmp/math-master-site.");
}

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(path.join(directory, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(directory, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

const assetFiles = [
  ...await listFiles(path.join(repo, "js"), "" ).then(files => files.map(file => `js/${file}`)),
  ...await listFiles(path.join(repo, "css"), "" ).then(files => files.map(file => `css/${file}`)),
  ...await listFiles(path.join(repo, "data"), "" ).then(files => files.map(file => `data/${file}`))
].filter(file => /\.(?:js|css)$/.test(file)).sort();

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(repo, "js"), path.join(output, "js"), { recursive: true });
await cp(path.join(repo, "css"), path.join(output, "css"), { recursive: true });
await cp(path.join(repo, "topic"), path.join(output, "topic"), { recursive: true });
await cp(path.join(repo, "data"), path.join(output, "data"), { recursive: true });
await cp(path.join(repo, "assets"), path.join(output, "assets"), { recursive: true });
for (const file of await readdir(repo, { withFileTypes: true })) {
  if (file.isFile() && (file.name.endsWith(".html") || file.name === "_headers" || file.name === "favicon.svg")) {
    await cp(path.join(repo, file.name), path.join(output, file.name));
  }
}

const assetMap = {};
for (const logicalPath of assetFiles) {
  const bytes = await readFile(path.join(repo, logicalPath));
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const extension = path.posix.extname(logicalPath);
  const stem = path.posix.basename(logicalPath, extension);
  const flatPath = path.posix.join(
    "assets",
    `${logicalPath.slice(0, -extension.length).replaceAll("/", "_")}.${digest}${extension}`
  );
  assetMap[logicalPath] = flatPath;
  const target = path.join(output, flatPath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
}

const assetMapScript = `<script>window.MATH_MASTER_ASSETS=Object.freeze(${JSON.stringify(assetMap)});</script>`;
const htmlFiles = (await listFiles(output)).filter(file => file.endsWith(".html"));
for (const relativeName of htmlFiles) {
  const filename = path.join(output, relativeName);
  let html = await readFile(filename, "utf8");
  if (/\/?js\/app\.js/.test(html) && !/\/?js\/answer-feedback\.js/.test(html)) {
    html = html.replace(
      /(<script\b[^>]*\bsrc=(['"])\/*js\/app\.js\2[^>]*><\/script>)/i,
      '<script defer src="/js/answer-feedback.js"></script>$1'
    );
  }
  html = html.replace(/\b(src|href)=(['"])(\/?)(js|css|data)\/([^'"]+)\2/g, (whole, attr, quote, slash, folder, rest) => {
    const suffixIndex = rest.search(/[?#]/);
    const logicalPath = `${folder}/${suffixIndex < 0 ? rest : rest.slice(0, suffixIndex)}`;
    const suffix = suffixIndex < 0 ? "" : rest.slice(suffixIndex);
    const hashed = assetMap[logicalPath];
    return hashed ? `${attr}=${quote}/${hashed}${suffix}${quote}` : whole;
  });
  let inserted = false;
  html = html.replace(/<meta\s+charset=(['"]).*?\1[^>]*>/i, match => {
    inserted = true;
    return `${match}\n${assetMapScript}`;
  });
  if (!inserted) html = html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}\n${assetMapScript}`);
  await writeFile(filename, html);
}

await writeFile(
  path.join(output, "_redirects"),
  "/topic/* /topic/:splat/index.html 200\n"
);

console.log(`Built ${Object.keys(assetMap).length} hashed JS/CSS/data assets in ${output}.`);
