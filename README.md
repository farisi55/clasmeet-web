# Classmate Company Profile

Website company profile statis untuk Classmate, kids event organizer untuk anak usia 5-8 tahun. Frontend memakai HTML, CSS, dan vanilla JavaScript. Backend kecil untuk form kontak memakai Cloudflare Pages Functions dan Cloudflare D1.

## File

- `index.html` untuk struktur halaman dan SEO meta tags.
- `styles.css` untuk tampilan responsive, warna, layout, dan animasi ringan.
- `script.js` untuk form kontak, WhatsApp CTA, floating chatbot, dan interaksi ringan.
- `functions/classmate/v1/kontak/submit.js` untuk API submit kontak di Cloudflare Pages Functions.
- `db/schema.sql` untuk schema Cloudflare D1.
- `wrangler.toml` untuk konfigurasi Cloudflare Pages dan binding D1.
- `site.webmanifest` untuk metadata ikon saat website disimpan ke home screen.
- `assets/classmate-logo.png` untuk logo navbar, favicon, dan apple touch icon.

## Cara Run Lokal

Untuk frontend statis saja:

```bash
python -m http.server 8080
```

Buka:

```text
http://localhost:8080
```

Untuk menguji Pages Functions dan D1 lokal, gunakan Wrangler:

```bash
wrangler pages dev . --d1 DB_KONTAK=db_kontak
```

Buka:

```text
http://localhost:8788
```

Chatbot membutuhkan koneksi internet karena memuat Puter.js dari CDN.

## API Specification

Endpoint:

```text
POST /classmate/v1/kontak/submit
```

Request body:

```json
{
  "nama": "string",
  "kota": "string",
  "kontak": "string",
  "pesan": "string"
}
```

Success response:

```json
{
  "success": true,
  "message": "Data kontak berhasil dikirim",
  "data": {
    "id": 1
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {}
}
```

Validation:

- `nama` wajib diisi, maksimal 120 karakter.
- `kota` wajib diisi, maksimal 120 karakter.
- `kontak` wajib diisi, maksimal 160 karakter.
- `pesan` wajib diisi, maksimal 1000 karakter.
- `source_kontak` selalu diisi backend dengan nilai `web`.

## Database Specification

Database:

```text
db_kontak
```

Table:

```text
classmate_kontak
```

Columns:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `nama TEXT NOT NULL`
- `kota TEXT NOT NULL`
- `kontak TEXT NOT NULL`
- `pesan TEXT NOT NULL`
- `source_kontak TEXT NOT NULL DEFAULT 'web'`
- `user_agent TEXT`
- `ip_address TEXT`
- `created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`

## Cloudflare D1 Setup

Create database:

```bash
wrangler d1 create db_kontak
```

Copy the generated `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB_KONTAK"
database_name = "db_kontak"
database_id = "<replace-with-your-d1-database-id>"
```

Apply schema:

```bash
wrangler d1 execute db_kontak --file=./db/schema.sql
```

Local dev:

```bash
wrangler pages dev . --d1 DB_KONTAK=db_kontak
```

Deploy:

```bash
wrangler pages deploy .
```

## Example Curl Test

```bash
curl -X POST http://localhost:8788/classmate/v1/kontak/submit \
  -H "Content-Type: application/json" \
  -d '{"nama":"Budi","kota":"BSD","kontak":"628123456789","pesan":"Saya mau tanya event anak"}'
```

## Deploy ke Cloudflare Pages

Via Wrangler:

```bash
wrangler pages deploy .
```

Via dashboard:

1. Masuk ke Cloudflare Dashboard.
2. Buka **Workers & Pages**.
3. Pilih **Create application** lalu **Pages**.
4. Hubungkan repository Git.
5. Build command: kosongkan.
6. Build output directory: `/` atau root project.
7. Pastikan D1 binding `DB_KONTAK` terhubung ke database `db_kontak`.
8. Deploy.

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

Untuk mengganti logo, replace file `assets/classmate-logo.png` dengan logo resmi Classmate. Rekomendasi ukuran minimal 512 x 512 px, format PNG, background transparan atau solid yang tetap jelas di atas background putih.

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
- `index.html`, pada link yang memakai `https://wa.me/628xxxxx`.

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

- Puter.js chatbot tetap frontend-only.
- Tidak membutuhkan API key dari project ini.
- Tidak memakai D1 untuk menyimpan chat.
- Riwayat chat hanya disimpan sementara di memory browser selama halaman masih terbuka.
- Jika Puter AI gagal dimuat atau tidak tersedia, chatbot menampilkan pesan fallback dan mengarahkan user untuk menghubungi admin WhatsApp.
- Jika Puter membutuhkan autentikasi user atau respons AI terlalu lama, chat akan timeout dan menampilkan fallback agar UI tidak macet.

## Notes

- Contact data disimpan di Cloudflare D1.
- `source_kontak` selalu bernilai `web`.
- WhatsApp CTA tetap tersedia setelah submit kontak sukses.
- Frontend tetap statis dan Cloudflare Pages compatible.
