(function () {
  "use strict";

  function normalizeHost(h) {
    return (h || "").toLowerCase().replace(/^www\./, "");
  }

  function getHostFromUrl(u) {
    try { return normalizeHost(new URL(u).hostname); } catch (e) { return ""; }
  }

  function hasForbidden(content, forbiddenList) {
    const lower = (content || "").toLowerCase();
    return forbiddenList.some(d => lower.includes(String(d).toLowerCase()));
  }

  async function loadForbidden() {
    try {
      const res = await fetch("forbidden-domains.json", { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.forbidden) ? data.forbidden : [];
    } catch (e) {
      return [];
    }
  }

  function getNetwork() {
    const net = window.CALC_HQ_NETWORK;
    if (!Array.isArray(net)) return [];
    return net.filter(item => item && item.live === true && typeof item.url === "string");
  }

  function buildLinks(list, currentHost) {
    const seen = new Set();
    const links = [];
    for (const item of list) {
      const host = getHostFromUrl(item.url);
      if (!host || host === currentHost) continue;
      if (seen.has(host)) continue;
      seen.add(host);

      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = item.name || host;
      links.push(a);
    }
    return links;
  }

  function renderInlineLinks(container, links) {
    if (!container) return;
    container.innerHTML = "";
    if (!links.length) {
      container.textContent = "—";
      return;
    }
    links.forEach((a, i) => {
      if (i > 0) container.appendChild(document.createTextNode(" • "));
      container.appendChild(a);
    });
  }

  function renderListLinks(ul, links) {
    if (!ul) return;
    ul.innerHTML = "";
    if (!links.length) {
      const li = document.createElement("li");
      li.textContent = "—";
      ul.appendChild(li);
      return;
    }
    links.forEach(a => {
      const li = document.createElement("li");
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const forbidden = await loadForbidden();
    const net = getNetwork();
    const currentHost = normalizeHost(location.hostname);

    const netString = JSON.stringify(window.CALC_HQ_NETWORK || []);
    if (forbidden.length && hasForbidden(netString, forbidden)) {
      return;
    }

    const links = buildLinks(net, currentHost);

    const footerSpan = document.getElementById("relatedTools");
    renderInlineLinks(footerSpan, links);

    const relatedUl = document.getElementById("relatedCalculators");
    renderListLinks(relatedUl, links);
  });
})();
