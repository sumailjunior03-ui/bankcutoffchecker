/* Bank Cutoff Time Checker (static, deterministic) */
(function () {
  const $ = (id) => document.getElementById(id);

  const BANKS = [
    { id: "chase", name: "Chase" },
    { id: "boa", name: "Bank of America" },
    { id: "wells", name: "Wells Fargo" },
    { id: "citi", name: "Citi" },
    { id: "usbank", name: "U.S. Bank" },
    { id: "pnc", name: "PNC" },
    { id: "capitalone", name: "Capital One" },
    { id: "tdus", name: "TD Bank (US)" },
    { id: "truist", name: "Truist" },
    { id: "ally", name: "Ally Bank" }
  ];

  // Cutoffs are in Eastern Time, 24h "HH:MM"
  // Notes:
  // - Banks can vary by product/channel. This tool uses common, conservative cutoffs for consumer/SMB online submission.
  // - If user is unsure, the recommendation is to submit earlier. (No advice; just a caution.)
  const CUTOFFS = {
    chase: { ach_standard: "16:00", ach_sameday: "16:45", wire: "16:00" },
    boa: { ach_standard: "17:00", ach_sameday: "17:00", wire: "17:00" },
    wells: { ach_standard: "17:00", ach_sameday: "17:00", wire: "17:00" },
    citi: { ach_standard: "18:00", ach_sameday: "18:00", wire: "18:00" },
    usbank: { ach_standard: "18:00", ach_sameday: "18:00", wire: "17:00" },
    pnc: { ach_standard: "18:00", ach_sameday: "18:00", wire: "17:00" },
    capitalone: { ach_standard: "17:00", ach_sameday: "17:00", wire: "16:00" },
    tdus: { ach_standard: "17:00", ach_sameday: "17:00", wire: "16:30" },
    truist: { ach_standard: "19:00", ach_sameday: "19:00", wire: "17:00" },
    ally: { ach_standard: "19:00", ach_sameday: "19:00", wire: "16:00" }
  };

  const TRANSFERS = [
    { id: "ach_standard", name: "ACH (Standard)" },
    { id: "ach_sameday", name: "ACH (Same Day)" },
    { id: "wire", name: "Wire (Domestic)" }
  ];

  function pad2(n) { return String(n).padStart(2, "0"); }

  function ymd(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function parseHHMM(hhmm) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
    if (!m) return null;
    return { h: Number(m[1]), min: Number(m[2]) };
  }

  function minutesSinceMidnight(hhmm) {
    const t = parseHHMM(hhmm);
    if (!t) return null;
    return t.h * 60 + t.min;
  }

  // --- US Federal Holidays (Observed) ---
  // Returns a Set of YYYY-MM-DD strings for the given year.
  function usFederalObservedHolidays(year) {
    const set = new Set();

    function addObserved(dateObj) {
      // Observed: if Sat -> Fri, if Sun -> Mon
      const day = dateObj.getDay(); // 0 Sun..6 Sat
      const d = new Date(dateObj.getTime());
      if (day === 6) { d.setDate(d.getDate() - 1); }
      else if (day === 0) { d.setDate(d.getDate() + 1); }
      set.add(ymd(d));
    }

    function nthWeekdayOfMonth(n, weekday, monthIndex) {
      // monthIndex: 0-11
      const first = new Date(year, monthIndex, 1);
      const firstDay = first.getDay();
      let offset = (weekday - firstDay + 7) % 7;
      const day = 1 + offset + (n - 1) * 7;
      return new Date(year, monthIndex, day);
    }

    function lastWeekdayOfMonth(weekday, monthIndex) {
      const last = new Date(year, monthIndex + 1, 0);
      const lastDay = last.getDay();
      let offset = (lastDay - weekday + 7) % 7;
      const day = last.getDate() - offset;
      return new Date(year, monthIndex, day);
    }

    // New Year's Day (Jan 1)
    addObserved(new Date(year, 0, 1));
    // Edge case: if Jan 1 falls on Saturday, observed is Dec 31 of previous year
    if (new Date(year, 0, 1).getDay() === 6) { set.add(ymd(new Date(year - 1, 11, 31))); }
    // Martin Luther King Jr. Day (3rd Mon in Jan)
    set.add(ymd(nthWeekdayOfMonth(3, 1, 0)));
    // Washington's Birthday / Presidents Day (3rd Mon in Feb)
    set.add(ymd(nthWeekdayOfMonth(3, 1, 1)));
    // Memorial Day (last Mon in May)
    set.add(ymd(lastWeekdayOfMonth(1, 4)));
    // Juneteenth (Jun 19) - federal holiday since 2021
    if (year >= 2021) addObserved(new Date(year, 5, 19));
    // Independence Day (Jul 4)
    addObserved(new Date(year, 6, 4));
    // Labor Day (1st Mon in Sep)
    set.add(ymd(nthWeekdayOfMonth(1, 1, 8)));
    // Columbus Day / Indigenous Peoples' Day (2nd Mon in Oct)
    set.add(ymd(nthWeekdayOfMonth(2, 1, 9)));
    // Veterans Day (Nov 11)
    addObserved(new Date(year, 10, 11));
    // Thanksgiving Day (4th Thu in Nov)
    set.add(ymd(nthWeekdayOfMonth(4, 4, 10)));
    // Christmas Day (Dec 25)
    addObserved(new Date(year, 11, 25));

    return set;
  }

  function isWeekend(dateObj) {
    const d = dateObj.getDay();
    return d === 0 || d === 6;
  }

  function isBusinessDayET(dateObj) {
    if (isWeekend(dateObj)) return { ok: false, reason: "Weekend" };
    const y = dateObj.getFullYear();
    const holidays = usFederalObservedHolidays(y);
    // Also check next year's holiday set: Dec 31 can be the observed day for
    // Jan 1 of the following year when Jan 1 falls on a Saturday.
    if (dateObj.getMonth() === 11 && dateObj.getDate() === 31) {
      const nextYearHolidays = usFederalObservedHolidays(y + 1);
      nextYearHolidays.forEach(h => holidays.add(h));
    }
    if (holidays.has(ymd(dateObj))) return { ok: false, reason: "US federal holiday (observed)" };
    return { ok: true, reason: "Business day" };
  }

  function nextBusinessDay(dateObj) {
    const d = new Date(dateObj.getTime());
    d.setDate(d.getDate() + 1);
    while (true) {
      const chk = isBusinessDayET(d);
      if (chk.ok) return d;
      d.setDate(d.getDate() + 1);
    }
  }

  function formatDateLong(dateObj) {
    return dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function init() {
    // Populate selects
    const bankSel = $("bank");
    const transferSel = $("transfer");

    BANKS.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.name;
      bankSel.appendChild(opt);
    });

    TRANSFERS.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      transferSel.appendChild(opt);
    });

    // Defaults: today + current ET time (user will input anyway)
    // Must use ET because all cutoffs are evaluated in Eastern Time.
    const nowET = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    $("date").value = ymd(nowET);
    $("time").value = pad2(nowET.getHours()) + ":" + pad2(nowET.getMinutes());

    $("checkBtn").addEventListener("click", onCheck);

    // Auto run once
    onCheck();
  }

  function onCheck() {
    const bankId = $("bank").value;
    const transferId = $("transfer").value;
    const dateStr = $("date").value;
    const timeStr = $("time").value.trim();

    const out = $("out");
    const badge = $("badge");
    const big = $("big");
    const explain = $("explain");

    // Validate
    if (!bankId || !transferId || !dateStr || !timeStr) {
      badge.className = "badge no";
      badge.textContent = "Missing input";
      big.textContent = "Fill in bank, transfer type, date, and time.";
      explain.textContent = "All fields are required for a deterministic result.";
      out.hidden = false;
      return;
    }

    const tMin = minutesSinceMidnight(timeStr);
    if (tMin === null) {
      badge.className = "badge no";
      badge.textContent = "Invalid time";
      big.textContent = "Enter time in HH:MM (24-hour) format.";
      explain.textContent = "Example: 14:35 (which means 2:35 PM ET).";
      out.hidden = false;
      return;
    }

    const cut = CUTOFFS[bankId]?.[transferId];
    if (!cut) {
      badge.className = "badge no";
      badge.textContent = "No cutoff data";
      big.textContent = "This bank/transfer combination has no cutoff data in v1.";
      explain.textContent = "Pick a different bank or transfer type.";
      out.hidden = false;
      return;
    }

    const cutMin = minutesSinceMidnight(cut);

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const biz = isBusinessDayET(dateObj);
    const beforeCutoff = tMin < cutMin; // strict: at cutoff = missed

    let processesToday = biz.ok && beforeCutoff;
    let processingDate = dateObj;
    let why = "";

    if (!biz.ok) {
      processesToday = false;
      processingDate = nextBusinessDay(dateObj);
      why = `${biz.reason}. Transfers generally process on the next business day.`;
    } else if (!beforeCutoff) {
      processesToday = false;
      processingDate = nextBusinessDay(dateObj);
      why = `Time is after the cutoff (${cut} ET) for this selection.`;
    } else {
      why = `Time is before the cutoff (${cut} ET) and the date is a business day.`;
    }

    const bankName = BANKS.find(b => b.id === bankId)?.name || "Selected bank";
    const transferName = TRANSFERS.find(t => t.id === transferId)?.name || "Selected transfer";

    if (processesToday) {
      badge.className = "badge ok";
      badge.textContent = "Likely processes today";
      big.textContent = `Result: ${transferName} at ${bankName} should process on ${formatDateLong(processingDate)}.`;
    } else {
      badge.className = "badge no";
      badge.textContent = "Likely next business day";
      big.textContent = `Result: ${transferName} at ${bankName} should process on ${formatDateLong(processingDate)}.`;
    }

    explain.textContent = `${why} (All cutoffs are treated as Eastern Time.)`;

    $("detail").innerHTML =
      `<div class="sep"></div>
       <div class="mini">
         Cutoff used: <span class="k">${cut} ET</span> &nbsp; • &nbsp;
         Input time: <span class="k">${timeStr} ET</span> &nbsp; • &nbsp;
         Date: <span class="k">${dateStr}</span>
       </div>`;

    out.hidden = false;
  }

  // Guard against iOS Safari edge case where DOMContentLoaded can fire
  // before a mid-body blocking script finishes registering its listener.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
