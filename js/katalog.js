const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PER_PAGE = 6;   // jumlah produk per halaman

/* ---------- State ---------- */
let keranjang = JSON.parse(localStorage.getItem("kt_cart") || "[]");
let wishlist = new Set(JSON.parse(localStorage.getItem("kt_wish") || "[]"));

const state = {
  q: "", kategori: new Set(), merek: new Set(),
  min: null, max: null, rating: 0, sort: "relevan", page: 1
};

// Baca filter awal dari URL (?q=...&kategori=A,B)
const params = new URLSearchParams(location.search);
state.q = params.get("q") || "";
(params.get("kategori") || "").split(",").filter(Boolean).forEach(k => state.kategori.add(k));

/* ---------- Filter & sorting ---------- */
const PENGURUT = {
  relevan: null,
  termurah: (a, b) => a.harga - b.harga,
  termahal: (a, b) => b.harga - a.harga,
  rating: (a, b) => b.rating - a.rating || b.ulasan - a.ulasan,
  ulasan: (a, b) => b.ulasan - a.ulasan,
  nama: (a, b) => a.nama.localeCompare(b.nama, "id")
};

function terfilter() {
  const q = state.q.trim().toLowerCase();
  const hasil = produk.filter(p =>
    (!q || (p.nama + " " + p.merek + " " + p.kategori).toLowerCase().includes(q)) &&
    (!state.kategori.size || state.kategori.has(p.kategori)) &&
    (!state.merek.size || state.merek.has(p.merek)) &&
    (state.min === null || p.harga >= state.min) &&
    (state.max === null || p.harga <= state.max) &&
    p.rating >= state.rating
  );
  const fn = PENGURUT[state.sort];
  if (fn) hasil.sort(fn);
  return hasil;
}

/* ---------- Render ---------- */
function kartu(p) {
  return `
    <article class="card">
      <div class="card__media">
        <span class="card__spec">${esc(p.spek)}</span>
        <button class="card__wish ${wishlist.has(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Simpan ke wishlist">♡</button>
        <img src="${p.foto}" alt="${esc(p.nama)}" loading="lazy">
      </div>
      <div class="card__body">
        <small class="card__brand">${esc(p.merek)}</small>
        <h3>${esc(p.nama)}</h3>
        <div class="card__rate">★ ${p.rating.toFixed(1)} <span>(${p.ulasan} ulasan)</span></div>
        <div class="card__foot">
          <div><small>Harga Satuan</small><strong>${rupiah(p.harga)}</strong></div>
          <button class="btn btn--soft btn--sm" data-add="${p.id}">🛒 Tambah</button>
        </div>
      </div>
    </article>`;
}

function buildFilters() {
  $("#fKategori").innerHTML = kategori.map(k => {
    const n = produk.filter(p => p.kategori === k.nama).length;
    return `<label class="check">
      <input type="checkbox" data-f="kategori" value="${esc(k.nama)}">
      <span>${esc(k.nama)}</span><small>${n}</small></label>`;
  }).join("");

  const daftarMerek = [...new Set(produk.map(p => p.merek))].sort();
  $("#fMerek").innerHTML = daftarMerek.map(m => {
    const n = produk.filter(p => p.merek === m).length;
    return `<label class="check">
      <input type="checkbox" data-f="merek" value="${esc(m)}">
      <span>${esc(m)}</span><small>${n}</small></label>`;
  }).join("");
}

// Samakan tampilan kontrol dengan state (dipakai saat reset / hapus chip / awal)
function syncControls() {
  $$("[data-f]").forEach(c => { c.checked = state[c.dataset.f].has(c.value); });
  $("#hargaMin").value = state.min ?? "";
  $("#hargaMax").value = state.max ?? "";
  $$('input[name="rating"]').forEach(r => { r.checked = Number(r.value) === state.rating; });
  $("#sortSelect").value = state.sort;
  $("#searchInput").value = state.q;
}

function renderChips() {
  const c = [];
  if (state.q) c.push({ t: "q", v: "", label: `Cari: “${state.q}”` });
  state.kategori.forEach(v => c.push({ t: "kategori", v, label: v }));
  state.merek.forEach(v => c.push({ t: "merek", v, label: v }));
  if (state.min !== null || state.max !== null) {
    const a = state.min !== null ? rupiah(state.min) : "Rp 0";
    const b = state.max !== null ? rupiah(state.max) : "∞";
    c.push({ t: "harga", v: "", label: `Harga: ${a} – ${b}` });
  }
  if (state.rating) c.push({ t: "rating", v: "", label: `Rating ★ ${state.rating}+` });

  $("#chips").innerHTML = c.map(x => `
    <span class="chip-x">${esc(x.label)}
      <button data-t="${x.t}" data-v="${esc(x.v)}" aria-label="Hapus filter">×</button>
    </span>`).join("");
}

function renderPager(total) {
  const el = $("#pager");
  if (total <= 1) { el.innerHTML = ""; return; }
  let h = `<button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Sebelumnya">‹</button>`;
  for (let i = 1; i <= total; i++) {
    h += `<button data-page="${i}" class="${i === state.page ? "on" : ""}">${i}</button>`;
  }
  h += `<button data-page="${state.page + 1}" ${state.page === total ? "disabled" : ""} aria-label="Berikutnya">›</button>`;
  el.innerHTML = h;
}

function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.kategori.size) p.set("kategori", [...state.kategori].join(","));
  try { history.replaceState(null, "", p.toString() ? "?" + p : location.pathname); } catch (e) {}
}

function render() {
  const hasil = terfilter();
  const totalHal = Math.max(1, Math.ceil(hasil.length / PER_PAGE));
  state.page = Math.min(state.page, totalHal);
  const mulai = (state.page - 1) * PER_PAGE;
  const tampil = hasil.slice(mulai, mulai + PER_PAGE);

  $("#resultInfo").textContent = hasil.length
    ? `Menampilkan ${mulai + 1}–${mulai + tampil.length} dari ${hasil.length} produk`
    : "0 produk ditemukan";
  $("#emptyMsg").hidden = hasil.length > 0;
  $("#productGrid").innerHTML = tampil.map(kartu).join("");

  renderPager(totalHal);
  renderChips();
  syncUrl();
}

/* ---------- Badge, keranjang, wishlist ---------- */
function updateBadge() {
  $("#cartCount").textContent = keranjang.reduce((s, i) => s + i.qty, 0);
  $("#wishCount").textContent = wishlist.size;
}

function tambahKeranjang(id) {
  const item = keranjang.find(i => i.id === id);
  if (item) item.qty++; else keranjang.push({ id, qty: 1 });
  localStorage.setItem("kt_cart", JSON.stringify(keranjang));
  updateBadge();
  toast(`${produk.find(p => p.id === id).nama} ditambahkan ke keranjang`);
}

function toggleWishlist(id) {
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
  localStorage.setItem("kt_wish", JSON.stringify([...wishlist]));
  updateBadge();
  render();
}

let timer;
function toast(pesan) {
  const t = $("#toast");
  t.textContent = pesan;
  t.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Event ---------- */
$("#filters").addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.f) {
    const set = state[t.dataset.f];
    t.checked ? set.add(t.value) : set.delete(t.value);
  }
  if (t.name === "rating") state.rating = Number(t.value);
  state.page = 1;
  render();
});

const angkaAtauNull = (v) => (v === "" ? null : Math.max(0, Number(v)));
$("#hargaMin").addEventListener("input", (e) => { state.min = angkaAtauNull(e.target.value); state.page = 1; render(); });
$("#hargaMax").addEventListener("input", (e) => { state.max = angkaAtauNull(e.target.value); state.page = 1; render(); });

$("#presets").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  state.min = angkaAtauNull(b.dataset.min);
  state.max = angkaAtauNull(b.dataset.max);
  state.page = 1;
  syncControls();
  render();
});

$("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; state.page = 1; render(); });

$("#searchInput").addEventListener("input", (e) => { state.q = e.target.value; state.page = 1; render(); });
$("#searchForm").addEventListener("submit", (e) => e.preventDefault());

$("#chips").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const { t, v } = b.dataset;
  if (t === "q") state.q = "";
  if (t === "kategori" || t === "merek") state[t].delete(v);
  if (t === "harga") { state.min = null; state.max = null; }
  if (t === "rating") state.rating = 0;
  state.page = 1;
  syncControls();
  render();
});

function resetFilter() {
  state.q = "";
  state.kategori.clear();
  state.merek.clear();
  state.min = null;
  state.max = null;
  state.rating = 0;
  state.page = 1;
  syncControls();
  render();
}
$("#resetBtn").addEventListener("click", resetFilter);
$("#emptyReset").addEventListener("click", resetFilter);

$("#pager").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-page]");
  if (!b || b.disabled) return;
  state.page = Number(b.dataset.page);
  render();
  document.querySelector(".cat-head").scrollIntoView({ behavior: "smooth" });
});

$("#productGrid").addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  const wish = e.target.closest("[data-wish]");
  if (add) tambahKeranjang(Number(add.dataset.add));
  if (wish) toggleWishlist(Number(wish.dataset.wish));
});

$("#filterToggle").addEventListener("click", () => $("#filters").classList.toggle("open"));
$("#hamburger").addEventListener("click", () => $("#menu").classList.toggle("open"));

/* ---------- Init ---------- */
buildFilters();
syncControls();
updateBadge();
render();