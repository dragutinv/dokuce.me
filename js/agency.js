/* dokuce.me — agency login + dashboard (client-side demo only) */

(function () {
  const lang = document.documentElement.lang === "en" ? "en" : "sr";

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMobile = document.querySelector("[data-nav-mobile]");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => {
      navMobile.classList.toggle("open");
    });
  }

  const loginForm = document.querySelector("[data-login-form]");
  const authWrap = document.querySelector("[data-auth-wrap]");
  const dashWrap = document.querySelector("[data-dash-wrap]");
  const loginError = document.querySelector("[data-login-error]");
  const logoutBtn = document.querySelector("[data-logout]");
  const agencyNameEl = document.querySelector("[data-agency-name]");

  const i18n = {
    sr: {
      badLogin: "Pogrešan korisnički ili lozinka. Probaj demo nalog ispod.",
      savedToast: "Status je sačuvan i vidljiv na stranici za praćenje.",
      pickShipment: "Izaberi pošiljku sa liste ili unesi novi kod da bi ažurirao/la status.",
      newShipment: "Nova pošiljka",
    },
    en: {
      badLogin: "Incorrect username or password. Try the demo account below.",
      savedToast: "Status saved — it's now visible on the tracking page.",
      pickShipment: "Pick a shipment from the list or enter a new code to update its status.",
      newShipment: "New shipment",
    },
  };
  const t = i18n[lang];

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(DOKUCE_SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  function setSession(agency) {
    localStorage.setItem(DOKUCE_SESSION_KEY, JSON.stringify(agency));
  }

  function clearSession() {
    localStorage.removeItem(DOKUCE_SESSION_KEY);
  }

  function showDashboard(agency) {
    authWrap.classList.remove("show");
    authWrap.style.display = "none";
    dashWrap.classList.add("show");
    agencyNameEl.textContent = agency.name;
    renderShipmentList();
  }

  function showLogin() {
    dashWrap.classList.remove("show");
    authWrap.style.display = "flex";
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = loginForm.querySelector("[name=username]").value.trim();
      const password = loginForm.querySelector("[name=password]").value;
      const match = DEMO_AGENCIES.find(
        (a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
      );
      if (!match) {
        loginError.classList.add("show");
        loginError.textContent = t.badLogin;
        return;
      }
      loginError.classList.remove("show");
      setSession(match);
      showDashboard(match);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      showLogin();
    });
  }

  const existingSession = getSession();
  if (existingSession && dashWrap) {
    showDashboard(existingSession);
  }

  /* ---------- Dashboard: shipment list + status update ---------- */
  const listEl = document.querySelector("[data-shipment-list]");
  const codeInput = document.querySelector("[data-update-code]");
  const statusSelect = document.querySelector("[data-update-status]");
  const locationInput = document.querySelector("[data-update-location]");
  const senderInput = document.querySelector("[data-update-sender]");
  const receiverInput = document.querySelector("[data-update-receiver]");
  const updateForm = document.querySelector("[data-update-form]");
  const toast = document.querySelector("[data-toast]");

  function populateStatusOptions() {
    if (!statusSelect) return;
    statusSelect.innerHTML = "";
    STATUS_STEPS.forEach((step) => {
      const opt = document.createElement("option");
      opt.value = step.key;
      opt.textContent = step[lang];
      statusSelect.appendChild(opt);
    });
    const holdOpt = document.createElement("option");
    holdOpt.value = STATUS_HOLD.key;
    holdOpt.textContent = STATUS_HOLD[lang];
    statusSelect.appendChild(holdOpt);
  }
  populateStatusOptions();

  function renderShipmentList() {
    if (!listEl) return;
    const all = getAllShipments();
    const codes = Object.keys(all).sort();
    listEl.innerHTML = "";

    if (codes.length === 0) {
      listEl.innerHTML = `<li class="empty-note">—</li>`;
      return;
    }

    codes.forEach((code) => {
      const shipment = all[code];
      const li = document.createElement("li");
      const label = shipment.onHold
        ? STATUS_HOLD[lang]
        : STATUS_STEPS[shipment.currentIndex][lang];
      li.innerHTML = `
        <div class="sl-code">${code}</div>
        <div class="sl-meta">${label}${shipment.receiver ? " · " + shipment.receiver : ""}</div>
      `;
      li.addEventListener("click", () => {
        document.querySelectorAll("[data-shipment-list] li").forEach((el) => el.classList.remove("active"));
        li.classList.add("active");
        codeInput.value = code;
        senderInput.value = shipment.sender || "";
        receiverInput.value = shipment.receiver || "";
        locationInput.value = "";
        statusSelect.value = shipment.onHold ? "on_hold" : STATUS_STEPS[shipment.currentIndex].key;
      });
      listEl.appendChild(li);
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  if (updateForm) {
    updateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      if (!code) return;
      const session = getSession();

      const all = getAllShipments();
      const normalized = code.toUpperCase();
      if (!all[normalized]) {
        all[normalized] = {
          sender: "",
          receiver: "",
          agencyName: session ? session.name : "",
          currentIndex: 0,
          onHold: false,
          history: [],
        };
        saveAllShipments(all);
      }
      if (senderInput.value.trim()) {
        all[normalized].sender = senderInput.value.trim();
      }
      if (receiverInput.value.trim()) {
        all[normalized].receiver = receiverInput.value.trim();
      }
      saveAllShipments(all);

      upsertShipmentStatus(
        code,
        statusSelect.value,
        locationInput.value.trim(),
        session ? session.name : ""
      );

      renderShipmentList();
      showToast(t.savedToast);
      updateForm.reset();
      populateStatusOptions();
    });
  }
})();
