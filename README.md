# Classmate Static Website

Website company profile statis untuk Classmate, kids event organizer untuk anak usia 5-8 tahun.

## File

- `index.html` untuk struktur halaman dan SEO meta tags.
- `styles.css` untuk tampilan responsive, warna, layout, dan animasi ringan.
- `script.js` untuk form WhatsApp, floating chatbot, dan interaksi ringan.
- `site.webmanifest` untuk metadata ikon saat website disimpan ke home screen.
- `assets/classmate-logo.png` untuk logo navbar, favicon, dan apple touch icon.
- `README.md` untuk catatan penggunaan dan deploy.

## Cara Run Lokal

Tidak perlu install dependency dan tidak perlu build.

1. Buka folder project.
2. Klik dua kali `index.html`, atau jalankan server statis sederhana seperti `python -m http.server 8080`.
3. Semua fitur utama berjalan client-side. Chatbot membutuhkan koneksi internet karena memuat Puter.js dari CDN.

## Deploy ke Cloudflare Pages

Cara paling sederhana:

1. Masuk ke Cloudflare Dashboard.
2. Buka **Workers & Pages**.
3. Pilih **Create application** lalu **Pages**.
4. Pilih **Upload assets**.
5. Upload file `index.html`, `styles.css`, `script.js`, `site.webmanifest`, `README.md`, dan folder `assets`.
6. Deploy.

Jika memakai Git:

1. Push folder ini ke GitHub atau GitLab.
2. Hubungkan repository ke Cloudflare Pages.
3. Build command: kosongkan.
4. Build output directory: `/` atau root project.
5. Deploy.

## Logo, Favicon, dan Apple Touch Icon

Logo utama memakai file:

```text
assets/classmate-logo.png
```

File ini dipakai untuk:

- logo navbar
- logo footer
- favicon browser tab
- apple touch icon
- icon di `site.webmanifest`

Untuk mengganti logo, cukup replace file `assets/classmate-logo.png` dengan logo resmi Classmate. Rekomendasi ukuran minimal 512 x 512 px, format PNG, background transparan atau solid yang tetap jelas di atas background putih.

Jika ingin mengganti nama file, update link di:

- `index.html`
- `site.webmanifest`

## Instagram dan Social Media

Instagram resmi saat ini:

```text
https://www.instagram.com/classmateid/
```

Untuk mengganti link Instagram, edit bagian footer di `index.html`. Data profil seperti `Since 2023`, `100+ Events`, `20+ Clients`, `@funmateid`, dan `@exploremateid` juga berada di `index.html`.

## Mengubah Nomor WhatsApp Admin

Nomor placeholder saat ini:

```js
628992400880
```

Ubah di dua tempat:

- `script.js`, pada konstanta `ADMIN_PHONE`.
- `index.html`, pada link yang memakai `https://wa.me/628992400880`.

Gunakan format internasional tanpa `+`, spasi, atau tanda hubung. Contoh: `6281234567890`.

## Mengubah Warna dan Konten

Warna utama ada di `styles.css` bagian `:root`.

```css
--primary: #2dd4bf;
--purple: #a78bfa;
--orange: #fb923c;
--pink: #fb7185;
--yellow: #facc15;
--text: #0f172a;
--soft: #f8fafc;
```

Konten teks ada di `index.html`. Edit langsung bagian section seperti hero, layanan, event, partner, testimoni, dan kontak.

## Catatan Puter.js Chatbot

Chatbot memakai Puter.js:

```html
<script src="https://js.puter.com/v2/"></script>
```

Catatan penting:

- Tidak membutuhkan API key.
- Tidak memakai backend.
- Tidak menyimpan data ke database.
- Riwayat chat hanya disimpan sementara di memory browser selama halaman masih terbuka.
- Jika Puter AI gagal dimuat atau tidak tersedia, chatbot menampilkan pesan fallback dan mengarahkan user untuk menghubungi admin WhatsApp.
- Jika Puter membutuhkan autentikasi user atau respons AI terlalu lama, chat akan timeout dan menampilkan fallback agar UI tidak macet.
- Untuk pendaftaran resmi, user tetap diarahkan menghubungi admin.
