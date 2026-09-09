import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BOOKING_WIDGET_SRC,
  isSimpleWindsorResidential,
  isWindsorMarket,
} from "../assets/js/booking-screening-rules.mjs";

const root = process.cwd();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const contactHtml = await readFile(path.join(root, "contact/index.html"), "utf8");
const screeningJs = await readFile(
  path.join(root, "assets/js/booking-screening.js"),
  "utf8",
);

assert(
  contactHtml.includes('id="booking-screening-form"'),
  "contact/index.html: missing booking-screening-form",
);
assert(
  contactHtml.includes('name="purpose"'),
  "contact/index.html: missing required purpose field",
);
assert(
  contactHtml.includes('name="propertyType"'),
  "contact/index.html: missing required propertyType field",
);
assert(
  contactHtml.includes('name="market"'),
  "contact/index.html: missing required market/location field",
);
assert(
  contactHtml.includes('id="booking-soft-gate"'),
  "contact/index.html: missing Windsor residential soft-gate panel",
);
assert(
  contactHtml.includes("Standard residential in Windsor"),
  "contact/index.html: soft-gate copy missing",
);
assert(
  /id="booking-calendar-stage"\s+hidden/.test(contactHtml),
  "contact/index.html: calendar stage should start hidden until screening completes",
);
assert(
  !/<iframe\b[^>]*\ssrc=["']https:\/\/api\.leadconnectorhq\.com\/widget\/booking\//i.test(
    contactHtml,
  ),
  "contact/index.html: HighLevel iframe must not auto-load with src before screening",
);
assert(
  contactHtml.includes(`data-booking-src="${BOOKING_WIDGET_SRC}"`) ||
    contactHtml.includes(BOOKING_WIDGET_SRC),
  `contact/index.html: must still reference HighLevel booking widget ${BOOKING_WIDGET_SRC}`,
);
assert(
  contactHtml.includes('type="module" src="/assets/js/booking-screening.js"'),
  "contact/index.html: missing booking-screening.js module script",
);
assert(
  contactHtml.includes("Quick question before you book"),
  "contact/index.html: missing chat-style purpose prompt",
);
assert(
  contactHtml.includes("Book a Call with an Appraiser"),
  "contact/index.html: booking heading should match client wording",
);
assert(
  screeningJs.includes("booking-screening-rules.mjs"),
  "booking-screening.js: must import shared screening rules",
);

assert(
  isSimpleWindsorResidential({
    purpose: "mortgage_refinance",
    propertyType: "residential_single",
    market: "windsor_essex",
    cityDetail: "",
  }) === true,
  "rules: mortgage + single-family + Windsor must soft-gate",
);

assert(
  isSimpleWindsorResidential({
    purpose: "purchase_sale",
    propertyType: "residential_single",
    market: "other_swo",
    cityDetail: "South Windsor",
  }) === true,
  "rules: purchase + single-family + city mentioning Windsor must soft-gate",
);

assert(
  isSimpleWindsorResidential({
    purpose: "estate_probate",
    propertyType: "residential_single",
    market: "windsor_essex",
    cityDetail: "",
  }) === false,
  "rules: estate residential Windsor must NOT soft-gate",
);

assert(
  isSimpleWindsorResidential({
    purpose: "mortgage_refinance",
    propertyType: "commercial",
    market: "windsor_essex",
    cityDetail: "",
  }) === false,
  "rules: commercial Windsor must NOT soft-gate",
);

assert(
  isSimpleWindsorResidential({
    purpose: "mortgage_refinance",
    propertyType: "residential_single",
    market: "london_middlesex",
    cityDetail: "London",
  }) === false,
  "rules: London residential mortgage must NOT soft-gate",
);

assert(
  isWindsorMarket("windsor_essex", "") === true,
  "rules: windsor_essex market flag must match",
);

assert(
  isWindsorMarket("other_swo", "Tecumseh") === true,
  "rules: Tecumseh city detail should count as Windsor-Essex market",
);

if (failures.length) {
  console.error("Booking screening checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Booking screening checks passed.");
