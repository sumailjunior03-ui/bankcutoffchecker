/* CalcHQ Network — Central Site Directory
   To add a new site: add one line to NETWORK_SITES array.
   All sites update automatically. */

window.CALCHQ_NETWORK = [
  { name: "BizDayChecker.com", url: "https://bizdaychecker.com" },
  { name: "BankCutoffChecker.com", url: "https://bankcutoffchecker.com" },
  { name: "SalaryVsInflation.com", url: "https://salaryvsinflation.com" },
  { name: "hourly2salarycalc.com", url: "https://hourly2salarycalc.com" },
];

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Find all elements with class "network-links"
    const containers = document.querySelectorAll(".network-links");
    if (!containers.length) return;

    // Get current site domain to exclude self
    const currentDomain = window.location.hostname.replace("www.", "");

    containers.forEach(function (container) {
      const sites = window.CALCHQ_NETWORK.filter(function (site) {
        return !site.url.includes(currentDomain);
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
