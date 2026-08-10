import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

const pagesThatShouldBeIndexable = [
  "insights/commercial-appraisal-documents-ontario/index.html",
  "insights/industrial-property-appraisal-factors-ontario/index.html",
  "windsor/commercial-appraisal/index.html",
  "windsor/industrial-appraisal/index.html",
  "windsor/investment-appraisal/index.html",
  "windsor/litigation-support/index.html",
];

const expectedSitemapRoutes = [
  "/insights/commercial-appraisal-documents-ontario/",
  "/insights/industrial-property-appraisal-factors-ontario/",
  "/windsor/commercial-appraisal",
  "/windsor/industrial-appraisal",
  "/windsor/investment-appraisal",
  "/windsor/litigation-support",
];

for (const relativePath of pagesThatShouldBeIndexable) {
  const html = await readFile(path.join(root, relativePath), "utf8");
  if (/noindex/i.test(html)) failures.push(`${relativePath}: still contains noindex`);
  for (const pattern of [
    /50,000\+?\s+(?:appraisal\s+)?files/i,
    /all major (?:Canadian )?(?:banks|lenders|financial institutions)/i,
    /15\s*(?:to|–|-)\s*30\s*percent/i,
    /driving meaningful demand growth/i,
  ]) {
    if (pattern.test(html)) failures.push(`${relativePath}: contains an unsupported strong claim`);
  }
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
for (const route of expectedSitemapRoutes) {
  if (!sitemap.includes(`https://metrixrealty.com${route}`)) {
    failures.push(`sitemap.xml: missing ${route}`);
  }
}

const vercel = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
const redirectMap = new Map(
  (vercel.redirects ?? []).map(({ source, destination }) => [source, destination]),
);
for (const [source, destination] of [
  ["/insights/aaci-vs-cra-appraisal-designations", "/insights/what-is-aaci-designation/"],
  ["/insights/cuspap-2026-ontario-appraisal-clients", "/insights/what-is-cuspap/"],
]) {
  if (redirectMap.get(source) !== destination) {
    failures.push(`vercel.json: ${source} should redirect to ${destination}`);
  }
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", ".vercel", "node_modules"].includes(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(absolutePath)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolutePath);
  }
  return files;
}

for (const absolutePath of await findHtmlFiles(root)) {
  const html = await readFile(absolutePath, "utf8");
  const relativePath = path.relative(root, absolutePath);
  if (/"aggregateRating"/i.test(html)) {
    failures.push(`${relativePath}: contains self-serving aggregateRating markup`);
  }

  const jsonLdPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(jsonLdPattern)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      failures.push(`${relativePath}: contains invalid JSON-LD (${error.message})`);
    }
  }
}

if (failures.length) {
  console.error("Search-readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Search-readiness check passed: approved pages are indexable, routed, and contain valid search markup.");
