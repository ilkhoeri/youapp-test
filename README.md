<p align="center">
  <img width="200" height="200" alt="Logo" src="/public/icons/android-chrome-512x512.png" />
  <strong>✕</strong>
  <a href="https://github.com/ilkhoeri/oeri" target="_blank"><img width="200" height="200" alt="oeri" src="https://raw.githubusercontent.com/ioeridev/assets/refs/heads/public/brand/oeri-asset.png" /></a>
</p>

<div align="center"><strong>YouApp Test Result</strong></div>
<div align="center">Built with the React 19 and Next.js 15 (App Router)</div>
<div align="center"><strong>Build by <a href="https://github.com/ilkhoeri">OERI (ILKHOERI)</a></strong></div>

<br />
<br />

## Overview

Pada aplikasi ini saya menggunakan beberapa tools untuk membantu pengembangan aplikasi seperti yang disajikan didalam tabel dibawah ini.

Ini adalah permulaan beberapa tumpukan mendasar yang digunakan sebagai berikut:

| Stack             | Requirements                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| App Library       | [React 19](https://react.dev/)                                                                                       |
| Framework         | [Next.js (App Router)](https://nextjs.org)                                                                           |
| Language          | [TypeScript](https://www.typescriptlang.org)                                                                         |
| Auth              | [Auth.js](https://authjs.dev/?_gl=1*2exugf*_gcl_au*OTIxMjU2MTc0LjE3MzA3NzM1ODE.)                                     |
| Database          | [MongoDB](https://cloud.mongodb.com/)                                                                                |
| Media Cloud-based | [Cloudinary](https://next.cloudinary.dev/)                                                                           |
| Data Model        | [Prisma ORM](https://www.prisma.io/docs/getting-started)                                                             |
| Schema Validation | [Zod](https://zod-docs.vercel.app/)                                                                                  |
| HTTP client       | [Axios](https://axios-http.com/docs/intro)                                                                           |
| Deployment        | [Vercel](https://vercel.com/docs/concepts/next.js/overview)                                                          |
| PWA Installer     | [Next PWA](https://www.npmjs.com/package/next-pwa)                                                                   |
| Styling           | [Tailwind CSS](https://tailwindcss.com)                                                                              |
| CSS Transformer   | [Postcss](https://postcss.org/)                                                                                      |
| Themes            | [Next Themes](https://www.npmjs.com/package/next-themes)                                                             |
| UX                | [You App Team](https://www.figma.com/design/VnqmoYfwdTzN8qvvDZn6GC/YouApp-Test?node-id=0-1&p=f&t=j7U3B0NSt4GGE1TV-0) |
| Components        | [Oeri UI](https://oeri.vercel.app/)                                                                                  |
| Toaster           | [Sonner](https://sonner.emilkowal.ski/)                                                                              |
| Icons             | [svg module](https://oeri.vercel.app/docs/web/components/svg)                                                        |
| Form Handling     | [React Hook Form](https://react-hook-form.com/get-started#TypeScript)                                                |
| Formatting        | [Prettier](https://prettier.io)                                                                                      |

---

## Improvement

Saya sangat menghargai apa yang disediakan dan guidelines dari Team Recrutment YouApp. Namun agar aplikasi berjalan sesuai harapan saya harus melakukan improvisasi pada beberapa bagian. Bagian berikut akan menjelaskan beberapa improvisasi yang saya lakukan.

### Database Integration

Mengingat kasus bahwa laman database dan API data yang disediakan oleh team rekruter seringkali tidak dapat diakses, disini saya harus mengintegrasikan database aplikasi menggunakan database yang saya kelola sendiri namun dengan tetap mematuhi setiap field yang dibutuhkan. Beberapa improvisasinya sebagai berikut:

- DataBase Model:
  - Saya menyusun model database berdasarkan struktur PostgreSQL dan masing-masing relational data di-manage menggunakan Prisma ORM, ini akan memudahkan pengembangan yang berkelanjutan dengan setiap fungsi yang disediakan.
- Validasi Schema:
  - Menggunakan tools `Zod`, untuk membuat setiap field dari masing-masing form agar sesuai dengan model data yang dibutuhkan.

### UX UI

Aplikasi dibangun berdasarkan UX yang disediakan oleh Team Rektuter meski tidak dapat sepenuhnya 100% sama. Hal tersebut didasarkan pada beberapa kondisi, seperti dimana aplikasi berjalan, bagaimana behavior library app & framework, behavior user, dan sebagainya. Berikut beberapa contoh kasusnya:

- Kasus Authentication:
  - Halaman [`/auth/sign-up`](/auth/sign-up):
    - Menambahkan state/pemberitahuan untuk user ketika Username/Email telah digunakan, selain itu terdapat pemberitahuan ketika user membuat password yang tidak sesuai ketentuan.
  - Halaman [`/auth/sign-in`](/auth/sign-in):
    - Menambahkan pemberitahuan saat Username/Email tidak terdaftar
    - Menambahkan komponen `Reset Password` untuk kasus ketika user lupa dengan password mereka (belum dapat digunakan sepenuhnya karena subscripe pada layanan). Selain itu ada beberapa improfisasi yang saya lakukan pada beberapa komponen untuk memberikan user experience yang lebih baik seperti `underline`.
- Halaman tambahan pada rute `/auth` meliputi:
  - [`/auth/error`](/auth/error): Ketika user login menggunakan token namun token tersebut keliru/kadaluwasa ataupun ketika user login menggunakan `provider` seperti `github` / `google` namun terjadi kesalahan.
  - [`/auth/invitation`](/auth/invitation): Ketika user mendaftar menggunakan token invitation, ini akan sangat berguna ketika user baru adalah Admin/Superadmin.
  - [`/auth/verification`](/auth/verification): Ketika user ingin mereset password menggunakan token

### Support Mobile Device Behavior

Biasanya ketika user membuka sebuah popover ataupun modal/dialog dan user melakukan aksi kembali pada mobile device mereka maka rute/halaman web akan kembali ke halaman sebelumnya. Hal ini dapat teratasi dengan baik pada component popover dan modal/dialog didalam aplikasi, sehingga ketika user melakukan aksi kembali maka popover atau modal/dialog aplikasi akan tetap pada halaman yang sama. Perilaku tersebut dibuat menggunakan `history.pushState()`.

- Penjelasan singkat:
  - pushState() digunakan untuk menambahkan entri baru ke riwayat browser, biasanya saat membuka modal/popover.
  - window.history.back() akan kembali ke entri sebelumnya, biasanya saat menutup modal (mimicking Android back behavior).

## Getting Started

Situs web ini menggunakan React.js (v19) serta framework Next.js terbaru (App Router). Ini mencakup dukungan untuk tata letak yang disempurnakan, kolokasi komponen, pengujian, dan gaya, pengambilan data tingkat komponen, dan banyak lagi.

Selanjutnya, perbarui nilai file `.env`. Ikuti petunjuk dalam file `.env.example` untuk menyiapkan aplikasi GitHub OAuth, Cloudinary API, dan lainnya.

During the deployment, Vercel will prompt you to create a new Postgres database. This will add the necessary environment variables to your project.

Create a table based on the schema defined in schema.prisma.

```bash
bun install
```

Untuk melihat konfigurasi database, gunakan command:

```bash
npx prisma studio
```

Finally, run the following commands to start the development server:

```bash
bun dev
```

You should now be able to access the application at http://localhost:3000.
