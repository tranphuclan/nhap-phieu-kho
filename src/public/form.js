const fmt = (n) => n.toLocaleString("vi-VN");

function digitsOnly(raw) {
  return String(raw).replace(/\D/g, "");
}

function formatVndGrouped(raw) {
  const digits = digitsOnly(raw);
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function formatPriceInput(input) {
  const old = input.value;
  const caret = input.selectionStart ?? old.length;
  const digitsBeforeCaret = digitsOnly(old.slice(0, caret)).length;
  const formatted = formatVndGrouped(old);
  if (formatted === old) return;
  input.value = formatted;
  let pos = 0;
  let seen = 0;
  while (pos < formatted.length && seen < digitsBeforeCaret) {
    if (/\d/.test(formatted.charAt(pos))) seen += 1;
    pos += 1;
  }
  input.setSelectionRange(pos, pos);
}

function parsePrice(raw) {
  const text = String(raw || "0").trim();
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    return Number(text.replaceAll(".", ""));
  }
  return Number(text.replace(",", "."));
}

function recalc() {
  let total = 0;
  document.querySelectorAll("#lines tbody tr").forEach((row, i) => {
    const stt = row.querySelector(".stt");
    if (stt) stt.textContent = String(i + 1);
    const qty = Number(String(row.querySelector(".qty-recv")?.value || "0").replace(",", "."));
    const price = parsePrice(row.querySelector(".price")?.value);
    const amount = Math.round(qty * price);
    const cell = row.querySelector(".amount");
    if (cell) cell.textContent = fmt(Number.isFinite(amount) ? amount : 0);
    if (Number.isFinite(amount)) total += amount;
  });
  const grand = document.getElementById("grand");
  if (grand) grand.textContent = fmt(total);
}

const linesTable = document.getElementById("lines");
if (linesTable) {
  linesTable.addEventListener("input", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.classList.contains("price")) {
      formatPriceInput(target);
    }
    recalc();
  });
  linesTable.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (!event.target.classList.contains("row-remove")) return;
    const tbody = document.querySelector("#lines tbody");
    if (tbody && tbody.rows.length > 1) {
      event.target.closest("tr")?.remove();
      recalc();
    }
  });
}

document.getElementById("add-row")?.addEventListener("click", () => {
  const tbody = document.querySelector("#lines tbody");
  if (!tbody || tbody.rows.length === 0) return;
  const tr = tbody.rows[0].cloneNode(true);
  if (!(tr instanceof HTMLTableRowElement)) return;
  tr.querySelectorAll("input").forEach((el) => {
    el.value = "";
  });
  const amount = tr.querySelector(".amount");
  if (amount) amount.textContent = "0";
  tbody.appendChild(tr);
  recalc();
});

document.querySelectorAll("#lines input.price").forEach((input) => {
  if (input instanceof HTMLInputElement) formatPriceInput(input);
});
recalc();
