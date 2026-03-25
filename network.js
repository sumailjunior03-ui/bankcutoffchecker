/* network.js — Calc-HQ strict. Related tools rendered by footer.js from this source. */
window.CALC_HQ_NETWORK = [
  {
    "name": "Calc-HQ",
    "url": "https://calc-hq.com",
    "desc": "Financial calculator hub",
    "live": true
  }
];

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll(".network-links");
    if (!containers.length) return;

    const currentDomain = window.location.hostname.replace("www.", "");

    containers.forEach(function (container) {
      const sites = window.CALC_HQ_NETWORK.filter(function (site) {
        try {
          const u = new URL(site.url);
          const host = u.hostname.replace("www.", "");
          if (host === "calc-hq.com") return false;
          return host !== currentDomain;
        } catch (e) {
          return false;
        }
      });

      if (!sites.length) return;

      let html = "<strong>Related Tools:</strong> ";
      html += sites
        .map(function (site, i) {
          return (
            '<a href="' +
            site.url +
            '" target="_blank" rel="noopener">' +
            site.name +
            "</a>"
          );
        })
        .join(" &nbsp;•&nbsp; ");

      container.innerHTML = html;
    });
  });
})();
