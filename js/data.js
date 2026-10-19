const kategori = [
  { nama: "Power Tools",         jumlah: "680+ Seri",    ikon: "🛠️" },
  { nama: "Material Konstruksi", jumlah: "1.200+ Produk", ikon: "🏗️" },
  { nama: "Perkakas Tangan",     jumlah: "450+ Tipe",    ikon: "🔧" },
  { nama: "Cat & Finishing",     jumlah: "890+ Varian",  ikon: "🎨" },
  { nama: "Perlengkapan K3",     jumlah: "320+ Alat",    ikon: "🦺" },
  { nama: "Aksesoris Bangunan",  jumlah: "1.500+ Detail", ikon: "🔩" }
];

const produk = [
  { id: 1, merek: "DEWALT",     nama: "DeWalt DCD796 Cordless Brushless Hammer Drill", spek: "18V XR",        rating: 4.9, ulasan: 128, harga: 2450000, foto: "img/bor-dewalt.png" },
  { id: 2, merek: "INDOCEMENT", nama: "Semen Tiga Roda Portland Composite PCC 50kg",   spek: "SNI 2049",      rating: 4.8, ulasan: 540, harga: 76500,   foto: "img/semen.png" },
  { id: 3, merek: "BOSCH PRO",  nama: "Bosch GLM 50-27 CG Green Laser Rangefinder",    spek: "±1.5mm Presisi", rating: 5.0, ulasan: 94,  harga: 1820000, foto: "img/laser.png" },
  { id: 4, merek: "BOSCH",      nama: "Bosch GWS 060 Professional Angle Grinder",      spek: "4 Inch / 720W", rating: 4.7, ulasan: 312, harga: 540000,  foto: "img/gerinda.png" },
  { id: 5, merek: "MU-WEBER",   nama: "MU-380 Perekat Bata Ringan Thinbed Presisi",    spek: "40 Kg / Sak",   rating: 4.9, ulasan: 410, harga: 89000,   foto: "img/perekat.png" },
  { id: 6, merek: "ANSELL",     nama: "Sarung Tangan K3 Anti-Cut HyFlex Industrial",   spek: "EN 388 Level 4", rating: 4.8, ulasan: 87,  harga: 115000,  foto: "img/sarung.png" },
  { id: 7, merek: "MITUTOYO",   nama: "Mitutoyo Digimatic Caliper 150mm Stainless",    spek: "0.01 mm Res",   rating: 4.9, ulasan: 62,  harga: 1650000, foto: "img/caliper.png" },
  { id: 8, merek: "NIPPON PAINT", nama: "Weatherbond Max Exterior Finish Cat Tembok",  spek: "20 Liter Pail", rating: 4.8, ulasan: 144, harga: 1980000, foto: "img/cat.png" }
];

// Kategori tiap produk (kunci = id produk)
const kategoriProduk = {
  1: "Power Tools",
  2: "Material Konstruksi",
  3: "Perkakas Tangan",
  4: "Power Tools",
  5: "Material Konstruksi",
  6: "Perlengkapan K3",
  7: "Perkakas Tangan",
  8: "Cat & Finishing"
};
produk.forEach(p => { p.kategori = kategoriProduk[p.id]; });

// Detail tambahan untuk halaman keranjang (kunci = id produk)
const detailKeranjang = {
  1: { sku: "DCD796P2",    info: "Garansi 3 Thn",   tag: "Paket Baterai 5.0Ah", satuan: "Unit", bobotKg: 2.5 },
  2: { sku: "TR-PCC50",    info: "SNI 7064:2014",   satuan: "Sak",   bobotKg: 50 },
  3: { sku: "GLM50-27CG",  info: "Garansi 1 Thn",   satuan: "Unit",  bobotKg: 0.4 },
  4: { sku: "GWS060",      info: "Garansi 6 Bln",   satuan: "Unit",  bobotKg: 1.5 },
  5: { sku: "MU-380",      info: "Kemasan 40 Kg",   satuan: "Sak",   bobotKg: 40 },
  6: { sku: "ANS-HYFLEX",  info: "EN 388 Level 4",  satuan: "Pasang", bobotKg: 0.2 },
  7: { sku: "MTY-CAL150",  info: "Garansi 2 Thn",   satuan: "Unit",  bobotKg: 0.3 },
  8: { sku: "NP-WBMAX-20", info: "Kemasan 20 Liter", satuan: "Pail", bobotKg: 26 }
};