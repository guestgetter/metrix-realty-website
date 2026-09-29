import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("assets/js/analytics-tracking.js", "utf8");

function form(id) {
  const listeners = new Map();
  return {
    id,
    addEventListener(type, callback) { listeners.set(type, callback); },
    submit() { listeners.get("submit")?.(); },
  };
}

const screening = form("booking-screening-form");
const inquiry = form("contact-inquiry-form");
const dataLayer = [];
let ready;
const document = {
  addEventListener(type, callback) {
    if (type === "DOMContentLoaded") ready = callback;
  },
  querySelectorAll(selector) {
    return selector === "form" ? [screening, inquiry] : [];
  },
};
const window = {
  dataLayer,
  location: { href: "https://metrixrealty.com/contact" },
  addEventListener() {},
};

vm.runInNewContext(source, { document, window, console: { log() {} } });
if (typeof ready !== "function") throw new Error("Analytics did not initialize");
ready();

screening.submit();
if (dataLayer.some(({ event }) => event === "form_submit")) {
  throw new Error("Booking screening incorrectly emitted form_submit");
}

inquiry.submit();
if (dataLayer.filter(({ event }) => event === "form_submit").length !== 1) {
  throw new Error("A real form submission should emit one form_submit");
}

console.log("Analytics check passed: screening is excluded from form_submit.");
