import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(rootDir, "dist");
const host = "127.0.0.1";
const port = 4173;

if (!existsSync(distDir)) {
  console.error("Finance Pilot build output was not found.");
  console.error(`Expected dist folder at: ${distDir}`);
  console.error("Run a production build first.");
  process.exit(1);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

createServer((req, res) => {
  const urlPath = req.url?.split("?")[0] ?? "/";
  const safePath = normalize(urlPath).replace(/^(\.\.[\\/])+/, "");
  let filePath = join(distDir, safePath === "/" ? "index.html" : safePath);

  if (!existsSync(filePath) || (existsSync(filePath) && statSync(filePath).isDirectory())) {
    filePath = join(distDir, "index.html");
  }

  const extension = extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", mimeTypes[extension] ?? "application/octet-stream");
  createReadStream(filePath).pipe(res);
}).listen(port, host, () => {
  console.log(`Finance Pilot preview is running at http://${host}:${port}`);
});
