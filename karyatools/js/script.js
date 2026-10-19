const $ = (s) => document.querySelector(s);
const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

let keranjang = JSON.parse(localStorage.getItem("kt_cart") || "[]");   // array of {id, qty}
let wishlist = new Set(JSON.parse(localStorage.getItem("kt_wish") || "[]"));

/* ---------- Render ---------- */
function renderKategori() {
  $("#categoryGrid").innerHTML = kategori.map(k => `
    <a href="katalog.html?kategori=${encodeURIComponent(k.nama)}" class="cat">
      <span class="cat__icon">${k.ikon}</span>
      <strong>${k.nama}</strong>
      <small>${k.jumlah}</small>
    </a>`).join("");
}

function renderProduk(daftar = produk) {
  $("#emptyMsg").hidden = daftar.length > 0;
  $("#productGrid").innerHTML = daftar.map(p => `
    <article class="card">
      <div class="card__media">
        <span class="card__spec">${p.spek}</span>
        <button class="card__wish ${wishlist.has(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Simpan ke wishlist">♡</button>
        <img src="${p.foto}" alt="${p.nama}" loading="lazy">
      </div>
      <div class="card__body">
        <small class="card__brand">${p.merek}</small>
        <h3>${p.nama}</h3>
        <div class="card__rate">★ ${p.rating.toFixed(1)} <span>(${p.ulasan} ulasan)</span></div>
        <div class="card__foot">
          <div><small>Harga Satuan</small><strong>${rupiah(p.harga)}</strong></div>
          <button class="btn btn--soft btn--sm" data-add="${p.id}">🛒 Tambah</button>
        </div>
      </div>
    </article>`).join("");
}

/* ---------- Badge, keranjang & wishlist ---------- */
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
  renderProduk(hasilFilter());
}

/* ---------- Pencarian ---------- */
function hasilFilter() {
  const q = $("#searchInput").value.trim().toLowerCase();
  return produk.filter(p => (p.nama + " " + p.merek).toLowerCase().includes(q));
}

/* ---------- Toast ---------- */
let timer;
function toast(pesan) {
  const t = $("#toast");
  t.textContent = pesan;
  t.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Event ---------- */
$("#productGrid").addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  const wish = e.target.closest("[data-wish]");
  if (add) tambahKeranjang(Number(add.dataset.add));
  if (wish) toggleWishlist(Number(wish.dataset.wish));
});

$("#searchInput").addEventListener("input", () => renderProduk(hasilFilter()));
$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("produk").scrollIntoView({ behavior: "smooth" });
});

$("#newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  toast("Terima kasih, Anda berhasil berlangganan!");
  e.target.reset();
});

$("#hamburger").addEventListener("click", () => $("#menu").classList.toggle("open"));

/* ---------- Init ---------- */
renderKategori();
renderProduk();
updateBadge();

const q = new URLSearchParams(location.search).get("q");
if (q) { $("#searchInput").value = q; renderProduk(hasilFilter()); }