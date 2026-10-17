# Service Status Tracker

Demo fitur cek status perbaikan berdasarkan nomor transaksi, lengkap dengan panel admin untuk membuat tiket dan memperbarui statusnya. Terinspirasi fitur serupa pada skripsi saya.

## Fitur
- **Cek Status:** pelanggan memasukkan nomor transaksi dan melihat linimasa status
- **Panel Admin:** buat tiket baru (nomor otomatis `SRV-TAHUN-0001`), lanjutkan status dengan catatan, hapus tiket
- Lima tahap: Diterima, Diagnosa, Sedang dikerjakan, Selesai, Sudah diambil
- Data tersimpan di browser (localStorage), dengan data contoh `SRV-2026-0001` sampai `SRV-2026-0003`

## Teknologi
HTML5, CSS3, JavaScript (vanilla), localStorage

## Struktur
```
index.html   # dua tab: Cek Status dan Panel Admin
style.css    # gaya dan linimasa status
script.js    # logika tiket (findTicket, nextCode, advance), render, event
```

## Catatan teknis
- Nomor transaksi dinormalisasi (huruf besar, spasi dibuang) sebelum dicari
- Teks pengguna di-escape untuk mencegah XSS
- Ini demo front-end tanpa login, sehingga panel admin tidak aman untuk data nyata. Versi dengan autentikasi dan database ada pada pengembangan berikutnya (Laravel dan MySQL)

## Ide pengembangan
- Autentikasi admin dan database
- Notifikasi WhatsApp saat status berubah

## Menjalankan di komputer

Cukup buka `index.html` di browser. Kalau mau lewat server lokal:

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

## Deploy gratis ke GitHub Pages

1. Buat repository baru di GitHub dengan nama **service-status-tracker**, lalu unggah semua file di folder ini.
2. Buka **Settings > Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**, branch **main**, folder **/ (root)**, lalu **Save**.
4. Tunggu 1-2 menit. Website akan aktif di `https://vittobrata.github.io/service-status-tracker/`.
