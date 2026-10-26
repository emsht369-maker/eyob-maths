"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { gzipSync } = require("node:zlib");

const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function serve(directory, port = 0) {
  const root = path.resolve(directory);
  const redirects = fs.readFileSync(path.join(root, "_redirects"), "utf8")
    .split(/\r?\n/)
    .map(line => line.trim().split(/\s+/))
    .filter(([source, target, status]) => source && target && status === "200");
  const server = http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
    catch (_) { response.writeHead(400).end(); return; }
    if (pathname === "/") pathname = "/index.html";
    let status = 200;
    let routedPath = pathname;
    for (const [source, target] of redirects) {
      const wildcard = source.indexOf("*");
      const matches = wildcard < 0
        ? pathname === source
        : pathname.startsWith(source.slice(0, wildcard)) &&
          pathname.endsWith(source.slice(wildcard + 1));
      if (!matches) continue;
      const splat = pathname.slice(source.slice(0, wildcard).length,
        pathname.length - source.slice(wildcard + 1).length);
      routedPath = target.replace(":splat", splat);
      break;
    }
    const filename = path.resolve(root, `.${routedPath}`);
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    let target = filename;
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, "index.html");
    }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      status = 404;
      target = path.join(root, "404.html");
    }
    fs.readFile(target, (error, content) => {
      if (error) { response.writeHead(500).end(); return; }
      const headers = { "Content-Type": mime[path.extname(target)] || "application/octet-stream" };
      if (status === 404 || path.extname(target) === ".html") {
        headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      } else if (pathname.startsWith("/assets/")) {
        headers["Cache-Control"] = "public, max-age=31536000, immutable";
      } else if (pathname.startsWith("/js/") || pathname.startsWith("/css/")) {
        headers["Cache-Control"] = "no-cache, must-revalidate";
      }
      const compressible = /^text\//.test(headers["Content-Type"]) || /(?:json|javascript|svg\+xml)/.test(headers["Content-Type"]);
      const acceptsGzip = /\bgzip\b/.test(request.headers["accept-encoding"] || "");
      if (compressible && acceptsGzip) {
        headers["Content-Encoding"] = "gzip";
        headers.Vary = "Accept-Encoding";
        response.writeHead(status, headers);
        response.end(gzipSync(content));
        return;
      }
      response.writeHead(status, headers);
      response.end(content);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

if (require.main === module) {
  const directory = process.argv[2];
  if (!directory) throw new Error("Usage: node tests/serve-pages-preview.js /path/to/pages-build [port]");
  serve(directory, Number(process.argv[3]) || 4173).then(server => {
    console.log(`Pages preview: http://127.0.0.1:${server.address().port}`);
  });
}

module.exports = serve;
