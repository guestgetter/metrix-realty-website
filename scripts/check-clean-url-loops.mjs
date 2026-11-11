import { statSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".vercel", "node_modules"]);
const horizontalOverflowGuardFiles = new Set(["team.html"]);

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(absolutePath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function cleanRouteFor(relativePath) {
  const webPath = relativePath.split(path.sep).join("/");

  if (webPath === "index.html") return "/";
  if (webPath.endsWith("/index.html")) {
    return `/${webPath.slice(0, -"/index.html".length)}`;
  }

  return `/${webPath.slice(0, -".html".length)}`;
}

function redirectTargets(html) {
  const targets = [];
  const scriptRedirect = /window\.location\.(?:replace|assign)\(\s*(["'`])([^"'`]+)\1\s*\)/gi;
  const refreshTag = /<meta\b[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi;

  for (const match of html.matchAll(scriptRedirect)) {
    targets.push({ source: "JavaScript redirect", target: match[2] });
  }

  for (const match of html.matchAll(refreshTag)) {
    const target = match[0].match(/url\s*=\s*([^"'\s;>]+)/i)?.[1];
    if (target) targets.push({ source: "meta refresh", target });
  }

  return targets;
}

function normalizedPathname(target, route) {
  const base = new URL(route, "https://metrixrealty.com");
  const pathname = new URL(target, base).pathname;
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

function servedFileExists(pathname) {
  const webPath = pathname.replace(/^\/+/, "");
  if (webPath === "") return true;
  const trimmed = webPath.replace(/\/+$/, "");
  return [webPath, `${trimmed}.html`, `${trimmed}/index.html`].some((candidate) => {
    const stats = statSync(path.join(root, candidate), { throwIfNoEntry: false });
    return stats?.isFile() ?? false;
  });
}

const failures = [];
const overflowGuardFailures = [];
const servedRouteFailures = [];
const relativeUrlFailures = [];
const filesByRoute = new Map();

for (const absolutePath of await findHtmlFiles(root)) {
  const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
  const route = cleanRouteFor(relativePath);
  const html = await readFile(absolutePath, "utf8");
  filesByRoute.set(route, [...(filesByRoute.get(route) ?? []), relativePath]);

  for (const redirect of redirectTargets(html)) {
    if (normalizedPathname(redirect.target, route) === route) {
      failures.push({ relativePath, route, ...redirect });
    }
  }

  if (horizontalOverflowGuardFiles.has(relativePath)) {
    const htmlClasses = html.match(/<html\b[^>]*class=["']([^"']*)["']/i)?.[1] ?? "";
    const bodyClasses = html.match(/<body\b[^>]*class=["']([^"']*)["']/i)?.[1] ?? "";

    if (
      !htmlClasses.split(/\s+/).includes("overflow-x-hidden") ||
      !bodyClasses.split(/\s+/).includes("overflow-x-hidden")
    ) {
      overflowGuardFailures.push(relativePath);
    }
  }

  // Vercel serves each page at /X and /X/, so a relative URL resolves to two
  // different places. Until November 2026 eight insights articles loaded
  // ../assets/js/analytics-tracking.js, which is a 404 at their canonical
  // trailing-slash URL: no phone, email, CTA or scroll events were recorded
  // there, the author photo was broken and the Insights breadcrumb led to a 404.
  if (/<script\b[^>]*\bsrc=["'](?!\/)[^"']*analytics-tracking\.js/.test(html)) {
    relativeUrlFailures.push(`${relativePath}: load the tracking script as /assets/js/analytics-tracking.js`);
  }
  const canonical = html.match(/<link rel="canonical" href="https:\/\/metrixrealty\.com([^"]*)"/)?.[1];
  if (canonical !== undefined) {
    for (const [, url] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^(?:\/|https?:|#|mailto:|tel:|data:|javascript:)/.test(url)) continue;
      const pathname = decodeURIComponent(new URL(url, `https://metrixrealty.com${canonical || "/"}`).pathname);
      if (!servedFileExists(pathname)) {
        relativeUrlFailures.push(`${relativePath}: "${url}" resolves to ${pathname} at the canonical URL, which does not exist; use a path that starts with /`);
      }
    }
  }

  // The London map's horizontal AOS entrance shifted the map 100px past a
  // 390px viewport and made the production page 475px wide.
  if (relativePath === "london/index.html" && /data-aos=["']fade-left["']>\s*<!-- Google Map Embed -->/.test(html)) {
    overflowGuardFailures.push(`${relativePath}: map uses a horizontal entrance animation`);
  }
}

// One file per page. Vercel clean URLs serve X.html at /X and /X/ and never
// serve a sibling X/index.html. Until November 2026 the repo held 36 pages
// twice, the copies drifted, and changes merged to the unserved copy (five
// service pages, two agent pull requests) never reached the public site.
const duplicateRoutes = [...filesByRoute].filter(([, files]) => files.length > 1);

for (const [file, marker] of [
  ["services/commercial-property-valuations.html", 'href="/london/commercial-appraisal/"'],
  ["insights/commercial-appraisal-documents-ontario.html", "London commercial appraisal service</a>"],
  ["insights/industrial-property-appraisal-factors-ontario.html", "London industrial appraisal service</a>"],
]) {
  if (!(await readFile(path.join(root, file), "utf8")).includes(marker)) {
    servedRouteFailures.push(file);
  }
}

if (duplicateRoutes.length > 0) {
  console.error("Pages with two source files (only the .html file is served; delete the index.html copy):");
  for (const [route, files] of duplicateRoutes) {
    console.error(`- ${route}: ${files.join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error("Clean-URL self-redirects detected:");
  for (const failure of failures) {
    console.error(
      `- ${failure.relativePath}: ${failure.source} sends ${failure.route} back to itself`
    );
  }
}

if (overflowGuardFailures.length > 0) {
  console.error("Required mobile overflow guards are missing:");
  for (const relativePath of overflowGuardFailures) {
    console.error(`- ${relativePath}: html and body must both include overflow-x-hidden`);
  }
}

if (servedRouteFailures.length > 0) {
  console.error("Conversion paths missing from a served page:", servedRouteFailures.join(", "));
}

if (relativeUrlFailures.length > 0) {
  console.error("Relative URLs that break on the public page:");
  for (const failure of relativeUrlFailures) console.error(`- ${failure}`);
}

if (failures.length > 0 || overflowGuardFailures.length > 0 || servedRouteFailures.length > 0 || duplicateRoutes.length > 0 || relativeUrlFailures.length > 0) process.exit(1);

console.log("Route check passed: one file per page, clean URLs and mobile overflow guards are valid.");
