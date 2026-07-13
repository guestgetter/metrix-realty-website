import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".vercel", "node_modules"]);
const horizontalOverflowGuardFiles = new Set(["team.html", "team/index.html"]);

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

const failures = [];
const overflowGuardFailures = [];

for (const absolutePath of await findHtmlFiles(root)) {
  const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
  const route = cleanRouteFor(relativePath);
  const html = await readFile(absolutePath, "utf8");

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

if (failures.length > 0 || overflowGuardFailures.length > 0) process.exit(1);

console.log("Route check passed: clean URLs and mobile overflow guards are valid.");
