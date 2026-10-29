/* dokuce.me — demo data layer (prototype only, no real backend)
   Everything lives in localStorage so the demo feels alive in the browser. */

const DOKUCE_STORAGE_KEY = "dokuce_shipments_v1";
const DOKUCE_SESSION_KEY = "dokuce_agency_session_v1";

/* Status steps, in order, with bilingual labels + icon key */
const STATUS_STEPS = [
  { key: "created", sr: "Pošiljka kreirana", en: "Shipment created" },
  { key: "picked_up", sr: "Preuzeta od pošiljaoca", en: "Picked up from sender" },
  { key: "in_transit", sr: "U tranzitu", en: "In transit" },
  { key: "arrived", sr: "Stigla u zemlju primaoca", en: "Arrived in destination country" },
  { key: "ready", sr: "Spremna za preuzimanje", en: "Ready for pickup" },
  { key: "delivered", sr: "Isporučena primaocu", en: "Delivered to recipient" },
];

const STATUS_HOLD = { key: "on_hold", sr: "Zadržana — dodatna provjera", en: "On hold — additional check" };

/* Demo agency accounts (client-side only — not secure, this is a mockup) */
const DEMO_AGENCIES = [
  { username: "agencija@dokuce.me", password: "demo123", name: "Dokuće Transfer Podgorica" },
  { username: "demo", password: "demo", name: "Dokuće Transfer Podgorica" },
];

/* Seed demo shipments so a visitor can try tracking immediately */
function seedDemoShipments() {
  const existing = localStorage.getItem(DOKUCE_STORAGE_KEY);
  if (existing) return;

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

  const seed = {
    "DK2026100123": {
      sender: "Milica P., Podgorica",
      receiver: "Jovan R., Novi Pazar",
      agencyName: "Dokuće Transfer Podgorica",
      currentIndex: 2,
      onHold: false,
      history: [
        { key: "created", when: hoursAgo(50), location: "Podgorica, ME" },
        { key: "picked_up", when: hoursAgo(46), location: "Podgorica, ME" },
        { key: "in_transit", when: hoursAgo(20), location: "Bijelo Polje, ME" },
      ],
    },
    "DK2026100456": {
      sender: "Stefan M., Nikšić",
      receiver: "Ana K., Beograd",
      agencyName: "Dokuće Transfer Nikšić",
      currentIndex: 5,
      onHold: false,
      history: [
        { key: "created", when: hoursAgo(96), location: "Nikšić, ME" },
        { key: "picked_up", when: hoursAgo(92), location: "Nikšić, ME" },
        { key: "in_transit", when: hoursAgo(70), location: "Podgorica, ME" },
        { key: "arrived", when: hoursAgo(40), location: "Beograd, RS" },
        { key: "ready", when: hoursAgo(18), location: "Beograd, RS" },
        { key: "delivered", when: hoursAgo(2), location: "Beograd, RS" },
      ],
    },
    "DK2026100789": {
      sender: "Ivana T., Herceg Novi",
      receiver: "Marko S., Sarajevo",
      agencyName: "Dokuće Transfer Herceg Novi",
      currentIndex: 4,
      onHold: false,
      history: [
        { key: "created", when: hoursAgo(30), location: "Herceg Novi, ME" },
        { key: "picked_up", when: hoursAgo(28), location: "Herceg Novi, ME" },
        { key: "in_transit", when: hoursAgo(15), location: "Podgorica, ME" },
        { key: "arrived", when: hoursAgo(5), location: "Sarajevo, BA" },
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
