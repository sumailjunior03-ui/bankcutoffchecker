const banks = [
  { id: "chase", name: "Chase", ach: "17:00", wire: "16:00", same_day_ach: "17:00" },
  { id: "bofa", name: "Bank of America", ach: "17:00", wire: "17:00", same_day_ach: "17:00" },
  { id: "wells", name: "Wells Fargo", ach: "17:00", wire: "16:00", same_day_ach: "17:00" }
];

const bankSelect = document.getElementById("bank");
banks.forEach(b => {
  const o = document.createElement("option");
  o.value = b.id; o.textContent = b.name;
  bankSelect.appendChild(o);
});

function isWeekend(d) {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

function parseTime(t) {
  if (!t) return "";
  t = t.trim().toUpperCase();
  t = t.replace(/ ?(ET|EST|EDT)/g, ""); // Remove timezone

  let isPM = t.includes("PM");
  let isAM = t.includes("AM");

  let cleanTime = t.replace(/(AM|PM)/g, "").trim();
  let parts = cleanTime.split(":");

  if (parts.length < 2) {
    // Maybe user typed "3 PM"?
    if (parts.length === 1 && (isAM || isPM)) {
      parts = [parts[0], "00"];
    } else {
      return t; // Return raw if parsing fails, trying luck
    }
  }

  let h = parseInt(parts[0], 10);
  let m = parts[1];

  if (isNaN(h)) return "";

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return (h < 10 ? "0" + h : h) + ":" + m;
}

function check() {
  const bank = banks.find(b => b.id === bankSelect.value);
  const rail = document.getElementById("rail").value;
  const date = document.getElementById("date").value;
  const timeRaw = document.getElementById("time").value;
  const time = parseTime(timeRaw);

  const result = document.getElementById("result");

  if (!date || !time) {
    if (!time && timeRaw) result.textContent = "Please enter time in HH:MM AM/PM format.";
    return;
  }

  const cutoff = bank[rail];

  if (!cutoff) {
    result.textContent = "Cutoff information missing for this selection.";
    return;
  }

  if (time > cutoff) {
    result.textContent = "After cutoff — processes next business day."; // "After cutoff — processes next business day."
  } else {
    result.textContent = "Before cutoff — processes today."; // "Before cutoff — processes today."
  }
}
