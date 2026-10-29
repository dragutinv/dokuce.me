/* dokuce.me — homepage tracking widget + shared nav behaviour */

(function () {
  const lang = document.documentElement.lang === "en" ? "en" : "sr";

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMobile = document.querySelector("[data-nav-mobile]");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => {
      navMobile.classList.toggle("open");
      const expanded = navMobile.classList.contains("open");
      navToggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  /* ---------- Tracking form ---------- */
  const form = document.querySelector("[data-track-form]");
  if (!form) return;

  const input = form.querySelector("[data-track-input]");
  const errorBox = document.querySelector("[data-track-error]");
  const resultSection = document.querySelector("[data-result-section]");
  const demoBtn = document.querySelector("[data-demo-code]");

  const i18n = {
    sr: {
      notFound: "Nismo pronašli pošiljku sa ovim kodom. Provjeri da li si ga dobro unio/unijela.",
      onHold: "Zadržana — dodatna provjera",
      from: "Pošiljalac",
      to: "Primalac",
      agency: "Agencija",
      statusLabel: "Trenutni status",
    },
    en: {
      notFound: "We couldn't find a shipment with that code. Please check and try again.",
      onHold: "On hold — additional check",
      from: "Sender",
      to: "Receiver",
      agency: "Agency",
      statusLabel: "Current status",
    },
  };
  const t = i18n[lang];

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString(lang === "sr" ? "sr-Latn-ME" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderResult(code, shipment) {
    errorBox.classList.remove("show");
    resultSection.classList.add("show");

    const head = resultSection.querySelector("[data-result-head]");
    const pill = resultSection.querySelector("[data-status-pill]");
    const timeline = resultSection.querySelector("[data-timeline]");

    head.querySelector("[data-result-code]").textContent = code;
    head.querySelector("[data-result-from]").textContent = shipment.sender || "—";
    head.querySelector("[data-result-to]").textContent = shipment.receiver || "—";
    head.querySelector("[data-result-agency]").textContent = shipment.agencyName || "—";

    pill.className = "status-pill";
    if (shipment.onHold) {
      pill.classList.add("is-hold");
      pill.textContent = t.onHold;
    } else {
      const current = STATUS_STEPS[shipment.currentIndex];
      if (current.key === "delivered") pill.classList.add("is-delivered");
      if (current.key === "ready") pill.classList.add("is-ready");
      pill.textContent = current[lang];
    }

    timeline.innerHTML = "";
    STATUS_STEPS.forEach((step, idx) => {
      const li = document.createElement("li");
      const done = idx <= shipment.currentIndex;
      li.className = done ? "done" : "";
      if (idx === STATUS_STEPS.length - 1 && done) li.classList.add("final");

      const historyEntry = shipment.history.find((h) => h.key === step.key);

      li.innerHTML = `
        <div class="t-title">${step[lang]}</div>
        <div class="t-meta">${historyEntry ? formatDate(historyEntry.when) + (historyEntry.location ? " · " + historyEntry.location : "") : "—"}</div>
      `;
      timeline.appendChild(li);
    });

    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function doLookup(code) {
    if (!code) return;
    const shipment = getShipment(code);
    if (!shipment) {
      resultSection.classList.remove("show");
      errorBox.classList.add("show");
      errorBox.textContent = t.notFound;
      return;
    }
    renderResult(code.trim().toUpperCase(), shipment);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    doLookup(input.value);
    const url = new URL(window.location.href);
    url.searchParams.set("kod", input.value.trim().toUpperCase());
    window.history.replaceState({}, "", url);
  });

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      input.value = "DK2026100123";
      doLookup(input.value);
    });
  }

  /* Pre-fill from ?kod= query param so results are shareable/linkable */
  const params = new URLSearchParams(window.location.search);
  const preset = params.get("kod");
  if (preset) {
    input.value = preset;
    doLookup(preset);
  }
})();
