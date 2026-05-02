/* GA4 - Calc-HQ Network Analytics (single injection point) */
(function(){if(!window.__GA4_LOADED){window.__GA4_LOADED=true;var id="G-W4SWZ1YRS2";var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config",id);}})();

// network.js — single source of truth for header nav, footer, related tools, GA4
(function () {
  "use strict";

  window.CALC_HQ_NETWORK = [
    { name: "Calc-HQ",                     url: "https://calc-hq.com",              live: true,  clusters: [] },
    { name: "BizDayChecker.com",           url: "https://bizdaychecker.com",        live: true,  clusters: ["us", "payroll"] },
    { name: "BankCutoffChecker.com",       url: "https://bankcutoffchecker.com",    live: true,  clusters: ["us", "payroll"] },
    { name: "PayrollDateChecker.com",      url: "https://payrolldatechecker.com",   live: true,  clusters: ["us", "payroll"] },
    { name: "1099vsW2Calc.com",            url: "https://1099vsw2calc.com",         live: true,  clusters: ["us", "tax-income"] },
    { name: "QuarterlyTaxCalc.com",        url: "https://quarterlytaxcalc.com",     live: true,  clusters: ["us", "tax-income"] },
    { name: "AfterTaxSalaryCalc.com",      url: "https://aftertaxsalarycalc.com",   live: true,  clusters: ["us", "tax-income"] },
    { name: "BonusTaxCalc.com",            url: "https://bonustaxcalc.com",         live: true,  clusters: ["us", "tax-income"] },
    { name: "FreelanceIncomeCalc.com",     url: "https://freelanceincomecalc.com",  live: true,  clusters: ["us", "income"] },
    { name: "SalaryVsInflation.com",       url: "https://salaryvsinflation.com",    live: true,  clusters: ["us", "income"] },
    { name: "Hourly2SalaryCalc.com",       url: "https://hourly2salarycalc.com",    live: true,  clusters: ["us", "income"] },
    { name: "OvertimePayCalc.com",         url: "https://overtimepaycalc.com",      live: true,  clusters: ["us", "compensation"] },
    { name: "TotalCompCalc.com",           url: "https://totalcompcalc.com",        live: false, clusters: ["us", "compensation"] },
    { name: "OntarioTakeHomeCalc.com",     url: "https://ontariotakehomecalc.com",  live: true,  clusters: ["ca", "take-home"] },
    { name: "CPPCalc.com",                 url: "https://cppcalc.com",              live: true,  clusters: ["ca", "payroll-deductions"] },
    { name: "EICalc.com",                  url: "https://eicalc.com",               live: true,  clusters: ["ca", "payroll-deductions"] }
  ];

  var FORBIDDEN = [];
  var COUNTRY_TAGS = ["us", "ca"];

  function normalize(domain) {
    return domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  }

  function getCurrentDomain() {
    return normalize(window.location.hostname);
  }

  function getHost(url) {
    return normalize(url);
  }

  function getCurrentSite() {
    var domain = getCurrentDomain();
    for (var i = 0; i < window.CALC_HQ_NETWORK.length; i++) {
      if (getHost(window.CALC_HQ_NETWORK[i].url) === domain) return window.CALC_HQ_NETWORK[i];
    }
    return null;
  }

  function getRelatedTools() {
    var currentDomain = getCurrentDomain();
    var currentSite = getCurrentSite();
    var currentClusters = currentSite ? currentSite.clusters : [];

    return window.CALC_HQ_NETWORK.filter(function (tool) {
      if (!tool || tool.live !== true) return false;
      var toolDomain = getHost(tool.url);
      if (toolDomain === "calc-hq.com") return false;
      if (toolDomain === currentDomain) return false;
      if (FORBIDDEN.indexOf(toolDomain) !== -1) return false;
      if (!currentClusters.length) return false;
      for (var i = 0; i < tool.clusters.length; i++) {
        var c = tool.clusters[i];
        if (COUNTRY_TAGS.indexOf(c) !== -1) continue;
        if (currentClusters.indexOf(c) !== -1) return true;
      }
      return false;
    });
  }

  function renderRelatedTools() {
    var containers = document.querySelectorAll("#related-calculators");
    if (!containers.length) return;

    var related = getRelatedTools();

    containers.forEach(function (container) {
      container.innerHTML = "";
      if (!related.length) { container.style.display = "none"; return; }
      container.style.display = "";
      related.forEach(function (site, idx) {
        if (idx > 0) container.appendChild(document.createTextNode(" • "));
        var a = document.createElement("a");
        a.href = site.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = site.name;
        container.appendChild(a);
      });
    });
  }

  function loadForbiddenThenRender() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/forbidden-domains.json", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var parsed = JSON.parse(xhr.responseText);
            var list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.forbidden) ? parsed.forbidden : []);
            FORBIDDEN = list.map(function (d) { return String(d).toLowerCase().replace(/^www\./, ""); });
          } catch (e) {}
        }
        renderRelatedTools();
      }
    };
    xhr.onerror = function () { renderRelatedTools(); };
    xhr.send();
  }

  window.renderRelatedTools = renderRelatedTools;

  function renderSiteHeader() {
    var targets = document.querySelectorAll('[data-site-header-nav]');
    if (!targets.length) return;
    var path = window.location.pathname || "/";
    var current = "/";
    if (path.indexOf("/about.html") !== -1) current = "/about.html";
    else if (path.indexOf("/faq.html") !== -1) current = "/faq.html";
    else if (path.indexOf("/privacy.html") !== -1) current = "/privacy.html";
    else if (path.indexOf("/legal.html") !== -1) current = "/legal.html";
    else if (path.indexOf("/contact.html") !== -1) current = "/contact.html";
    function link(href, label) {
      var active = href === current;
      return '<a' + (active ? ' class="active" aria-current="page"' : '') + ' href="' + href + '">' + label + '</a>';
    }
    var navHtml = ['<nav class="header-nav" aria-label="Primary">', link("/", "Home"), link("/about.html", "About"), link("/faq.html", "FAQ"), link("/privacy.html", "Privacy"), link("/legal.html", "Legal"), link("/contact.html", "Contact"), '</nav>'].join('');
    for (var i = 0; i < targets.length; i++) targets[i].innerHTML = navHtml;
  }

  function renderFooter() {
    var footerTarget = document.getElementById('site-footer');
    if (!footerTarget) return;

    var currentDomain = getCurrentDomain();
    var currentSite = getCurrentSite();
    var related = getRelatedTools();

    var relatedHtml = '';
    if (related.length) {
      relatedHtml = '<ul class="footer-links">' + related.map(function (s) {
        return '<li><a href="' + s.url + '">' + s.name + '</a></li>';
      }).join('') + '</ul>';
    }

    var siteName = currentSite ? currentSite.name : "Calc-HQ";
    var email = (currentSite && currentSite.clusters.indexOf("ca") !== -1)
      ? "partnerships@calc-hq.ca"
      : "partnerships@calc-hq.com";

    footerTarget.innerHTML = [
      '<div class="footer-grid">',
        '<div><h2>Site links</h2><ul class="footer-nav-links"><li><a href="/">Home</a></li><li><a href="/about.html">About</a></li><li><a href="/privacy.html">Privacy Policy</a></li><li><a href="/legal.html">Legal</a></li><li><a href="/faq.html">FAQ</a></li><li><a href="/contact.html">Contact</a></li></ul></div>',
        '<div><h2>Related tools</h2>', relatedHtml, '</div>',
        '<div><h2>Resources</h2><p><a href="https://calc-hq.com/" target="_blank" rel="noopener">Financial Calculator Hub</a></p><h2>Contact</h2><p><a href="mailto:' + email + '">' + email + '</a></p></div>',
      '</div>',
      '<p class="footer-meta">' + siteName + ' · Estimates run locally in your browser.</p>'
    ].join('');
  }

  function init() {
    renderSiteHeader();
    loadForbiddenThenRender();
    renderFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
