import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

// Vercel cleanUrls serves the sibling .html file before the directory index.
// Both sources must carry the approved metadata, or a merged SEO change can
// pass the build while the public article continues serving its old metadata.
const aaciSources = [
  "insights/what-is-aaci-designation/index.html",
  "insights/what-is-aaci-designation.html",
];
const approvedAaciTitle = "What Is the AACI Designation in Canada? | Metrix Realty";
const approvedAaciDescription = "The AACI (Accredited Appraiser Canadian Institute) is Canada's senior appraisal credential. Learn what it means, who holds it, and when to require it.";
const approvedAaciMetadata = {
  title: approvedAaciTitle,
  description: approvedAaciDescription,
  canonical: "https://metrixrealty.com/insights/what-is-aaci-designation/",
  ogTitle: approvedAaciTitle,
  ogDescription: approvedAaciDescription,
  twitterTitle: "What Is the AACI Designation in Canada?",
  twitterDescription: approvedAaciDescription,
  headline: "What Is the AACI Designation in Canada?",
};
const aaciMetadata = [];
for (const relativePath of aaciSources) {
  const html = await readFile(path.join(root, relativePath), "utf8");
  if (!/<div class="comparison-scroll"[^>]*>\s*<table>[\s\S]*?<\/table>\s*<\/div>/.test(html) || !/\.comparison-scroll\s*\{[^}]*overflow-x:\s*auto/.test(html)) {
    failures.push(`${relativePath}: comparison table must scroll within the article on narrow screens`);
  }
  const fields = {
    title: html.match(/<title>([^<]+)<\/title>/)?.[1],
    description: html.match(/<meta name="description" content="([^"]+)"/)?.[1],
    canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
    ogTitle: html.match(/<meta property="og:title" content="([^"]+)"/)?.[1],
    ogDescription: html.match(/<meta property="og:description" content="([^"]+)"/)?.[1],
    twitterTitle: html.match(/<meta name="twitter:title" content="([^"]+)"/)?.[1],
    twitterDescription: html.match(/<meta name="twitter:description" content="([^"]+)"/)?.[1],
    headline: html.match(/"headline"\s*:\s*"([^"]+)"/)?.[1],
  };
  for (const [field, value] of Object.entries(fields)) {
    if (!value) failures.push(`${relativePath}: missing ${field}`);
    else if (value !== approvedAaciMetadata[field]) failures.push(`${relativePath}: ${field} does not match the approved AACI metadata`);
  }
  aaciMetadata.push(fields);
}
for (const field of Object.keys(aaciMetadata[0])) {
  if (aaciMetadata[0][field] !== aaciMetadata[1][field]) {
    failures.push(`AACI clean-URL sources disagree on ${field}; update both article files`);
  }
}

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

// These high-visibility entity surfaces previously published unsupported
// superlatives, static review counts, and FAQ answers absent from the page.
for (const relativePath of ["index.html", "london/index.html", "llms.txt"]) {
  const content = await readFile(path.join(root, relativePath), "utf8");
  for (const pattern of [
    /most trusted|top-ranked|largest team|50,000|all major Canadian lenders|from 35 Google Reviews|typically start at \$450/i,
  ]) {
    if (pattern.test(content)) failures.push(`${relativePath}: contains an unverified entity claim`);
  }
  if (relativePath.endsWith(".html") && /"@type"\s*:\s*"FAQPage"/.test(content)) {
    failures.push(`${relativePath}: contains FAQ schema that does not match visible page answers`);
  }
}

const vercel = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
const redirectMap = new Map(
  (vercel.redirects ?? []).map(({ source, destination }) => [source, destination]),
);
for (const [source, destination] of [
  ["/faq", "/#faq"],
  ["/jpetruzella", "/jeff-petruzella"],
  ["/team2", "/team"],
  ["/services/commercial", "/services/commercial-property-valuations"],
  ["/services/litigation", "/services/litigation-support-expert-testimony"],
  ["/services/residential", "/services/residential-property-appraisals"],
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
