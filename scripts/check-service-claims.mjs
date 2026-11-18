import { readFile } from 'node:fs/promises';

// These canonical production pages previously promised lender acceptance and
// fixed rush delivery, including answers hidden in structured data.
const pages = ["london/residential-appraisal/index.html", "windsor/commercial-appraisal/index.html", "windsor/industrial-appraisal/index.html", "windsor/investment-appraisal/index.html", 'services/index.html', 'services/commercial-property-valuations.html',
  'services/residential-property-appraisals.html', 'london/commercial-appraisal/index.html'];
const failures = [];
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  for (const pattern of [/all major Canadian (?:banks|lenders|financial institutions)/i,
    /24\s*[–-]\s*48 hours/i, /(?:Standard[^<.]*: )?[25]\s*–\s*(?:5|10) business days/i,
    /non-negotiable|unique in the London market|meet all institutional requirements/i]) {
    if (pattern.test(html)) failures.push(`${page}: unsupported acceptance, credential or delivery promise`);
  }
  if (/"@type"\s*:\s*"FAQPage"/.test(html)) {
    failures.push(`${page}: remove stale FAQ markup until its answers are reconciled with visible copy`);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('Service claims passed: canonical pages make no blanket acceptance or rush promises.');
