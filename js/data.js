/* dokuce.me — demo data layer (prototype only, no real backend)
   Scope: local shipments between cities within the same country (e.g. Montenegro).
   Everything lives in localStorage so the demo feels alive in the browser. */

const DOKUCE_STORAGE_KEY = "dokuce_shipments_v3";
const DOKUCE_SESSION_KEY = "dokuce_agency_session_v1";

/* Cities served by the demo agency network — used for the origin/destination pickers */
const DOKUCE_CITIES = [
  "Podgorica", "Nikšić", "Herceg Novi", "Bar", "Budva", "Bijelo Polje",
  "Cetinje", "Pljevlja", "Berane", "Kotor", "Tivat", "Ulcinj",
  "Rožaje", "Kolašin", "Danilovgrad", "Mojkovac",
];

/* Status steps, in order, with bilingual labels + icon key */
const STATUS_STEPS = [
  { key: "created", sr: "Pošiljka kreirana", en: "Shipment created" },
  { key: "picked_up", sr: "Preuzeta od pošiljaoca", en: "Picked up from sender" },
  { key: "in_transit", sr: "U tranzitu između gradova", en: "In transit between cities" },
  { key: "arrived", sr: "Stigla u grad primaoca", en: "Arrived in recipient's city" },
  { key: "ready", sr: "Spremna za preuzimanje", en: "Ready for pickup" },
  { key: "delivered", sr: "Isporučena primaocu", en: "Delivered to recipient" },
];

const STATUS_HOLD = { key: "on_hold", sr: "Zadržana — dodatna provjera", en: "On hold — additional check" };

/* Demo agency accounts (client-side only — not secure, this is a mockup) */
const DEMO_AGENCIES = [
  { username: "agencija@dokuce.me", password: "demo123", name: "Dokuće Transfer Podgorica" },
  { username: "demo", password: "demo", name: "Dokuće Transfer Podgorica" },
];

/* Seed demo shipments so a visitor can try tracking immediately — all routes are
   local, between cities within the same country. */
function seedDemoShipments() {
  const existing = localStorage.getItem(DOKUCE_STORAGE_KEY);
  if (existing) return;

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

  const seed = {
    "ME2026100123": {
      sender: "Milica P.",
      receiver: "Jovan R.",
      fromCity: "Podgorica",
      toCity: "Bijelo Polje",
      agencyName: "Dokuće Transfer Podgorica",
      currentIndex: 2,
      onHold: false,
      history: [
        { key: "created", when: hoursAgo(26), location: "Podgorica" },
        { key: "picked_up", when: hoursAgo(24), location: "Podgorica" },
        { key: "in_transit", when: hoursAgo(6), location: "Kolašin" },
      ],
    },
    "ME2026100456": {
      sender: "Stefan M.",
      receiver: "Ana K.",
      fromCity: "Nikšić",
      toCity: "Bar",
      agencyName: "Dokuće Transfer Nikšić",
      currentIndex: 5,
      onHold: false,
      history: [
        { key: "created", when: hoursAgo(30), location: "Nikšić" },
        { key: "picked_up", when: hoursAgo(28), location: "Nikšić" },
        { key: "in_transit", when: hoursAgo(20), location: "Podgorica" },
        { key: "arrived", when: hoursAgo(10), location: "Bar" },
        { key: "ready", when: hoursAgo(6), location: "Bar" },
        { key: "delivered", when: hoursAgo(1), location: "Bar" },
      ],
    },
    "ME2026100789": {
      sender: "Ivana T.",
      receiver: "Marko S.",
      fromCity: "Herceg Novi",
      toCity: "Pljevlja",
      agencyName: "Dokuće Transfer Herceg Novi",
      currentIndex: 4,
      onHold: false,
      history: [
        { key: "created", when: hoursAgo(20), location: "Herceg Novi" },
        { key: "picked_up", when: hoursAgo(18), location: "Herceg Novi" },
        { key: "in_transit", when: hoursAgo(10), location: "Podgorica" },
        { key: "arrived", when: hoursAgo(2), location: "Pljevlja" },
      ],
    },
  };

  localStorage.setItem(DOKUCE_STORAGE_KEY, JSON.stringify(seed));
}

function getAllShipments() {
  seedDemoShipments();
  try {
    return JSON.parse(localStorage.getItem(DOKUCE_STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveAllShipments(data) {
  localStorage.setItem(DOKUCE_STORAGE_KEY, JSON.stringify(data));
}

function getShipment(code) {
  const all = getAllShipments();
  return all[code.trim().toUpperCase()] || null;
}

function upsertShipmentStatus(code, statusKey, location, agencyName) {
  const all = getAllShipments();
  const normalized = code.trim().toUpperCase();
  const when = new Date().toISOString();

  if (!all[normalized]) {
    all[normalized] = {
      sender: "",
      receiver: "",
      fromCity: "",
      toCity: "",
      agencyName: agencyName || "",
      currentIndex: 0,
      onHold: false,
      history: [],
    };
  }

  const shipment = all[normalized];

  if (statusKey === "on_hold") {
    shipment.onHold = true;
  } else {
    shipment.onHold = false;
    const idx = STATUS_STEPS.findIndex((s) => s.key === statusKey);
    if (idx > -1) shipment.currentIndex = idx;
  }

  shipment.history.push({ key: statusKey, when, location: location || "" });
  if (agencyName) shipment.agencyName = agencyName;

  all[normalized] = shipment;
  saveAllShipments(all);
  return shipment;
}
