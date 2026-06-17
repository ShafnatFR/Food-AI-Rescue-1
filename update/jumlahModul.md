1. Modul Pemasaran & Publik: menangani antarmuka awal dan etalase informasi aplikasi sebelum pengguna masuk:
a. LandingPage.tsx: Halaman beranda interaktif dengan animasi roadmap dan efek kursor.

2. Modul Autentikasi & Manajemen Akun: menangani proses masuk, pendaftaran, serta pengaturan profil pengguna:
a. Login.tsx, Register.tsx: Form login dan registrasi peran akun (Donatur, Penerima, Relawan).
b. ForgotPassword.tsx: Antarmuka pemulihan kata sandi pengguna.
c. index.tsx, ProfileHeader.tsx: Dashboard profil dan ringkasan gamifikasi level.
d. AIApiManagement.tsx: Manajemen input Gemini API Key pribadi untuk membuka fitur AI lanjutan.
e. EditProfile.tsx, SecuritySettings.tsx: Form pembaruan biodata dan keamanan akun.
f. AddressList.tsx: Pengaturan titik koordinat alamat logistik.
g. ClaimHistory.tsx, ClaimHistoryDetail.tsx: Riwayat klaim donasi makanan yang telah dilakukan pengguna.
h. PointHistory.tsx, GamificationSummary.tsx: Catatan riwayat poin dan pencapaian gamifikasi pengguna.
i. FaqSection.tsx, SavedItems.tsx: Pusat bantuan in-app dan daftar donasi yang disimpan.

3. Modul Manajemen Donasi & Gudang Makanan (Provider): digunakan oleh donatur untuk mengelola stok, donasi, dan riwayat pesanan:
a. index.tsx: Dashboard utama logistik donatur.
b. Inventory.tsx, InventoryNavigation.tsx: Menampilkan daftar makanan yang sedang tayang di platform.
c. QualityCheckInventoryInput.tsx: Form unggah donasi pangan dengan fitur Live Camera.
d. QualityCheckInventory.tsx: Memproses audit kelayakan donasi makanan menggunakan AI Gemini.
e. CorporateAIWidgets.tsx: Widget AI khusus (Kreator Resep, CSR Writer) untuk donatur korporat.
f. ImpactWidget.tsx, QuickActions.tsx, StatsGrid.tsx, RankCard.tsx: Kumpulan widget statistik pada dashboard donatur.
g. StockManager.tsx, StockFilters.tsx, ProductDetailModal.tsx: Manajemen daftar stok, filter, dan detail donasi.
h. OrderList/index.tsx, OrderItemCard.tsx: Daftar pesanan atau klaim masuk dari penerima.
i. OrderDetail/index.tsx, CourierInfo.tsx, ReceiverInfo.tsx, TimelineDetails.tsx: Detail proses logistik dan status pengiriman pesanan donasi.
j. HistoryList/index.tsx, HistoryItemCard.tsx, HistoryDetail/index.tsx, Timeline.tsx: Daftar dan detail riwayat donasi yang telah selesai (riwayat logistik).
k. Reports/index.tsx, ReportDetailModal.tsx: Manajemen laporan dan komplain dari pengguna terkait donasi.
l. Reviews/index.tsx, ReviewItemCard.tsx: Menampilkan ulasan dan rating dari penerima donasi.

4. Modul Radar Penerima (Receiver): menangani eksplorasi donasi makanan terdekat dan pusat permintaan bagi penerima:
a. index.tsx: Dashboard eksplorasi utama bagi panti asuhan atau individu penerima manfaat.
b. FoodList.tsx, FoodDetail.tsx: Menampilkan katalog visual donasi terdekat beserta jarak radius dan detailnya.
c. AIVerificationCard.tsx: Komponen stempel hijau jaminan mutu bahwa donasi telah diaudit oleh AI.
d. StoreIcon.tsx: Representasi visual ikon toko atau titik donatur di peta.
e. RequestManager.tsx: Fasilitas bagi penerima untuk mempublikasikan permintaan donasi spesifik ke publik donatur.

5. Modul Operasional Kurir & Gamifikasi (Volunteer): digunakan oleh relawan untuk mengambil misi penjemputan dan melacak metrik operasional:
a. index.tsx, StatsDashboard.tsx: Dashboard relawan yang memuat statistik harian (jarak tempuh dan poin).
b. MissionList.tsx: Menampilkan daftar antrean misi penjemputan donasi yang tersedia untuk diambil.
c. MissionDetail.tsx: Detail eksekusi misi yang mencakup manifest muatan, peta rute Google Maps 3-titik, fitur chat WA instan, dan QR Code Pickup.
d. HistoryList.tsx: Log riwayat misi logistik pengantaran yang pernah diselesaikan.
e. Leaderboard.tsx: Papan klasemen persaingan poin antar relawan.

6. Modul Konfigurasi & Intervensi Pusat (Admin): memiliki akses untuk mengelola gamifikasi, konten, logistik global, dan moderasi pengguna:
a. index.tsx, Overview.tsx: Dashboard utama pengawas super-admin.
b. SystemConfig.tsx, LogViewer.tsx: Pengaturan variabel sistem dan pemantauan aliran log teknis.
c. AdminList.tsx, Impact.tsx: Manajemen data pengguna admin dan kalkulasi SROI (Social Return on Investment).
d. RanksManagement.tsx: Mengelola level dan poin gamifikasi dengan antarmuka drag-and-drop.
e. Distribution.tsx, Moderation.tsx: Pelacakan riwayat distribusi logistik lintas pengguna dan pemrosesan sengketa/komplain.
f. ContentCMS.tsx: Sistem manajemen konten FAQ dan SOP menggunakan editor markdown.
g. Communication/index.tsx, BroadcastHistory.tsx, ComposeMessage.tsx: Mengelola pengiriman siaran pesan massal dari admin ke perangkat pengguna.
h. Community/index.tsx, UserList.tsx, VerificationModal.tsx: Manajemen daftar pengguna dan verifikasi keabsahan institusi yayasan/restoran.
i. Community/BadgeCatalog.tsx, BadgeModal.tsx: Mengelola pembuatan katalog medali/badge pencapaian untuk pengguna.

7. Modul Penunjang Bersama (Shared Components): berisi elemen antarmuka, utilitas AI, dan pop-up yang dipakai lintas modul di atas:
a. DesktopLayout.tsx, Sidebar.tsx, TopAppBar.tsx: Kerangka dan kerangka struktur navigasi utama aplikasi.
b. CSRWriterEditor.tsx, EcoPackagingEditor.tsx: Antarmuka editor cerdas bantuan AI.
c. KitchenScanner.tsx: Modul integrasi pemindai kamera untuk kelayakan fasilitas dapur.
d. AddressWarningModal.tsx, VerificationPendingModal.tsx, SuccessClaimSplash.tsx: Kumpulan modal peringatan dan notifikasi splash (pop-up sistem).
e. Button.tsx, Input.tsx, CounterUp.tsx: Blok pembangun dasar UI sistem (komponen form, tombol, dan animasi numerik).