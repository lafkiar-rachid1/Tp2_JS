const form = document.getElementById("http-form");
const addHeaderBtn = document.getElementById("add-header");
const headersList = document.getElementById("headers-list");
const statusEl = document.getElementById("status");
const responseHeadersEl = document.getElementById("response-headers");
const responseBodyEl = document.getElementById("response-body");

function createHeaderRow() {
  const row = document.createElement("div");
  row.className = "header-row";
  row.innerHTML = `
    <input type="text" class="header-key" placeholder="Header key" />
    <input type="text" class="header-value" placeholder="Header value" />
    <button type="button" class="small-btn remove-header" aria-label="Supprimer le header">x</button>
  `;
  return row;
}

function collectHeaders() {
  const rows = headersList.querySelectorAll(".header-row");

  rows.forEach((row) => {
    const key = row.querySelector(".header-key").value.trim();
    const value = row.querySelector(".header-value").value.trim();

    if (key) {
      headers[key] = value;
    }
  });

  return headers;
}

function formatHeaders(headers) {
  const entries = [...headers.entries()];
  if (entries.length === 0) {
    return "(Aucun header)";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join("\n");
}

function tryFormatBody(bodyText, contentType) {
  const normalized = (contentType || "").toLowerCase();

  if (normalized.includes("application/json")) {
    try {
      const json = JSON.parse(bodyText);
      return JSON.stringify(json, null, 2);
    } catch {
      return bodyText;
    }
  }

  return bodyText;
}

addHeaderBtn.addEventListener("click", () => {
  headersList.appendChild(createHeaderRow());
});

headersList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-header")) {
    return;
  }

  const rows = headersList.querySelectorAll(".header-row");
  if (rows.length === 1) {
    rows[0].querySelector(".header-key").value = "";
    rows[0].querySelector(".header-value").value = "";
    return;
  }

  event.target.closest(".header-row").remove();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const method = document.getElementById("method").value;
  const url = document.getElementById("url").value.trim();
  const body = document.getElementById("body").value;
  const headers = collectHeaders();

  const options = {
    method,
    headers,
  };

  // Ne pas envoyer de body pour les methodes qui ne l'utilisent pas classiquement.
  if (!["GET", "HEAD"].includes(method) && body) {
    options.body = body;
  }

  statusEl.textContent = "Status: chargement...";
  responseHeadersEl.textContent = "-";
  responseBodyEl.textContent = "-";

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();

    statusEl.textContent = `Status: ${response.status} ${response.statusText}`;
    responseHeadersEl.textContent = formatHeaders(response.headers);

    const contentType = response.headers.get("content-type");
    responseBodyEl.textContent = tryFormatBody(responseText, contentType);
  } catch (error) {
    statusEl.textContent = "Status: erreur";
    responseHeadersEl.textContent = "-";
    responseBodyEl.textContent = error.message || "Erreur inconnue";
  }
});
