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

const bookingSource = await readFile("assets/js/highlevel-webhook-handler.js", "utf8");
const calendarWindow = {};
const bookingEvents = [];
let onMessage;
const bookingWindow = {
  dataLayer: bookingEvents,
  location: { href: "https://metrixrealty.com/contact" },
  addEventListener(type, callback) {
    if (type === "message") onMessage = callback;
  },
};
const bookingDocument = {
  getElementById(id) {
    return id === "booking-calendar-iframe" ? { contentWindow: calendarWindow } : null;
  },
  querySelectorAll() {
    throw new Error("Page text must not be used to infer a booking");
  },
};
vm.runInNewContext(bookingSource, {
  document: bookingDocument,
  window: bookingWindow,
  console: { log() {} },
});
if (typeof onMessage !== "function") throw new Error("Calendar listener missing");

const booking = { type: "highlevel_booking", booking: { appointment_id: "apt-1" } };
onMessage({ origin: "https://example.com", source: calendarWindow, data: booking });
onMessage({ origin: "https://api.leadconnectorhq.com", source: {}, data: booking });
onMessage({ origin: "https://api.leadconnectorhq.com", source: calendarWindow, data: { type: "highlevel_booking", booking: {} } });
if (bookingEvents.length) throw new Error("Unverified booking emitted a conversion");

onMessage({ origin: "https://api.leadconnectorhq.com", source: calendarWindow, data: booking });
onMessage({ origin: "https://api.leadconnectorhq.com", source: calendarWindow, data: booking });
if (bookingEvents.filter(({ event }) => event === "conversion").length !== 1) {
  throw new Error("A verified appointment should emit one conversion");
}
if (bookingEvents.some((event) => "value" in event || "currency" in event)) {
  throw new Error("Booking events must not invent revenue");
}

console.log("Analytics check passed: calendar conversions require a verified message and appointment ID.");
