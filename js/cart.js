const $ = (s) => document.querySelector(s);
const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
const angka = (n) => new Intl.NumberFormat("id-ID").format(n);

const KUPON = { PROYEKHEMAT: 50000 };      // kode -> potongan
const ONGKIR = { reguler: 35000, truk: 150000 };
const BATAS_REGULER_KG = 25;

/* ---------- State (disimpan di localStorage) ---------- */
let keranjang = JSON.parse(localStorage.getItem("kt_cart") || "[]");
let wishCount = JSON.parse(localStorage.getItem("kt_wish") || "[]").length;
let kupon = localStorage.getItem("kt_coupon") || "";
let metode = localStorage.getItem("kt_ship") || "truk";

let orderId = localStorage.getItem("kt_order");
if (!orderId) {
  orderId = "#PO-" + Math.floor(10000 + Math.random() * 90000);
  localStorage.setItem("kt_order", orderId);
}

function simpan() {
  localStorage.setItem("kt_cart", JSON.stringify(keranjang));
  localStorage.setItem("kt_coupon", kupon);
  localStorage.setItem("kt_ship", metode);
}

/* ---------- Helper ---------- */
const cariProduk = (id) => produk.find(p => p.id === id);
const beratItem = (item) => (detailKeranjang[item.id].bobotKg || 0) * item.qty;

function hitung() {
  const subtotal = keranjang.reduce((s, i) => s + cariProduk(i.id).harga * i.qty, 0);
  const berat = keranjang.reduce((s, i) => s + beratItem(i), 0);
  const ada = keranjang.length > 0;
  const ongkir = ada ? ONGKIR[metode] : 0;
  const diskon = ada && KUPON[kupon] ? Math.min(KUPON[kupon], subtotal) : 0;
  const total = subtotal + ongkir - diskon;
  const ppn = Math.round(total * 11 / 111);   // PPN 11% sudah termasuk harga
  return { subtotal, berat, ongkir, diskon, total, ppn };
}

/* ---------- Render ---------- */
function renderItems() {
  const wadah = $("#cartItems");
  if (!keranjang.length) {
    wadah.innerHTML = `
      <div class="empty-cart">
        <p>Keranjang Anda masih kosong.</p>
        <a class="btn btn--primary" href="katalog.html">Jelajahi Katalog</a>
      </div>`;
    return;
  }
  wadah.innerHTML = keranjang.map(item => {
    const p = cariProduk(item.id), d = detailKeranjang[item.id];
    const tag = d.tag || `Kuantitas: ${item.qty} ${d.satuan}`;
    const catatan = d.tag ? `${item.qty} ${d.satuan}` : `(Total ${angka(beratItem(item))} kg)`;
    return `
      <article class="ci">
        <div class="ci__img"><img src="${p.foto}" alt="${p.nama}"></div>
        <div class="ci__info">
          <small class="ci__sku">SKU: ${d.sku} • <em>${d.info}</em></small>
          <h3>${p.nama}</h3>
          <span class="ci__tag">${tag}</span><span class="ci__note">${catatan}</span>
        </div>
        <div class="ci__side">
          <strong class="ci__total">${rupiah(p.harga * item.qty)}</strong>
          <small class="ci__unit">@ ${rupiah(p.harga)} / ${d.satuan}</small>
          <div class="ci__ctrl">
            <div class="qty">
              <button data-act="minus" data-id="${item.id}" aria-label="Kurangi">−</button>
              <span>${item.qty}</span>
              <button data-act="plus" data-id="${item.id}" aria-label="Tambah">+</button>
            </div>
            <button class="ci__del" data-act="del" data-id="${item.id}" aria-label="Hapus item">🗑</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function renderPengiriman(berat) {
  const terlaluBerat = berat > BATAS_REGULER_KG;
  if (terlaluBerat && metode === "reguler") metode = "truk";

  $("#optReguler").classList.toggle("disabled", terlaluBerat);
  document.querySelector('input[value="reguler"]').disabled = terlaluBerat;
  document.querySelector('input[value="reguler"]').checked = metode === "reguler";
  document.querySelector('input[value="truk"]').checked = metode === "truk";
  $("#regulerNote").textContent = terlaluBerat
    ? `⚠ Muatan ${angka(berat)} kg melebihi batas ${BATAS_REGULER_KG} kg`
    : "🚚 JNE Cargo / SiCepat B2B";
}

function renderRingkasan() {
  const h = hitung();
  $("#cartSubtitle").textContent = keranjang.length
    ? `${keranjang.length} item dalam keranjang Anda siap diproses ke lokasi proyek.`
    : "Belum ada item. Tambahkan produk dari katalog.";
  $("#orderId").textContent = "ID Pesanan: " + orderId;
  $("#lblSub").textContent = `Subtotal Produk (${keranjang.length} Item)`;
  $("#sumSub").textContent = rupiah(h.subtotal);
  $("#sumShip").textContent = rupiah(h.ongkir);
  $("#sumDisc").textContent = h.diskon ? "−" + rupiah(h.diskon) : rupiah(0);
  $("#sumPpn").textContent = rupiah(h.ppn);
  $("#sumTotal").textContent = rupiah(h.total);
  renderPengiriman(h.berat);
}

function updateBadge() {
  $("#cartCount").textContent = keranjang.reduce((s, i) => s + i.qty, 0);
  $("#wishCount").textContent = wishCount;
}

function refresh() {
  simpan();
  renderItems();
  renderRingkasan();
  updateBadge();
}

/* ---------- Kupon ---------- */
function pesanKupon(teks, ok) {
  const el = $("#couponMsg");
  el.textContent = teks;
  el.className = "coupon__msg " + (ok ? "ok" : "err");
}

$("#couponBtn").addEventListener("click", () => {
  const kode = $("#couponInput").value.trim().toUpperCase();
  if (!kode) { kupon = ""; pesanKupon("", true); }
  else if (KUPON[kode]) {
    kupon = kode;
    pesanKupon(`✔ Diskon Mitra Arsitek diterapkan (−${rupiah(KUPON[kode])})`, true);
  } else {
    kupon = "";
    pesanKupon("✘ Kode kupon tidak valid", false);
  }
  refresh();
});

/* ---------- Event item ---------- */
$("#cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const item = keranjang.find(i => i.id === id);
  if (!item) return;

  if (btn.dataset.act === "plus") item.qty = Math.min(item.qty + 1, 999);
  if (btn.dataset.act === "minus") item.qty = Math.max(item.qty - 1, 1);
  if (btn.dataset.act === "del") {
    keranjang = keranjang.filter(i => i.id !== id);
    toast(`${cariProduk(id).nama} dihapus dari keranjang`);
  }
  refresh();
});

/* ---------- Metode pengiriman ---------- */
document.querySelectorAll('input[name="ship"]').forEach(r =>
  r.addEventListener("change", () => { metode = r.value; refresh(); })
);

/* ---------- Tombol lain ---------- */
$("#checkoutBtn").addEventListener("click", () => {
  if (!keranjang.length) return toast("Keranjang masih kosong");
  toast("Halaman pembayaran (langkah 2) akan dibuat di tahap berikutnya");
});
$("#editAddr").addEventListener("click", () => toast("Fitur ubah alamat akan dibuat di tahap berikutnya"));
$("#quoteBtn").addEventListener("click", (e) => { e.preventDefault(); toast("Fitur unduh penawaran akan dibuat di tahap berikutnya"); });
$("#hamburger").addEventListener("click", () => $("#menu").classList.toggle("open"));

/* ---------- Toast ---------- */
let timer;
function toast(pesan) {
  const t = $("#toast");
  t.textContent = pesan;
  t.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Init ---------- */
if (KUPON[kupon]) {
  $("#couponInput").value = kupon;
  pesanKupon(`✔ Diskon Mitra Arsitek diterapkan (−${rupiah(KUPON[kupon])})`, true);
}
refresh();