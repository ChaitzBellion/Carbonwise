import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number.parseInt(process.env.PORT || "4173", 10);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function resolvePath(urlPath) {
  const requestedPath = normalize(decodeURIComponent(urlPath.split("?")[0]));
  const safePath = requestedPath === "/" ? "/index.html" : requestedPath;
  const fullPath = join(root, safePath);
  return fullPath.startsWith(root) ? fullPath : join(root, "index.html");
}

const server = createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");
  const targetPath = existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : join(root, "index.html");
  const contentType = mimeTypes[extname(targetPath)] || "application/octet-stream";

  response.writeHead(200, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": shouldAvoidCache(targetPath)
      ? "no-store"
      : "public, max-age=3600",
  });

  createReadStream(targetPath).pipe(response);
});

server.listen(port, () => {
  console.log(`CarbonWise is running at http://localhost:${port}`);
});

function shouldAvoidCache(targetPath) {
  return targetPath.endsWith("index.html")
    || targetPath.endsWith(".js")
    || targetPath.endsWith(".css");
}
