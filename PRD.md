**PRODUCT REQUIREMENTS DOCUMENT**

**Platform Pembiayaan UMKM Syariah**

Berbasis AI (XGBoost) & Blockchain Smart Contract

_Format: Given / And / When / Then_

Versi 1.0 • 2025

# **Tentang Dokumen Ini**

Dokumen PRD ini mendeskripsikan kebutuhan fungsional platform pembiayaan syariah untuk UMKM dalam format Given/When/Then (Behavior-Driven Development). Platform ini memiliki tiga peran utama:

| **Role**        | **Deskripsi**                                              |
| --------------- | ---------------------------------------------------------- |
| **🔐 Admin**    | Validator, controller, auditor, dan monitor seluruh sistem |
| **💰 Investor** | Sumber dana yang mencari UMKM layak untuk diinvestasikan   |
| **🏢 UMKM**     | Pelaku usaha yang mencari modal dan mengelola pendanaan    |

**🔐 Admin Dashboard**

_Fitur-fitur panel admin untuk monitoring, validasi, dan kontrol sistem_

📌 **Dashboard Admin - Statistik Sistem**

**👤 Admin**

| **Given** admin sudah login ke sistem dan berada di halaman Dashboard                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** data UMKM, investor, dan transaksi tersedia di database                                                                                                                                     |
| **When** admin mengakses halaman Dashboard                                                                                                                                                          |
| **Then** admin dapat melihat total UMKM, investor, transaksi, dana terhimpun & tersalurkan, grafik performa harian/bulanan, status akad aktif, dan notifikasi sistem (fraud alert, gagal transaksi) |

📌 **Manajemen User - Verifikasi KYC**

**👤 Admin**

| **Given** admin berada di halaman Manajemen User                                                           |
| ---------------------------------------------------------------------------------------------------------- |
| **And** terdapat user baru (UMKM / investor) yang menunggu verifikasi                                      |
| **When** admin membuka detail user dan menekan tombol Approve atau Reject                                  |
| **Then** status akun user diperbarui sesuai keputusan admin, dan user menerima notifikasi hasil verifikasi |

📌 **Manajemen User - Suspend / Ban Akun**

**👤 Admin**

| **Given** admin berada di halaman detail user                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------- |
| **And** user telah terverifikasi dan aktif di sistem                                                                         |
| **When** admin menekan tombol Suspend atau Ban disertai alasan                                                               |
| **Then** akun user dinonaktifkan sesuai tindakan yang dipilih, aktivitas user dicatat di riwayat, dan user tidak dapat login |

📌 **Manajemen UMKM - Review & Approval Kelayakan**

**👤 Admin**

| **Given** admin berada di halaman Manajemen UMKM                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** UMKM telah mengajukan pendanaan dan hasil skor AI tersedia                                                                                              |
| **When** admin membuka detail UMKM, melihat skor XGBoost dan kategori risiko (Low/Medium/High), lalu menekan Approve atau Reject                                |
| **Then** status kelayakan UMKM diperbarui, UMKM yang di-approve tampil di marketplace investor, UMKM yang di-reject menerima notifikasi dengan alasan penolakan |

📌 **Manajemen AI - Monitoring Credit Scoring**

**👤 Admin**

| **Given** admin berada di halaman Manajemen AI                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------- |
| **And** model XGBoost aktif dan telah menghasilkan prediksi                                                                        |
| **When** admin melihat daftar skor kredit UMKM dan menekan Trigger Scoring Ulang pada UMKM tertentu                                |
| **Then** sistem menjalankan ulang model scoring untuk UMKM tersebut, hasil prediksi terbaru tersimpan, dan log prediksi diperbarui |

📌 **Manajemen Blockchain - Monitoring Transaksi**

**👤 Admin**

| **Given** admin berada di halaman Manajemen Blockchain                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** transaksi akad telah direkam di blockchain                                                                                           |
| **When** admin memilih transaksi dari daftar histori                                                                                         |
| **Then** admin dapat melihat detail transaksi (hash, timestamp, status), histori akad yang immutable, dan melakukan validasi transaksi gagal |

📌 **Manajemen Akad - Approval Akad Syariah**

**👤 Admin**

| **Given** admin berada di halaman Manajemen Akad                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** UMKM dan investor telah menyetujui term akad                                                                                                          |
| **When** admin menekan Approve Akad                                                                                                                           |
| **Then** smart contract di-deploy otomatis di blockchain, detail bagi hasil tersimpan, status akad berubah menjadi aktif, dan kedua pihak menerima notifikasi |

📌 **Manajemen Transaksi - Flag Transaksi Mencurigakan**

**👤 Admin**

| **Given** admin berada di halaman Manajemen Transaksi                                                                       |
| --------------------------------------------------------------------------------------------------------------------------- |
| **And** sistem fraud detection mendeteksi anomali pada transaksi                                                            |
| **When** admin membuka detail transaksi yang di-flag dan menekan Konfirmasi Fraud atau Abaikan                              |
| **Then** jika dikonfirmasi fraud, transaksi diblokir dan akun terkait di-flag; jika diabaikan, transaksi dilanjutkan normal |

📌 **Fraud Detection - Alert Otomatis**

**👤 Admin**

| **Given** sistem sedang berjalan normal                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** modul fraud detection aktif                                                                                                                       |
| **When** sistem mendeteksi aktivitas mencurigakan (moral hazard, anomali laporan)                                                                         |
| **Then** notifikasi alert otomatis muncul di dashboard admin, aktivitas dicatat di log audit, dan admin dapat mengambil tindakan langsung dari notifikasi |

📌 **Reporting & Analytics - Export Laporan**

**👤 Admin**

| **Given** admin berada di halaman Reporting & Analytics                                                  |
| -------------------------------------------------------------------------------------------------------- |
| **And** data performa UMKM dan ROI investor tersedia                                                     |
| **When** admin memilih rentang waktu dan menekan Export (PDF atau Excel)                                 |
| **Then** sistem menghasilkan file laporan sesuai format yang dipilih dan mengunduhnya ke perangkat admin |

📌 **System Configuration - Setting Nisbah & Threshold**

**👤 Admin**

| **Given** admin berada di halaman System Configuration                                                |
| ----------------------------------------------------------------------------------------------------- |
| **And** admin memiliki role Super Admin                                                               |
| **When** admin mengubah nilai nisbah bagi hasil, fee platform, atau threshold AI, lalu menekan Simpan |
| **Then** konfigurasi baru tersimpan dan langsung berlaku untuk transaksi dan proses AI berikutnya     |

📌 **Notification System - Broadcast ke User**

**👤 Admin**

| **Given** admin berada di halaman Notification System                                                     |
| --------------------------------------------------------------------------------------------------------- |
| **When** admin menulis pesan broadcast, memilih target (semua user / UMKM / investor), lalu menekan Kirim |
| **Then** notifikasi terkirim ke seluruh target yang dipilih dan tampil di aplikasi masing-masing user     |

**💰 Investor Dashboard**

_Fitur-fitur untuk investor dalam mengelola dan memonitor investasi syariah_

📌 **Sign In dengan OTP**

**💰 Investor**

| **Given** user berada di halaman Sign In                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------- |
| **And** user adalah existing user yang sudah terdaftar                                                                                  |
| **When** user menginput nomor HP dan menekan Verifikasi                                                                                 |
| **Then** user diarahkan ke halaman verifikasi OTP, OTP dikirim ke nomor HP user, dan setelah OTP valid user masuk ke Dashboard Investor |

📌 **Dashboard Investor - Ringkasan Portofolio**

**💰 Investor**

| **Given** investor sudah login dan berada di halaman Dashboard                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **And** investor memiliki setidaknya satu investasi aktif                                                                                                          |
| **When** investor mengakses halaman Dashboard                                                                                                                      |
| **Then** investor dapat melihat total dana diinvestasikan, total keuntungan profit sharing, jumlah UMKM didanai, grafik performa investasi, dan notifikasi penting |

📌 **Explore Marketplace - Filter & Sorting UMKM**

**💰 Investor**

| **Given** investor berada di halaman Explore / Marketplace                                                                |
| ------------------------------------------------------------------------------------------------------------------------- |
| **And** terdapat UMKM yang open funding dan telah di-approve admin                                                        |
| **When** investor menggunakan filter (kategori, lokasi, risiko, estimasi ROI) atau sorting (terpopuler, return tertinggi) |
| **Then** daftar UMKM diperbarui sesuai kriteria filter/sorting yang dipilih secara real-time                              |

📌 **Detail UMKM - Keputusan Investasi**

**💰 Investor**

| **Given** investor berada di halaman Explore                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **And** UMKM sudah tampil di marketplace                                                                                                               |
| **When** investor menekan salah satu UMKM                                                                                                              |
| **Then** investor dapat melihat profil usaha, kebutuhan dana, durasi investasi, estimasi bagi hasil, skor AI XGBoost, dan data performa transaksi UMKM |

📌 **AI Smart Recommendation**

**💰 Investor**

| **Given** investor berada di halaman Insight AI                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** profil investor sudah terisi dan model AI aktif                                                                                                                                   |
| **When** investor membuka halaman rekomendasi                                                                                                                                             |
| **Then** sistem menampilkan daftar UMKM yang direkomendasikan berdasarkan profil investor, lengkap dengan label (Recommended / High Risk / Stable Growth) dan prediksi potensi keuntungan |

📌 **Proses Investasi - Pilih Akad & Konfirmasi**

**💰 Investor**

| **Given** investor berada di halaman Detail UMKM                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** saldo wallet investor mencukupi                                                                                                                    |
| **When** investor menginput jumlah investasi, memilih jenis akad (Musyarakah / Murabahah), melihat simulasi profit, lalu menekan Konfirmasi Investasi      |
| **Then** investasi tercatat di sistem, smart contract dibuat di blockchain, saldo wallet investor berkurang, dan notifikasi konfirmasi dikirim ke investor |

📌 **Akad Digital - Tanda Tangan & Blockchain**

**💰 Investor**

| **Given** investor telah mengkonfirmasi investasi                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ |
| **And** smart contract siap di-deploy                                                                                                |
| **When** investor menekan Tanda Tangan Digital pada halaman Akad                                                                     |
| **Then** akad tersimpan di blockchain (immutable), hash transaksi ditampilkan kepada investor, dan status akad berubah menjadi aktif |

📌 **Portfolio Management - Lihat Status Investasi**

**💰 Investor**

| **Given** investor berada di halaman Portfolio                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------- |
| **And** investor memiliki minimal satu investasi                                                                              |
| **When** investor membuka halaman Portfolio                                                                                   |
| **Then** investor dapat melihat semua investasi (Ongoing / Completed / Failed), detail tiap investasi, dan total ROI per UMKM |

📌 **Monitoring - Perkembangan UMKM**

**💰 Investor**

| **Given** investor berada di halaman Monitoring                                                  |
| ------------------------------------------------------------------------------------------------ |
| **And** UMKM rutin mengupdate data usaha                                                         |
| **When** investor membuka halaman monitoring salah satu UMKM yang didanai                        |
| **Then** investor dapat melihat grafik omzet UMKM, progress target, dan update terbaru dari UMKM |

📌 **Profit Sharing - Riwayat Bagi Hasil**

**💰 Investor**

| **Given** investor berada di halaman Profit Sharing                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- |
| **And** akad aktif dan periode bagi hasil telah jatuh tempo                                                                         |
| **When** investor membuka halaman Profit Sharing                                                                                    |
| **Then** investor dapat melihat riwayat bagi hasil, detail per transaksi, jadwal pembayaran berikutnya, dan status (paid / pending) |

📌 **Risk & Alert - Peringatan Performa UMKM**

**💰 Investor**

| **Given** investor memiliki investasi aktif                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- |
| **And** sistem mendeteksi penurunan performa UMKM                                                                                   |
| **When** sistem fraud/risk detection memicu alert                                                                                   |
| **Then** notifikasi warning tampil di dashboard investor, risk level UMKM diperbarui, dan investor dapat mengambil keputusan lanjut |

📌 **Riwayat Transaksi - Export Data**

**💰 Investor**

| **Given** investor berada di halaman Riwayat Transaksi                                  |
| --------------------------------------------------------------------------------------- |
| **And** terdapat data transaksi dan profit yang sudah terjadi                           |
| **When** investor memilih periode dan menekan Export                                    |
| **Then** investor dapat mengunduh laporan transaksi lengkap dalam format PDF atau Excel |

📌 **Profile & Wallet - Deposit / Withdraw**

**💰 Investor**

| **Given** investor berada di halaman Profile & Wallet                                                                 |
| --------------------------------------------------------------------------------------------------------------------- |
| **And** akun investor sudah terverifikasi KYC                                                                         |
| **When** investor memilih Deposit atau Withdraw, menginput nominal, lalu mengkonfirmasi                               |
| **Then** saldo wallet investor diperbarui sesuai transaksi, riwayat saldo tercatat, dan notifikasi konfirmasi dikirim |

**🏢 UMKM Dashboard**

_Fitur-fitur untuk UMKM dalam mengelola usaha, pendanaan, dan bagi hasil_

📌 **Registrasi & Profile Setup**

**🏢 UMKM**

| **Given** calon UMKM berada di halaman Registrasi                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- |
| **When** UMKM mengisi data profil usaha (nama, kategori, lokasi), mengupload dokumen (KTP, dokumen usaha), dan menekan Daftar |
| **Then** akun UMKM dibuat dengan status Pending Verifikasi, dokumen terkirim ke admin untuk review KYC                        |

📌 **Input Data Usaha - Manual & Integrasi API**

**🏢 UMKM**

| **Given** UMKM sudah login dan berada di halaman Input Data Usaha                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------- |
| **And** akun UMKM sudah terverifikasi oleh admin                                                                                  |
| **When** UMKM menginput omzet harian, pengeluaran, atau menghubungkan API e-commerce / POS kasir digital                          |
| **Then** data usaha tersimpan di sistem, data digunakan sebagai input untuk model AI XGBoost, dan dashboard data usaha diperbarui |

📌 **Credit Scoring - Lihat Hasil AI**

**🏢 UMKM**

| **Given** UMKM berada di halaman Credit Scoring                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **And** UMKM sudah menginput data usaha dan AI telah memproses scoring                                                                                 |
| **When** UMKM membuka halaman Credit Scoring                                                                                                           |
| **Then** UMKM dapat melihat skor kredit (0-100), kategori risiko (Low/Medium/High), insight kenapa skor tinggi/rendah, dan rekomendasi perbaikan usaha |

📌 **Pengajuan Pendanaan**

**🏢 UMKM**

| **Given** UMKM berada di halaman Pengajuan Pendanaan                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** skor kredit UMKM sudah tersedia dan memenuhi threshold minimum                                                                                         |
| **When** UMKM menginput kebutuhan dana, memilih jenis akad (Musyarakah / Murabahah), menentukan durasi, mengisi deskripsi penggunaan dana, lalu menekan Submit |
| **Then** pengajuan dikirim ke admin untuk di-review, status pengajuan berubah menjadi Pending, dan UMKM menerima notifikasi bahwa pengajuan sedang diproses    |

📌 **Campaign / Listing di Marketplace**

**🏢 UMKM**

| **Given** admin telah menyetujui pengajuan pendanaan UMKM                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **When** UMKM membuka halaman Campaign mereka                                                                                                        |
| **Then** halaman publik usaha tampil di marketplace investor, menampilkan story bisnis, target funding, progress dana terkumpul, dan jumlah investor |

📌 **Manajemen Akad - Tanda Tangan Smart Contract**

**🏢 UMKM**

| **Given** investor telah mengkonfirmasi investasi kepada UMKM                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- |
| **And** akad siap untuk ditandatangani                                                                                                    |
| **When** UMKM menekan Tanda Tangan Digital pada halaman Manajemen Akad                                                                    |
| **Then** akad tersimpan di blockchain (immutable), UMKM dan investor mendapatkan hash transaksi, dan status kontrak berubah menjadi aktif |

📌 **Monitoring Usaha - Update Omzet Berkala**

**🏢 UMKM**

| **Given** UMKM berada di halaman Monitoring Usaha                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **And** akad aktif berjalan dan UMKM berkewajiban melaporkan perkembangan                                                                              |
| **When** UMKM menginput update omzet terbaru dan laporan penggunaan dana                                                                               |
| **Then** data tersimpan, grafik performa usaha diperbarui, investor dapat melihat perkembangan terbaru, dan sistem risk management memproses data baru |

📌 **Bagi Hasil - Konfirmasi Pembayaran**

**🏢 UMKM**

| **Given** UMKM berada di halaman Bagi Hasil                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **And** periode bagi hasil sudah jatuh tempo dan smart contract telah menghitung jumlah bagi hasil                                                                            |
| **When** UMKM menekan Konfirmasi Pembayaran                                                                                                                                   |
| **Then** bagi hasil dikirim ke wallet investor sesuai perhitungan smart contract, status pembayaran berubah menjadi Paid, dan riwayat bagi hasil diperbarui untuk kedua pihak |

📌 **Risk & Warning - Alert Performa Turun**

**🏢 UMKM**

| **Given** UMKM memiliki akad aktif                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ |
| **And** sistem mendeteksi inkonsistensi atau penurunan data usaha                                                                          |
| **When** sistem risk management memicu peringatan                                                                                          |
| **Then** notifikasi warning tampil di dashboard UMKM, rekomendasi perbaikan ditampilkan, dan admin juga menerima alert untuk tindak lanjut |

📌 **Riwayat Transaksi - Export Laporan**

**🏢 UMKM**

| **Given** UMKM berada di halaman Riwayat Transaksi                                                                         |
| -------------------------------------------------------------------------------------------------------------------------- |
| **And** terdapat riwayat dana masuk dan pembayaran bagi hasil                                                              |
| **When** UMKM memilih periode dan menekan Export                                                                           |
| **Then** UMKM dapat mengunduh laporan transaksi lengkap (dana masuk, bagi hasil, histori akad) dalam format PDF atau Excel |

📌 **Wallet - Withdraw Dana**

**🏢 UMKM**

| **Given** UMKM berada di halaman Wallet                                                         |
| ----------------------------------------------------------------------------------------------- |
| **And** saldo tersedia di wallet UMKM mencukupi                                                 |
| **When** UMKM menginput nominal withdraw dan mengkonfirmasi                                     |
| **Then** dana ditransfer ke rekening UMKM, saldo wallet berkurang, dan riwayat saldo diperbarui |

# **Ringkasan Fitur per Role**

| **Role**        | **Fitur**                                                                                                                                   | **Jumlah**   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **🔐 Admin**    | Dashboard, KYC, UMKM Approval, AI, Blockchain, Akad, Transaksi, Fraud, Reporting, Config, Notifikasi                                        | **12 fitur** |
| **💰 Investor** | OTP Login, Dashboard, Explore, Detail UMKM, AI Insight, Investasi, Akad, Portfolio, Monitoring, Profit Sharing, Risk Alert, Riwayat, Wallet | **13 fitur** |
| **🏢 UMKM**     | Registrasi, Input Data, AI Scoring, Pengajuan Dana, Campaign, Akad, Monitoring, Bagi Hasil, Risk Alert, Riwayat, Wallet                     | **11 fitur** |
| **TOTAL**       |                                                                                                                                             | **36 fitur** |

_PRD - Platform Pembiayaan UMKM Syariah • Versi 1.0_
