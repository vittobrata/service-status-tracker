const STORAGE_KEY = 'service-status-tracker-v1';
const STATUSES = ['Diterima', 'Diagnosa', 'Sedang dikerjakan', 'Selesai', 'Sudah diambil'];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

// ---------- Data ----------
function sampleData() {
  const day = 86400000;
  const now = Date.now();
  const mk = (code, customer, device, issue, step, startAgo) => ({
    code, customer, device, issue, step,
    history: Array.from({ length: step + 1 }, (_, i) => ({
      status: STATUSES[i],
      note: i === 0 ? 'Unit diterima di meja layanan.' : '',
      time: new Date(now - startAgo * day + i * (day / 2)).toISOString()
    }))
  });
  return [
    mk('SRV-2026-0001', 'Budi Santoso', 'Laptop Asus A409', 'Layar bergaris', 2, 3),
    mk('SRV-2026-0002', 'Siti Rahma', 'iPhone 11', 'Baterai cepat habis', 3, 4),
    mk('SRV-2026-0003', 'Andi Pratama', 'MacBook Air 2017', 'Tidak bisa charging', 0, 1)
  ];
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d)) return d; }
  } catch (e) { /* data rusak */ }
  return sampleData();
}
let tickets = load();
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); } catch (e) { /* abaikan */ } };

// ---------- Logika (fungsi murni) ----------
const normalizeCode = (s) => String(s).trim().toUpperCase().replace(/\s+/g, '');

function findTicket(list, code) {
  const c = normalizeCode(code);
  return list.find((t) => t.code === c) || null;
}

function nextCode(list, year = new Date().getFullYear()) {
  const prefix = `SRV-${year}-`;
  const max = list.filter((t) => t.code.startsWith(prefix))
    .reduce((m, t) => Math.max(m, parseInt(t.code.slice(prefix.length), 10) || 0), 0);
  return prefix + String(max + 1).padStart(4, '0');
}

function advance(ticket, note) {
  if (ticket.step >= STATUSES.length - 1) return false;
  ticket.step += 1;
  ticket.history.push({ status: STATUSES[ticket.step], note: note || '', time: new Date().toISOString() });
  return true;
}

// ---------- Tampilan pelanggan ----------
function ticketCard(t) {
  const steps = STATUSES.map((s, i) => {
    const h = t.history.find((x) => x.status === s);
    const cls = i < t.step ? 'done' : i === t.step ? 'done current' : '';
    return `<li class="${cls}">${esc(s)}${h ? `<small>${fmt(h.time)}${h.note ? ' - ' + esc(h.note) : ''}</small>` : ''}</li>`;
  }).join('');
  const finished = t.step >= 3;
  return `
    <div class="card">
      <h3>${esc(t.code)} <span class="badge ${finished ? 'done' : ''}">${esc(STATUSES[t.step])}</span></h3>
      <p class="meta">${esc(t.customer)} &middot; ${esc(t.device)} &middot; Keluhan: ${esc(t.issue)}</p>
      <ol class="steps">${steps}</ol>
    </div>`;
}

$('lookupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const t = findTicket(tickets, $('codeInput').value);
  $('result').innerHTML = t
    ? ticketCard(t)
    : '<p class="error">Nomor transaksi tidak ditemukan. Periksa kembali nomor pada nota servismu.</p>';
});

// ---------- Tampilan admin ----------
function renderAdmin() {
  const list = $('ticketList');
  if (!tickets.length) { list.innerHTML = '<p class="hint">Belum ada tiket.</p>'; return; }
  list.innerHTML = [...tickets].reverse().map((t) => `
    <div class="card">
      <h3>${esc(t.code)} <span class="badge ${t.step >= 3 ? 'done' : ''}">${esc(STATUSES[t.step])}</span></h3>
      <p class="meta">${esc(t.customer)} &middot; ${esc(t.device)} &middot; ${esc(t.issue)}</p>
      ${t.step < STATUSES.length - 1 ? `
        <div class="admin-row">
          <input data-note="${esc(t.code)}" placeholder="Catatan (opsional)" maxlength="100">
          <button class="btn small" data-next="${esc(t.code)}">Lanjut ke: ${esc(STATUSES[t.step + 1])}</button>
          <button class="btn small ghost danger" data-del="${esc(t.code)}">Hapus</button>
        </div>` : `
        <div class="admin-row"><span class="hint">Tiket selesai.</span>
          <button class="btn small ghost danger" data-del="${esc(t.code)}">Hapus</button></div>`}
    </div>`).join('');
}

$('ticketForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  tickets.push({
    code: nextCode(tickets),
    customer: String(f.get('customer')).trim(),
    device: String(f.get('device')).trim(),
    issue: String(f.get('issue')).trim(),
    step: 0,
    history: [{ status: STATUSES[0], note: 'Unit diterima di meja layanan.', time: new Date().toISOString() }]
  });
  save(); renderAdmin(); e.target.reset();
});

$('ticketList').addEventListener('click', (e) => {
  const next = e.target.getAttribute('data-next');
  const del = e.target.getAttribute('data-del');
  if (next) {
    const t = findTicket(tickets, next);
    const noteEl = document.querySelector(`[data-note="${CSS.escape(next)}"]`);
    if (t && advance(t, noteEl ? noteEl.value.trim() : '')) { save(); renderAdmin(); }
  } else if (del && confirm('Hapus tiket ini?')) {
    tickets = tickets.filter((t) => t.code !== del);
    save(); renderAdmin();
  }
});

$('resetBtn').addEventListener('click', () => {
  if (confirm('Kembalikan ke data contoh?')) { tickets = sampleData(); save(); renderAdmin(); $('result').innerHTML = ''; }
});

// ---------- Tab ----------
document.querySelectorAll('.tab').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b === btn));
  $('tab-customer').hidden = btn.dataset.tab !== 'customer';
  $('tab-admin').hidden = btn.dataset.tab !== 'admin';
  if (btn.dataset.tab === 'admin') renderAdmin();
}));

renderAdmin();

if (typeof module !== 'undefined') module.exports = { findTicket, nextCode, advance, normalizeCode, STATUSES };
