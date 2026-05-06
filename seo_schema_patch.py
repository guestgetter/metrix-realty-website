"""
SEO Schema Patch — Metrix Realty Group
Adds Person schema to 15 team pages + upgrades MPAC/ARB headings on litigation page.
Run from repo root: python3 seo_schema_patch.py
"""

import json, re, sys
from pathlib import Path

ROOT = Path(__file__).parent

# ---------------------------------------------------------------------------
# Team member data
# ---------------------------------------------------------------------------

TEAM = [
    {
        "slug":        "dan-van-houtte",
        "name":        "Daniel J. Van Houtte",
        "jobTitle":    "CEO and President",
        "honorific":   "MRICS, P.App., AACI, PLE",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Member of the Royal Institution of Chartered Surveyors (MRICS)"},
            {"name": "Professional Legal Expert (PLE)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "sam-van-houtte",
        "name":        "Sam Van Houtte",
        "jobTitle":    "Vice-President of Appraisal Operations",
        "honorific":   "BMOS, AACI, P.App.",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "ali-mahfoud",
        "name":        "Ali Mahfoud",
        "jobTitle":    "Senior Appraiser",
        "honorific":   "B.A., P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "james-sibbald",
        "name":        "James Sibbald",
        "jobTitle":    "Appraiser Candidate",
        "honorific":   "B.Sc., M.Sc., AIC Candidate",
        "credentials": [
            {"name": "AIC Candidate Member"},
        ],
    },
    {
        "slug":        "jeff-petruzella",
        "name":        "Jeff J.N. Petruzella",
        "jobTitle":    "Vice-President of Residential Operations",
        "honorific":   "Hons. B.A., P.App., CRA",
        "credentials": [
            {"name": "Canadian Residential Appraiser (CRA)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "john-carter",
        "name":        "John S. Carter",
        "jobTitle":    "Senior Appraiser",
        "honorific":   "Hons. B.Comm., P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "madison-collver",
        "name":        "Madison Collver",
        "jobTitle":    "Appraiser",
        "honorific":   "B.Comm., P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "maia-mcclintock",
        "name":        "Maia McClintock",
        "jobTitle":    "Senior Appraiser",
        "honorific":   "Hons. B.A., P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "mark-penhale",
        "name":        "Mark Penhale",
        "jobTitle":    "Agricultural and Industrial Property Specialist",
        "honorific":   "P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "mason-hewitt",
        "name":        "Mason L. Hewitt",
        "jobTitle":    "Appraiser Candidate",
        "honorific":   "B.A., AIC Candidate",
        "credentials": [
            {"name": "AIC Candidate Member"},
        ],
    },
    {
        "slug":        "michael-fry",
        "name":        "Michael R. Fry",
        "jobTitle":    "Appraiser Candidate",
        "honorific":   "B.A., AIC Candidate",
        "credentials": [
            {"name": "AIC Candidate Member"},
        ],
    },
    {
        "slug":        "paula-busch",
        "name":        "Paula E. Busch",
        "jobTitle":    "Vice President of Commercial Appraisal Operations",
        "honorific":   "Hons. B.A., P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "roman-virk",
        "name":        "Roman Virk",
        "jobTitle":    "Appraiser",
        "honorific":   "BMOS, P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "suzanne-de-jong",
        "name":        "Suzanne De Jong",
        "jobTitle":    "Vice President of Commercial Appraisal Operations",
        "honorific":   "Hons. B.A., P.App., AACI",
        "credentials": [
            {"name": "Accredited Appraiser Canadian Institute (AACI)"},
            {"name": "Professional Appraiser (P.App.)"},
        ],
    },
    {
        "slug":        "tyler-munn",
        "name":        "Tyler Munn",
        "jobTitle":    "Appraiser Candidate",
        "honorific":   "B.A., AIC Candidate",
        "credentials": [
            {"name": "AIC Candidate Member"},
        ],
    },
]

ORG = {
    "@type": "Organization",
    "@id":   "https://metrixrealty.com/#organization",
    "name":  "Metrix Realty Group",
    "url":   "https://metrixrealty.com",
}

# ---------------------------------------------------------------------------
# Helper: insert JSON-LD before </head>
# ---------------------------------------------------------------------------

def inject_schema(html: str, schema_obj: dict) -> str:
    block = (
        '\n    <script type="application/ld+json">\n'
        + json.dumps(schema_obj, indent=4, ensure_ascii=False)
        + "\n    </script>"
    )
    # Insert before </head> — avoid duplicating if already present
    marker = '"@type": "Person"'
    if marker in html:
        print("  [skip] Person schema already present")
        return html
    return html.replace("</head>", block + "\n</head>", 1)

# ---------------------------------------------------------------------------
# 1. Person schema on all 15 team pages
# ---------------------------------------------------------------------------

print("=== Adding Person schema to team pages ===\n")

for member in TEAM:
    path = ROOT / member["slug"] / "index.html"
    if not path.exists():
        print(f"  [warn] not found: {path}")
        continue

    schema = {
        "@context":      "https://schema.org",
        "@type":         "Person",
        "name":          member["name"],
        "honorificSuffix": member["honorific"],
        "jobTitle":      member["jobTitle"],
        "url":           f"https://metrixrealty.com/{member['slug']}/",
        "worksFor":      ORG,
        "hasCredential": member["credentials"],
        "knowsAbout": [
            "Real estate appraisal",
            "Property valuation",
            "CUSPAP compliant appraisal",
            "Commercial real estate",
            "Southwestern Ontario real estate",
        ],
    }

    html = path.read_text(encoding="utf-8")
    updated = inject_schema(html, schema)
    if updated != html:
        path.write_text(updated, encoding="utf-8")
        print(f"  [ok] {member['slug']} — Person schema added")
    else:
        print(f"  [skip] {member['slug']} — no change")

# ---------------------------------------------------------------------------
# 2. Litigation page — promote MPAC / ARB / OLT into H2 headings
# ---------------------------------------------------------------------------

print("\n=== Upgrading MPAC/ARB headings on litigation page ===\n")

lit_path = ROOT / "services" / "litigation-support-expert-testimony" / "index.html"
html = lit_path.read_text(encoding="utf-8")
original = html

# Change H3 "Property Tax Appeals" -> more keyword-rich text
html = html.replace(
    '<h3 class="text-lg font-bold text-gray-900 mb-3">Property Tax Appeals</h3>',
    '<h3 class="text-lg font-bold text-gray-900 mb-3">MPAC Property Tax Appeals and Assessment Review Board (ARB)</h3>',
)

# Upgrade H3 "Courts & Tribunals Experience" to H2 so ARB/OLT get H2 weight
html = html.replace(
    '<h3 class="text-lg font-bold text-gray-900 mb-3">Courts &amp; Tribunals Experience</h3>',
    '<h2 class="text-lg font-bold text-gray-900 mb-3">Courts and Tribunals: Assessment Review Board (ARB), Ontario Land Tribunal (OLT), and Ontario Superior Court</h2>',
)
# Also handle unescaped ampersand version just in case
html = html.replace(
    '<h3 class="text-lg font-bold text-gray-900 mb-3">Courts & Tribunals Experience</h3>',
    '<h2 class="text-lg font-bold text-gray-900 mb-3">Courts and Tribunals: Assessment Review Board (ARB), Ontario Land Tribunal (OLT), and Ontario Superior Court</h2>',
)

if html != original:
    lit_path.write_text(html, encoding="utf-8")
    print("  [ok] litigation page headings updated")
else:
    print("  [warn] no changes made — check heading text matches exactly")

print("\nDone.")
