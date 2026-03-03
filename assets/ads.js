// Ad/Sponsor rails: collapsed unless explicitly activated in config.js
(function () {
  var cfg = window.SITE_CONFIG || {};
  // Sponsor
  var sponsor = document.getElementById("sponsor");
  if (sponsor) {
    if (cfg.SPONSOR_ACTIVE) {
      sponsor.classList.remove("is-off");
    } else {
      sponsor.classList.add("is-off");
    }
  }

  function mountAd(containerId, slotId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!cfg.ADS_ACTIVE || !slotId) {
      el.classList.add("is-off");
      return;
    }
    el.classList.remove("is-off");

    // Only create <ins> when active to prevent blank space
    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", cfg.ADSENSE_PUB_ID);
    ins.setAttribute("data-ad-slot", slotId);
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    el.appendChild(ins);

    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}

    // If no-fill, collapse
    setTimeout(function () {
      if (!el.querySelector("iframe")) el.classList.add("is-off");
    }, 1500);
  }

  mountAd("adTop", cfg.AD_SLOT_TOP);
  mountAd("adBottom", cfg.AD_SLOT_BOTTOM);
})();
