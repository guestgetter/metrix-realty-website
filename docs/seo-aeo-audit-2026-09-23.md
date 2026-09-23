# Metrix Realty Group: local SEO and AEO audit

Date: 2026-09-23. Internal working document. No client communication was sent.

## Outcome and evidence boundary

The business outcome is more qualified appraisal inquiries and booked consultations, especially commercial, industrial, investment, and litigation work. Inquiry volume, booked work, lead value, and conversion rate were not available in this audit. Search rank alone is not the success measure.

The owning repository is `guestgetter/metrix-realty-website`; the canonical domain is `https://metrixrealty.com/`. Vercel project `prj_Tm2P80XMvhfWpqEhqeuLFCUNSpm5` and team `team_ONIW2RROSDGX5MJqWUCEeMYm` served production deployment `dpl_AgqNm1GLAaWk2wHViiyeN9FGJd12`, READY at Git SHA `9e9592aec2a62013a25ebbc801a14e31f375ae0e` when checked. The `.ca` domain redirects to `.com`.

Evidence labels below distinguish live observations, internal registry context, one-time SERP snapshots, and work requiring account access. The Company OS client registry lists GA4 property `501760943`, GSC property `sc-domain:metrixrealty.com`, and two GBP location IDs. The first two were read through the existing Company OS runtime credential. GBP profile fields, GBP performance, and CRM outcomes were not read. Search Console was signed out in Computer Use, and the separate `.cursor` service account lacked property access; the Company OS credential worked. The guarded 1Password DataForSEO lookup timed out and was not retried; existing runtime credentials supported the direct DataForSEO calls below. No qualified-lead or booked-work count is claimed.

## First-party baseline

GSC and GA4 reports for 2026-08-24 through 2026-09-21, pulled with the existing Company OS credential:

| Source | Verified observation | Interpretation limit |
| --- | --- | --- |
| GSC domain property | 282 clicks, 19,982 impressions, 1.41% CTR, average position 12.0 | Search traffic, not leads. Disclosed query rows can be anonymized or filtered and should not be summed to the property total. |
| GSC top pages | Homepage 99 clicks / 1,982 impressions; AACI article 32 / 4,947; `/team` 21 / 339; bank-versus-private appraisal article 17 / 2,098; Jeff Petruzella profile 13 / 98 | Page-level search demand points to educational content and team credibility alongside the homepage. |
| GSC disclosed queries | `metrix realty group` 22 clicks / 48 impressions; `metrix realty` 21 / 33; `metrix appraisals` 10 / 21; `aaci` 2 / 491; `cuspap` 2 / 178 | Branded clicks are prominent among disclosed queries; informational terms have impressions but few clicks. This is not a complete query export. |
| GA4 property | 631 sessions; landing pages `/` 240 sessions, `/team` 53, AACI article 41, `/contact` 22 | Sessions do not establish qualified inquiries or bookings. |
| GA4 events | `cta_click` 54, `form_submit` 16, `form_start` 10, `phone_call` 2. GA4 counted 2 key events, both `phone_call`. | Event counts are not distinct qualified leads. `form_submit` is not currently a key event; booking completion and CRM receipt need validation. |

## Fresh search and competitive snapshot

DataForSEO Google mobile organic live/advanced, English, depth 10, 2026-09-23. These are single point-in-time observations, sensitive to location and result layout:

| Buyer query and location | Metrix result | Other observed results |
| --- | --- | --- |
| `real estate appraiser london ontario`, London | Homepage organic absolute #8; absent from top three local-pack entries | Local pack: Riverbend Appraisals #1, Otto & Company #2, Greenside Appraisals #3. Organic: Valco #5, Riverbend #6, Otto #9, Total Property Insight #10. |
| `real estate appraiser windsor ontario`, Windsor | GBP local-pack item absolute #5; `/windsor/` organic absolute #11 | RM Valuations and F R Jordan appeared in the local pack; E.S. Gorski organic #8. The result set included an ad-like local-pack item at absolute #3. |

This establishes a local-pack and organic displacement opportunity. It does not establish a trend or expected ranking lift. Broader competitive claims and geo-grid coverage remain unmeasured.

A separate DataForSEO Google AI Mode live/advanced test on 2026-09-23 used mobile English in London and asked, `Which company can appraise a commercial property in London Ontario?` The generated answer named Metrix with Valco, Colliers, and Aion and cited the Metrix homepage plus `valcoconsultants.com`, `aionappraisals.ca`, and `collierscanada.com`. This is one prompt in one location, not citation share. Its broad lender and standards language should be checked against the cited source before repeating it.

## Entity and site audit

- **Entity:** Metrix Realty Group. The site and Company OS registry identify London and Windsor offices, real estate appraisal services, and AACI/CRA-designated professionals. The registry lists `Real estate appraiser` as both GBP primary categories. Current GBP category, verification, hours, action links, photos, services, and review details still require a first-party profile read.
- **Address consistency:** the site footer and schema use `620A Richmond Street, Suite 203` in London, while the London page displays `620 Richmond St` and the Company OS GBP pointer records `620 Richmond Street Suite 203`. This pass preserves those variants pending authoritative confirmation. Confirm the exact postal/GBP address with the business before editing the site, profile, or third-party citations. Windsor is recorded as `2557 Dougall Ave #6`.
- **Crawlability:** the live homepage and sitemap returned HTTP 200 from Vercel; the `.ca` domain returned a 301 to `.com`. Locally, all 48 sitemap URLs mapped to an HTML file with matching canonical and without `noindex`. `robots.txt` exposes the sitemap and allows major search crawlers. Search Console indexing, crawl diagnostics, Core Web Vitals, and mobile field data were not pulled in this pass.
- **AEO integrity:** the live homepage and London page carried FAQ JSON-LD that made claims absent from visible FAQ answers, including absolute lender acceptance, unverified volume and turnaround promises, and superlatives. The homepage also animated a visible 50,000 file count to 60,000; static Google review numbers could age. Google says structured data should describe user-visible information, and self-serving local-business review markup does not earn review snippets. The site had already removed aggregate rating markup. See [Google structured data policy](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business), and [review snippet policy](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).
- **Conversion:** the current `/contact` page presents click-to-call/email and a three-question booking screen for purpose, property type, and market. The code specifically screens simple single-family Windsor mortgage/purchase requests while retaining complex work. The booking path has repository tests. GA4 recorded 16 `form_submit` events but they are not key events; the 2 key events were phone calls. The end-to-end lead receipt, calendar completion, response time, and CRM sink were not verified. The Company OS readiness matrix marks the primary conversion definition and CRM lead sink as incomplete.
- **Content and authority:** the site has London/Windsor service pages and appraisal guidance. The most defensible next content is based on actual inquiry questions and named appraiser review, especially appraisal purpose, lender requirements, estate/divorce, and complex Windsor assignments. Avoid generic city pages or unsupported turnaround/pricing claims. Relevant corroboration candidates include AIC member profiles, professional associations, lender directories, local chambers, and existing directory listings; ownership and NAP should be confirmed before edits.
- **AI answers:** the one Google AI Mode prompt above named and cited Metrix. ChatGPT and Perplexity prompt tests were not available. The site now provides concise service and location facts in `llms.txt`, but no citation or ranking effect is assumed.

## Work executed on the branch

1. Removed mismatched FAQPage JSON-LD from the homepage and London page; the visible FAQs remain.
2. Replaced prominent unsupported superlatives, animated file volume, and static review counts on the homepage and London page with service, location, and contact facts. Preserved the review destination as a link.
3. Removed unsupported entity descriptions from homepage, London, and Windsor schema. Replaced the long claim-heavy `llms.txt` with a concise directory of real site pages and contact facts. The address variants remain unresolved.
4. Fixed a confirmed production mobile layout defect on `/london/`: the map's horizontal entrance animation shifted it outside a 390px viewport, expanding document width to 475px. The map now enters vertically.
5. Added regression checks to the existing build gate for the claims, mismatched FAQ markup, and London map animation.

These are branch changes until a verified production deployment and live route check are recorded. No GBP, citation, or analytics profile was modified.

## Prioritized roadmap

| Priority | Action and evidence | Acceptance check | Status |
| --- | --- | --- | --- |
| P0 | Ship the entity-copy and schema parity cleanup above. The source defect is present in the current production HTML. | Build/tests pass, preview is compared visually with live, production is READY, changed routes and `llms.txt` read back with cache busting. | Branch implementation done; release QA pending. |
| P0 | Define the primary qualified-lead event and test contact intake through calendar booking, lead receipt, source attribution, and response. GA4 currently treats phone calls as its only observed key events, while `form_submit` is not key. | GA4/GTM event fires once per completed inquiry or booking; CRM lead matches it; owner can report qualified inquiries and booked consultations without double counting. | Analytics baseline verified; CRM/calendar validation and conversion configuration pending. |
| P1 | Read both GBP profiles and reconcile London `620` versus `620A`, hours, primary/secondary categories, services, photos, description, and booking/website links. Google says completeness and accuracy inform local relevance; reviews and links contribute to prominence. | First-party profile export and public Maps readback match verified business facts; both contact links work. | Not edited; actual profile fields and authoritative address require confirmation. |
| P1 | Extend the GSC/GA4 baseline with GBP calls, website clicks, and direction requests by location. Repeat the two DataForSEO queries or a geo-grid under a defined budget. | Dated dashboard separates local pack, organic, GBP actions, qualified leads, and booked work. | GSC/GA4 baseline captured; GBP action data and repeat search tracking pending. |
| P1 | Tighten London and Windsor service-page answers with appraiser-reviewed examples and distinct local proof, then test internal links and quote paths. Preserve Windsor screening for simple residential requests. | Each priority page answers who it is for, report purpose, required inputs, scope, service area, and next action; SME signs off; page is indexed. | Planned. |
| P2 | Correct the confirmed address and business facts in AIC, lender, and relevant local citations; earn local mentions where there is a real relationship. | Priority citations agree with verified GBP and site NAP; referral links and lead sources tracked. | Awaiting address confirmation and profile access. |
| P2 | Expand the one Google AI Mode test into a fixed buyer-prompt set across ChatGPT Search, Perplexity, and Google AI answers; record named firms and cited sources. Pursue cited third-party sources where Metrix has real evidence to contribute. | Prompt, location, date, answer, citation URLs, and action taken captured; rerun after changes. | One London AI Mode prompt recorded; broader set pending. |
| P3 | Consider intent-matched paid search only after the booking and CRM loop is proven. Avoid paying for simple Windsor residential demand the team cannot serve. | Qualified lead and booked-work attribution by campaign with owner-approved budget. | Not launched. |

[Google's local ranking guidance](https://support.google.com/business/answer/7091?hl=en) identifies relevance, distance, and prominence; there is no way to buy a better organic local ranking. The immediate plan focuses on accurate entity information, real proof, and a measured contact path rather than promised rank movement.
