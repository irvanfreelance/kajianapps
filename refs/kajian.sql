-- ====================================================================================
-- DROP TABLES (Membersihkan tabel dan relasi jika sudah ada sebelumnya agar tidak konflik)
-- ====================================================================================
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS payment_logs CASCADE;
DROP TABLE IF EXISTS payment_instructions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS kajian_registrations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS kajian CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ====================================================================================
-- 1. TABLE: USERS (Data Jamaah)
-- ====================================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    job VARCHAR(20),
    year_born VARCHAR(20),
    joined_date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ====================================================================================
-- 2. TABLE: ADMINS (Data Pengelola / Admin Panel)
-- ====================================================================================
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'SUPERADMIN',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email ON admins(email);

-- ====================================================================================
-- 3. TABLE: KAJIAN (Jadwal Kajian)
-- ====================================================================================
CREATE TABLE kajian (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    ustadz VARCHAR(100) NOT NULL,
    date_display VARCHAR(50) NOT NULL,
    time_display VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL, -- ex: 'free', 'paid'
    price INT DEFAULT 0,
    spot INT DEFAULT 0,
    filled INT DEFAULT 0,
    image TEXT,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    url_zoom VARCHAR(255),
    url_youtube VARCHAR(255),
    slug VARCHAR(200) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kajian_category ON kajian(category);

-- ====================================================================================
-- 4. TABLE: PRODUCTS (Katalog Produk Toko Islami)
-- ====================================================================================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price INT NOT NULL,
    old_price INT,
    stock INT DEFAULT 0,
    image TEXT,
    category VARCHAR(50) NOT NULL,
    rating NUMERIC(3,1) DEFAULT 0.0,
    sold INT DEFAULT 0,
    description TEXT,
    slug VARCHAR(200) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);

-- ====================================================================================
-- 5. TABLE: KAJIAN_REGISTRATIONS (Tiket Saya / User Kajian)
-- ====================================================================================
CREATE TABLE kajian_registrations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kajian_id BIGINT NOT NULL REFERENCES kajian(id) ON DELETE CASCADE,
    paid_amount INT DEFAULT 0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kajian_regs_user_id ON kajian_registrations(user_id);
CREATE INDEX idx_kajian_regs_kajian_id ON kajian_registrations(kajian_id);

-- ====================================================================================
-- 6. TABLE: ORDERS (Pesanan Masuk)
-- ====================================================================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_date VARCHAR(50) NOT NULL,
    total INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- ex: 'pending', 'packed', 'shipped', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(order_code);

-- ====================================================================================
-- 7. TABLE: ORDER_ITEMS (Detail Barang yang dibeli)
-- ====================================================================================
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    qty INT NOT NULL,
    price INT NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ====================================================================================
-- 8. TABLE: PAYMENT_METHODS (Metode Pembayaran)
-- ====================================================================================
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    admin_fee_flat BIGINT DEFAULT 0,
    admin_fee_pct NUMERIC(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    is_redirect BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0
);

-- ====================================================================================
-- 9. TABLE: PAYMENT_INSTRUCTIONS (Instruksi Pembayaran)
-- ====================================================================================
CREATE TABLE payment_instructions (
    id BIGSERIAL PRIMARY KEY,
    payment_method_id BIGINT NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_instructions_method_id ON payment_instructions(payment_method_id);

-- ====================================================================================
-- 10. TABLE: PAYMENT_LOGS (Log Transaksi Pembayaran)
-- ====================================================================================
CREATE TABLE payment_logs (
    id BIGSERIAL PRIMARY KEY,
    invoice_code VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    type VARCHAR(50),
    request_payload TEXT,
    response_payload TEXT,
    http_status INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_logs_invoice ON payment_logs(invoice_code);

-- ====================================================================================
-- 11. TABLE: NOTIFICATION_TEMPLATES (Template Notifikasi WA/Email)
-- ====================================================================================
CREATE TABLE notification_templates (
    id BIGSERIAL PRIMARY KEY,
    event_trigger VARCHAR(50) UNIQUE NOT NULL,
    channel VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- ====================================================================================
-- 12. TABLE: NOTIFICATION_LOGS (Log Pengiriman Notifikasi)
-- ====================================================================================
CREATE TABLE notification_logs (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES notification_templates(id) ON DELETE SET NULL,
    invoice_code VARCHAR(50),
    recipient VARCHAR(150) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    request_payload TEXT,
    response_payload TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_logs_template ON notification_logs(template_id);
CREATE INDEX idx_notification_logs_invoice ON notification_logs(invoice_code);

-- ====================================================================================
-- 13. TABLE: SETTINGS (Pengaturan Aplikasi General)
-- ====================================================================================
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ====================================================================================
-- =============================== SEEDING DATA =======================================
-- ====================================================================================

-- 1. Insert Users
INSERT INTO users (id, user_code, name, email, phone, joined_date) VALUES 
(1, 'USR-001', 'Abdullah Fulan', 'abdullah@gmail.com', '081234567890', '1 Mei 2026'),
(2, 'USR-002', 'Siti Aisyah', 'aisyah.s@yahoo.com', '085711223344', '20 April 2026'),
(3, 'USR-003', 'Ahmad Zain', 'zain.ahmad@gmail.com', '081199887766', '15 April 2026'),
(4, 'USR-004', 'Budi Santoso', 'budi.santoso@gmail.com', '081988776655', '3 Mei 2026');
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Insert Admins
INSERT INTO admins (id, name, email, password_hash, role, status, created_at) VALUES
(1, 'Ahmad Fulan', 'ahmad@ngo.org', '$2a$12$Dummy', 'SUPERADMIN', 'ACTIVE', '2026-04-19 01:39:51'),
(2, 'Rina Keuangan', 'rina@ngo.org', '$2a$12$Dummy', 'FINANCE', 'ACTIVE', '2026-04-19 01:39:51');
SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins));

-- 3. Insert Kajian
INSERT INTO kajian (id, title, ustadz, date_display, time_display, type, price, spot, filled, image, category, description, location, slug) VALUES
(1, 'Fiqh Muamalah', 'Ust. Ahmad Zainuddin', 'Jum''at, 2 Mei 2026', '19:30 WIB', 'free', 0, 120, 87, 'https://images.pexels.com/photos/8164575/pexels-photo-8164575.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fiqh', 'Pembahasan mendalam tentang hukum-hukum transaksi dalam Islam, termasuk jual beli, sewa-menyewa, dan kerja sama bisnis syariah.', 'Masjid Al-Ikhlas, Bandung', 'fiqh-muamalah'),
(2, 'Tahsin Al-Quran Lv.2', 'Ust. Muhammad Ridwan', 'Sabtu, 3 Mei 2026', '08:00 WIB', 'paid', 150000, 30, 28, 'https://images.pexels.com/photos/8164568/pexels-photo-8164568.jpeg?auto=compress&cs=tinysrgb&w=600', 'Tahsin', 'Kelas intensif perbaikan bacaan Al-Quran dengan metode talaqqi. Level menengah untuk yang sudah menguasai dasar tajwid.', 'Graha Dakwah, Bandung', 'tahsin-al-quran-lv2'),
(3, 'Sirah Nabawiyah', 'Ust. Khalid Basalamah', 'Ahad, 4 Mei 2026', '09:00 WIB', 'free', 0, 200, 156, 'https://images.pexels.com/photos/8164563/pexels-photo-8164563.jpeg?auto=compress&cs=tinysrgb&w=600', 'Sirah', 'Menelusuri perjalanan hidup Rasulullah ﷺ dari kelahiran hingga hijrah ke Madinah.', 'Online via Zoom', 'sirah-nabawiyah'),
(4, 'Bahasa Arab Dasar', 'Ust. Fuad Abdurrahman', 'Senin, 5 Mei 2026', '19:00 WIB', 'paid', 200000, 25, 12, 'https://images.pexels.com/photos/4559592/pexels-photo-4559592.jpeg?auto=compress&cs=tinysrgb&w=600', 'Bahasa', 'Kelas bahasa Arab untuk pemula. Belajar nahwu shorof dasar dengan pendekatan praktis.', 'Wisma Dakwah, Bandung', 'bahasa-arab-dasar'),
(5, 'Kitab Riyadhus Shalihin', 'Ust. Syafiq Basalamah', 'Rabu, 7 Mei 2026', '16:00 WIB', 'free', 0, 150, 98, 'https://images.pexels.com/photos/8164627/pexels-photo-8164627.jpeg?auto=compress&cs=tinysrgb&w=600', 'Hadits', 'Kajian rutin pembahasan kitab Riyadhus Shalihin karya Imam An-Nawawi.', 'Masjid Al-Ikhlas, Bandung', 'kitab-riyadhus-shalihin'),
(6, 'Parenting Islami', 'Ustzh. Haneen Akira', 'Sabtu, 10 Mei 2026', '10:00 WIB', 'paid', 75000, 50, 43, 'https://images.pexels.com/photos/8164571/pexels-photo-8164571.jpeg?auto=compress&cs=tinysrgb&w=600', 'Tarbiyah', 'Seminar mendidik anak sesuai sunnah Rasulullah ﷺ di era digital.', 'Hall Gedung Sate, Bandung', 'parenting-islami');
SELECT setval('kajian_id_seq', (SELECT MAX(id) FROM kajian));

-- 4. Insert Products
INSERT INTO products (id, name, price, old_price, stock, image, category, rating, sold, description, slug) VALUES
(101, 'Gamis Premium Al-Haramain', 389000, 450000, 45, 'https://images.pexels.com/photos/935985/pexels-photo-935985.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.8, 234, 'Gamis pria bahan katun Madinah premium, nyaman dan adem.', 'gamis-premium-al-haramain'),
(102, 'Hijab Voal Luxury Edition', 129000, NULL, 120, 'https://images.pexels.com/photos/4992410/pexels-photo-4992410.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.9, 567, 'Hijab voal premium dengan pinggiran laser cut.', 'hijab-voal-luxury-edition'),
(103, 'Tumbler Dakwah ''Istiqomah''', 89000, 120000, 30, 'https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=600', 'Merchandise', 4.7, 189, 'Tumbler stainless 500ml dengan kaligrafi motivasi.', 'tumbler-dakwah-istiqomah'),
(104, 'Minyak Wangi Oud Al-Madinah', 175000, NULL, 50, 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600', 'Parfum', 4.9, 412, 'Parfum non-alkohol aroma oud premium dari Madinah.', 'minyak-wangi-oud-al-madinah'),
(105, 'Sajadah Travel Premium', 159000, 199000, 60, 'https://images.pexels.com/photos/13508493/pexels-photo-13508493.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.8, 321, 'Sajadah lipat portable dengan kompas kiblat built-in.', 'sajadah-travel-premium'),
(106, 'Buku ''Jalan Menuju Jannah''', 95000, NULL, 80, 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Buku', 4.6, 876, 'Buku best-seller panduan amal yaumiyah lengkap.', 'buku-jalan-menuju-jannah'),
(107, 'Koko Anak Seri Ramadhan', 145000, 175000, 25, 'https://images.pexels.com/photos/8164741/pexels-photo-8164741.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.7, 198, 'Baju koko anak motif islami, bahan adem dan lembut.', 'koko-anak-seri-ramadhan'),
(108, 'Tasbih Digital Premium', 65000, NULL, 150, 'https://images.pexels.com/photos/8164585/pexels-photo-8164585.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.5, 543, 'Tasbih digital dengan counter and pengingat dzikir.', 'tasbih-digital-premium');
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 5. Insert Orders & Items
INSERT INTO orders (id, order_code, user_id, order_date, total, status) VALUES 
(1, 'ORD-98273', 1, '1 Mei 2026', 389000, 'shipped'),
(2, 'ORD-12837', 2, '28 April 2026', 130000, 'completed'),
(3, 'ORD-55421', 3, '3 Mei 2026', 159000, 'pending'),
(4, 'ORD-77623', 4, '3 Mei 2026', 450000, 'packed');
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

INSERT INTO order_items (order_id, product_id, qty, price) VALUES 
(1, 101, 1, 389000), 
(2, 108, 2, 65000),  
(3, 105, 1, 159000), 
(4, 102, 2, 129000), 
(4, 106, 2, 96000);

-- 6. Insert Payment Methods
INSERT INTO payment_methods (id, code, name, logo_url, type, provider, admin_fee_flat, admin_fee_pct, is_active, is_redirect, sort_order) VALUES
(1, 'GOPAY', 'GoPay', 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg', 'E-Wallet', 'Midtrans', 0, 0.00, true, false, 3),
(2, 'BCA', 'BCA Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bca9-IbKNyHu93Cn6SG23ej52n4WGSr9Q8i.jpg', 'va', 'Xendit', 0, 0.00, true, false, 4),
(3, 'MANDIRI', 'Mandiri Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/mandiri-OiJcNXAXphLUz93kRkHBT0cDlelKq4.png', 'va', 'Xendit', 0, 0.00, true, false, 5),
(4, 'BSI', 'BSI Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg', 'va', 'Xendit', 0, 0.00, true, false, 2),
(5, 'QR_CODE', 'QRIS Dynamic', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg', 'qr_code', 'Xendit', 0, 0.00, true, false, 1),
(6, 'SHOPEEPAY', 'ShopeePay', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', 'E-Wallet', 'Xendit', 0, 0.00, true, false, 6),
(7, 'DANA', 'DANA', 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg', 'E-Wallet', 'Xendit', 0, 0.00, true, false, 7),
(8, 'LINKAJA', 'LinkAja', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/linkaja-logo-MQ0RdHT13BwF96O54LxltoM7rNK6JY.png', 'E-Wallet', 'Xendit', 0, 0.00, true, false, 8),
(9, 'BRI', 'BRI Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bri-PAGx45zIqEWTHhyJvBkbAXZouRYTfG.png', 'va', 'Xendit', 0, 0.00, true, false, 9),
(10, 'BNI', 'BNI Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bni-YU2aAc67bEdD0QHeYCWqhRRmpAErd0.png', 'va', 'Xendit', 0, 0.00, true, false, 10),
(11, 'BJB', 'BJB Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/logo-bjb-5JyA52cVlLlt5wzrqmnqi012PX7CYu.png', 'va', 'Xendit', 0, 0.00, true, false, 11),
(12, 'BNC', 'BNC Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/HematpayBNC-VxizZScZEL7HoFAGGe3R7XTkUTmDry.webp', 'va', 'Xendit', 0, 0.00, true, false, 12),
(13, 'CIMB', 'CIMB Niaga Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/cimb-XgzzZPNYCj1lEgpL4qWDouCLTUwA4M.png', 'va', 'Xendit', 0, 0.00, true, false, 13),
(14, 'MUAMALAT', 'Muamalat Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/muamalat-cYrxxhIFBpQYR2IIGIkIWV3KMsjDTP.png', 'va', 'Xendit', 0, 0.00, true, false, 14),
(15, 'PERMATA', 'Permata Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/permata-0IaHmiPhtQlQLBmBp1vtp6nmfwosK2.jpg', 'va', 'Xendit', 0, 0.00, true, false, 15),
(16, 'ALFAMART', 'Alfamart', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/alfamart-4jhk2YjGeoyKo8WEpjSrRNIB4Do5SL.png', 'retail_outlet', 'Xendit', 0, 0.00, true, false, 16),
(17, 'INDOMARET', 'Indomaret', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/indomaret-6LTpkKX31ZqjHTVsiHwVow3jExN1ND.png', 'retail_outlet', 'Xendit', 0, 0.00, true, false, 17),
(18, 'BCA_MANUAL', 'BCA (Transfer Manual)', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bca9-Zi5EfD9vPgoDPwdsjIORMaXIj7mSoB.jpg', 'va', 'Manual', 0, 0.00, true, false, 18),
(19, 'MANDIRI_MANUAL', 'Mandiri (Transfer Manual)', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/mandiri-qHIfJdlwKGHQU020btV9Yhr0iUwo4G.png', 'bank_transfer', 'Manual', 0, 0.00, true, false, 19);
SELECT setval('payment_methods_id_seq', (SELECT MAX(id) FROM payment_methods));

-- 7. Insert Payment Instructions
INSERT INTO payment_instructions (id, payment_method_id, title, content, sort_order) VALUES
(1, 2, 'Pembayaran via Mbanking', '<ol><li>Buka aplikasi BCA Mobile</li><li>Pilih m-BCA, lalu pilih m-Transfer</li><li>Masukkan nomor Virtual Account Anda, contoh: 3816523906568, lalu tekan OK</li><li>Klik tombol Kirim di pojok kanan atas untuk melanjutkan</li><li>Klik OK untuk melanjutkan</li><li>Masukkan PIN m-BCA Anda untuk otorisasi transaksi</li></ol>', 1),
(2, 2, 'Pembayaran via Ibanking', '<ol><li>Login ke KlikBCA Individual (https://ibank.klikbca.com)</li><li>Pilih menu Transfer, lalu pilih Transfer ke BCA Virtual Account</li><li>Masukkan nomor Virtual Account, contoh: 3816523906568</li><li>Pilih Lanjutkan untuk memproses pembayaran</li><li>Masukkan respon KEYBCA APPLI 1 yang muncul di Token BCA Anda, lalu klik tombol Kirim</li><li>Masukkan kode token autentikasi</li></ol>', 2),
(3, 2, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM BCA dan PIN Anda</li><li>Pilih menu Transaksi Lainnya</li><li>Pilih Transfer</li><li>Pilih Ke Rekening BCA Virtual Account</li><li>Masukkan nomor Virtual Account, contoh: 3816523906568. Tekan Benar untuk melanjutkan</li><li>Verifikasi detail Virtual Account lalu masukkan nominal yang akan ditransfer dan pilih Benar untuk konfirmasi</li><li>Konfirmasi detail transaksi Anda yang muncul di layar</li><li>Pilih Ya jika detail sudah benar atau Tidak jika detail belum benar</li></ol>', 3),
(4, 3, 'Pembayaran via Livin', '<ol><li>Login ke aplikasi Livin’ by Mandiri</li><li>Pilih Transfer IDR > Transfer ke penerima baru</li><li>Masukkan nomor virtual account (contoh: 8860863623046)</li><li>Masukkan atau konfirmasi jumlah pembayaran</li><li>Klik Lanjutkan</li><li>Masukkan PIN MPIN Anda</li></ol>', 4),
(5, 3, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa yang diinginkan</li><li>Masukkan PIN ATM</li><li>Pilih menu BAYAR > MULTI PAYMENT</li><li>Masukkan kode perusahaan 88608 (XENDIT), lalu tekan BENAR</li><li>Masukkan nomor virtual account (contoh: 8860863623046), lalu tekan BENAR</li><li>Masukkan jumlah pembayaran, lalu tekan BENAR</li><li>Konfirmasi detail pembayaran</li></ol>', 5),
(6, 9, 'Pembayaran via Brimo', '<ol><li>Login ke aplikasi BRI Mobile Banking</li><li>Pilih menu Pembayaran > Briva</li><li>Masukkan nomor virtual account (contoh: 1328216932121)</li><li>Masukkan jumlah pembayaran</li><li>Masukkan PIN</li><li>Klik Kirim</li></ol>', 6),
(7, 9, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Lainnya > Pembayaran > Pembayaran Lainnya > BRIVA</li><li>Masukkan nomor virtual account (contoh: 1328216932121)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran dan tekan YA</li></ol>', 7),
(8, 10, 'Pembayaran via Mobile', '<ol><li>Login ke aplikasi BNI Mobile Banking</li><li>Klik Transfer > Virtual Account Billing, lalu pilih rekening debet</li><li>Masukkan nomor virtual account (contoh: 880849021633)</li><li>Jumlah pembayaran akan muncul di layar</li><li>Konfirmasi informasi pembayaran</li><li>Masukkan password transaksi</li></ol>', 8),
(9, 10, 'Pembayaran via Ibanking', '<ol><li>Login ke https://ibank.bni.co.id</li><li>Klik Transfer > Virtual Account Billing</li><li>Masukkan nomor virtual account (contoh: 880849021633)</li><li>Pilih rekening bank</li><li>Jumlah pembayaran akan muncul di layar</li><li>Masukkan kode token autentikasi</li></ol>', 9),
(10, 10, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Transaksi Lainnya > Transfer</li><li>Pilih tipe rekening</li><li>Masukkan nomor virtual account (contoh: 880849021633)</li><li>Jumlah pembayaran akan muncul di layar</li><li>Konfirmasi informasi pembayaran</li></ol>', 10),
(11, 11, 'Pembayaran via Mobile', '<ol><li>Buka aplikasi BJB Mobile</li><li>Masukkan User ID dan Password</li><li>Pilih Virtual Account</li><li>Pilih tipe rekening yang Anda gunakan untuk transfer (misal: Rekening Tabungan)</li><li>Masukkan Nomor Virtual Account, contoh: 1234999968795947</li><li>Konfirmasi detail transaksi Anda yang muncul di layar</li></ol>', 11),
(12, 11, 'Pembayaran via Ibanking', '<ol><li>Buka https://ib.bankbjb.co.id/bjb.net</li><li>Masukkan User ID dan Password</li><li>Pilih Virtual Account</li><li>Pilih tipe rekening yang Anda gunakan untuk transfer (misal: Rekening Tabungan)</li><li>Masukkan Nomor Virtual Account, contoh: 1234999968795947</li><li>Konfirmasi detail transaksi Anda yang muncul di layar</li></ol>', 12),
(13, 11, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM BJB dan PIN Anda</li><li>Pilih menu Transaksi Lainnya</li><li>Pilih Virtual Account</li><li>Pilih tipe rekening yang Anda gunakan untuk transfer (misal: Rekening Tabungan)</li></ol>', 13),
(14, 12, 'Pembayaran via Mobile', '<ol><li>Login ke aplikasi BNC mobile banking atau Neobank</li><li>Klik Hematpay VA & QRIS</li><li>Masukkan nomor virtual account (contoh: 9010001050411994)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi informasi pembayaran</li><li>Masukkan PIN</li></ol>', 14),
(15, 12, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Pembayaran VA</li><li>Masukkan nomor virtual account (contoh: 9010001050411994)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi informasi pembayaran</li><li>Masukkan PIN</li></ol>', 15),
(16, 4, 'Pembayaran via Byond', '<ol><li>Login ke BYOND BSI</li><li>Pilih menu Bayar & Beli</li><li>Cari Xendit, Pilih Prefix VA: 9347 atau 9655</li><li>Masukkan kode (tanpa prefix) (contoh: 33371937)</li><li>Masukkan PIN</li><li>Konfirmasi detail pembayaran</li></ol>', 16),
(17, 4, 'Pembayaran via Ibanking', '<ol><li>Login ke https://bsinet.bankbsi.co.id</li><li>Klik Pembayaran</li><li>Pilih sumber pembayaran</li><li>Klik Institusi</li><li>Masukkan Xendit sebagai nama institusi (kode 9347)</li><li>Masukkan nomor virtual account (contoh: 33371937)</li><li>Konfirmasi detail pembayaran</li><li>Masukkan kode token autentikasi</li></ol>', 17),
(18, 4, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Pembayaran/Pembelian > Institusi</li><li>Masukkan nomor virtual account (contoh: 934733371937)</li><li>Konfirmasi detail pembayaran</li></ol>', 18),
(19, 4, 'Pembayaran via Antarbank', '<ol><li>Login ke rekening bank Anda</li><li>Klik Transfer > Pilih BSI</li><li>Masukkan 009 + kode BSI Virtual Account 9347 + nomor virtual account, (contoh: 934733371937)</li><li>Masukkan jumlah pembayaran</li><li>Pilih sumber pembayaran</li><li>Pilih Transfer Online</li><li>Konfirmasi detail pembayaran</li></ol>', 19),
(20, 13, 'Pembayaran via Octo', '<ol><li>Buka aplikasi Octo Mobile dan masukkan User ID dan Password Anda</li><li>Pilih menu Transfer lalu pilih CIMB Niaga Lainnya</li><li>Masukkan Nomor Virtual Account Anda pada menu Input Baru</li><li>Masukkan jumlah pembayaran yang sesuai</li><li>Konfirmasi transaksi dan masukkan password Anda</li><li>Transaksi Anda selesai</li></ol>', 20),
(21, 13, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM Anda</li><li>Pilih bahasa</li><li>Masukkan PIN ATM Anda</li><li>Pilih menu Transfer lalu pilih CIMB Niaga Lainnya</li><li>Masukkan Nomor Virtual Account Anda pada menu Input Baru</li><li>Masukkan jumlah pembayaran yang sesuai</li><li>Konfirmasi transaksi dan masukkan password Anda</li><li>Transaksi Anda selesai</li></ol>', 21),
(22, 13, 'Pembayaran via Ibanking', '<ol><li>Buka alamat https://www.octoclicks.co.id/login dan tekan Enter</li><li>Masukkan User ID dan Password</li><li>Pilih menu Transfer lalu pilih CIMB Niaga Lainnya</li><li>Masukkan Nomor Virtual Account Anda pada menu Input Baru</li><li>Masukkan jumlah pembayaran yang sesuai</li><li>Konfirmasi transaksi dan masukkan password Anda</li><li>Transaksi Anda selesai</li></ol>', 22),
(23, 14, 'Pembayaran via Mdin', '<ol><li>Login ke aplikasi MDIN mobile banking</li><li>Pilih menu Beli/Bayar > Beli/Bayar Tagihan > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 9010001112341234234)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 23),
(24, 14, 'Pembayaran via Ibanking', '<ol><li>Login ke Muamalat Internet Banking</li><li>Klik menu Pembayaran > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 9010001112341234234)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 24),
(25, 14, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Pembayaran > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 9010001112341234234)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 25),
(26, 15, 'Pembayaran via Mobile', '<ol><li>Login ke aplikasi Permata mobile</li><li>Pilih menu Pembayaran Tagihan > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 729361827494)</li><li>Masukkan token autentikasi</li></ol>', 26),
(27, 15, 'Pembayaran via Ibanking', '<ol><li>Login ke https://www.permatanet.com</li><li>Pilih menu Pembayaran Tagihan > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 729361827494)</li><li>Konfirmasi detail pembayaran</li><li>Masukkan kode respon token SMS</li></ol>', 27),
(28, 15, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Transaksi Lainnya > Pembayaran > Pembayaran Lainnya > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 729361827494)</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 28),
(29, 16, 'Pembayaran via Note', '<ol><li>Anda dapat melakukan pembayaran di Alfamart Group (Alfamart, Alfamidi, Dan+Dan, Lawson).</li><li>Pembayaran di bawah Rp 2,5 Juta tersedia di Alfamart, Alfamidi, Dan+Dan, Lawson.</li><li>Pembayaran di atas Rp 2,5 Juta tidak tersedia di Alfamidi.</li><li>Kunjungi gerai ALFAMART terdekat sebelum batas waktu kode pembayaran/barcode habis</li><li>Beri tahu kasir bahwa Anda ingin melakukan pembayaran ke "[Nama Merchant]" via Xendit atau biarkan mereka memindai barcode di atas</li><li>Tunjukkan kode pembayaran/barcode ke kasir dan konfirmasi bahwa jumlahnya sudah benar</li><li>Informasikan kepada kasir jika Anda ingin membayar menggunakan Tunai saja, atau kombinasi Tunai dan Kartu Debit/Prabayar atau E-wallet.</li><li>Jumlah maksimum yang diizinkan bayar dengan Tunai adalah Rp 2,5 Juta, sisanya harus dikombinasikan menggunakan Kartu Debit/Prabayar atau E-wallet.</li><li>Lanjutkan proses pembayaran dengan jumlah yang tertera pada kode pembayaran/barcode Anda</li></ol>', 29),
(30, 1, 'Pembayaran via Gojek / GoPay', '<ol><li>Buka aplikasi Gojek / GoPay Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 30),
(31, 6, 'Pembayaran via Shopee', '<ol><li>Buka aplikasi Shopee Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 31),
(32, 7, 'Pembayaran via DANA', '<ol><li>Buka aplikasi DANA Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 32),
(33, 8, 'Pembayaran via LinkAja', '<ol><li>Buka aplikasi LinkAja Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 33),
(34, 5, 'Pembayaran via QRIS', '<ol><li>Buka aplikasi pembayaran pilihan Anda (GoPay, OVO, DANA, LinkAja, BCA Mobile, dll).</li><li>Pilih menu <strong>Scan / Bayar</strong>.</li><li>Scan QR Code yang tampil di layar.</li><li>Konfirmasi pembayaran dan masukkan PIN Anda.</li></ol>', 34),
(35, 18, 'Instruksi Transfer Manual BCA', '<ol><li>Transfer sesuai nominal (hingga 3 digit terakhir) ke rekening berikut:</li><li><strong>Bank BCA: 1234567890</strong></li><li><strong>Atas Nama: Yayasan Peduli Sesama</strong></li><li>Simpan bukti transfer Anda.</li><li>Konfirmasi pembayaran melalui WhatsApp atau unggah bukti di halaman status.</li></ol>', 35),
(36, 19, 'Instruksi Transfer Manual Mandiri', '<ol><li>Transfer sesuai nominal (hingga 3 digit terakhir) ke rekening berikut:</li><li><strong>Bank Mandiri: 9876543210</strong></li><li><strong>Atas Nama: Yayasan Peduli Sesama</strong></li><li>Simpan bukti transfer Anda.</li><li>Konfirmasi pembayaran melalui WhatsApp atau unggah bukti di halaman status.</li></ol>', 36);
SELECT setval('payment_instructions_id_seq', (SELECT MAX(id) FROM payment_instructions));

-- 8. Insert Payment Logs
INSERT INTO payment_logs (id, invoice_code, endpoint, type, request_payload, response_payload, http_status) VALUES
(1, 'TRX-9921', 'https://api.midtrans.com/v2/charge', 'PAYMENT_REQUEST', '{"payment_type": "gopay", "transaction_details": {"order_id": "TRX-9921", "gross_amount": 100000}}', '{"status_code": "201", "transaction_status": "pending", "actions": [{"name": "generate-qr-code", "url": "https://api.sandbox.midtrans.com/v2/gopay/123456/qr-code"}]}', 201),
(2, 'TRX-9922', 'https://api.xendit.co/v2/virtual_accounts', 'PAYMENT_REQUEST', '{"external_id": "TRX-9922", "bank_code": "BCA", "name": "Hamba Allah", "expected_amount": 504000, "is_closed": true}', '{"id": "614c...va", "external_id": "TRX-9922", "bank_code": "BCA", "merchant_code": "8077", "account_number": "807708123456789", "expected_amount": 504000, "status": "PENDING"}', 200),
(3, 'TRX-9923', 'https://api.xendit.co/callback/virtual_accounts', 'CALLBACK', '{"external_id": "TRX-9923", "amount": 21004000, "status": "COMPLETED", "transaction_timestamp": "2026-10-12T16:15:00.000Z"}', '{"status": "success", "message": "Callback processed and jobs queued"}', 200),
(4, 'a5151a05-e84d-4cef-bb17-1ref3e7fb3a', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded","business_id":"sample_business_id","created":"2022-02-16T06:01:09.997108276Z","data":{"id":"pymt-2e9badf8-1473-4e8a-a1cf-d1e3214afc0f","amount":15000,"country":"ID","created":"2022-02-16T06:01:07.322974428Z","currency":"IDR","payment_request_id":"pr-df560c7d-b059-4789-ad2f-3cee5d8230a8","reference_id":"a5151a05-e84d-4cef-bb17-1ref3e7fb3a","status":"SUCCEEDED","customer_id":null,"description":null,"payment_method":{"id":"pm-e12563a5-a970-4fff-ba3b-242cs0443db7","type":"OVER_THE_COUNTER","reusability":"ONE_TIME_USE","status":"EXPIRED","over_the_counter":{"channel_code":"INDOMARET","channel_properties":{"customer_name":"John Doe","expires_at":"2022-02-18T06:00:49.018714479Z","payment_code":"XENVCQKCUBNRQ"}},"metadata":{"key":"value"},"direct_debit":null,"ewallet":null,"qr_code":null,"virtual_account":null,"created":"2022-02-16T06:00:49.078139Z","updated":"2022-02-16T06:00:49.078139Z"},"metadata":{"key":"value"},"payment_detail":null,"failure_code":null,"channel_properties":null,"updated":"2022-02-16T06:01:07.322974428Z"}}', '{"status":"success"}', 200),
(5, 'INV-20260501-F056DE', '/api/checkout', NULL, '{"campaignId":1,"amount":200000,"donorName":"eva","donorEmail":"irvanadrian151@gmail.com","donorPhone":"089613727205","isAnonymous":true,"doa":null,"paymentMethodId":7,"paymentType":"DANA","qty":1,"qurbanNames":[],"affiliateId":null,"fbClickId":null,"fbBrowserId":null,"tiktokClickId":null,"googleClickId":null}', '{"payment_gateway_response":{"id":"pr-1b935719-0ab1-4a23-adb7-09f1a5310b93","status":"REQUIRES_ACTION"}}', 200),
(6, 'INV-20260501-F056DE', '/api/webhooks/xendit:payment.succeeded', NULL, '{"created":"2026-05-01T07:09:35.250Z","event":"payment.succeeded","data":{"status":"SUCCEEDED"}}', '{"status":"success"}', 200),
(7, '90392f42-d98a-49ef-a7f3-90392f42d98a', '/api/webhooks/xendit:payment.capture', NULL, '{"created":"2025-02-13T08:29:41.734Z","event":"payment.capture"}', '{"status":"success"}', 200),
(8, 'test-payload', '/api/webhooks/xendit:ewallet.capture', NULL, '{"data":{"status":"SUCCEEDED"},"event":"ewallet.capture"}', '{"status":"success"}', 200),
(9, 'INV-20260501-325C38', '/api/checkout', NULL, '{"amount":200000,"donorName":"eva"}', '{"status":"success"}', 200),
(10, 'INV-20260501-325C38', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded"}', '{"status":"success"}', 200),
(11, 'INV-20260502-D396FD', '/api/checkout', NULL, '{"amount":50000}', '{"status":"success"}', 200),
(12, 'INV-20260502-D396FD', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded"}', '{"status":"success"}', 200),
(13, 'INV-20260502-49B97B', '/api/checkout', NULL, '{"amount":2500000}', '{"status":"success"}', 200),
(14, 'INV-20260502-49B97B', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded"}', '{"status":"success"}', 200),
(15, 'INV-20260502-A609B2', '/api/checkout', NULL, '{"amount":500000}', '{"status":"success"}', 200),
(16, 'INV-20260503-AEC827', '/api/checkout', NULL, '{"amount":50000}', '{"status":"success"}', 200),
(17, 'INV-20260503-7127D7', '/api/checkout', NULL, '{"amount":500000}', '{"status":"success"}', 200),
(18, 'INV-20260503-7127D7', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded"}', '{"status":"success"}', 200),
(19, 'INV-20260509-2E9F8C', '/api/checkout', NULL, '{"amount":35000}', '{"status":"success"}', 200),
(20, 'INV-20260509-2E9F8C', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded"}', '{"status":"success"}', 200),
(21, 'INV-20260509-EE4C25', '/api/checkout', NULL, '{"amount":500000}', '{"status":"success"}', 200),
(22, 'INV-20260509-EE4C25', '/api/webhooks/xendit:payment.succeeded', NULL, '{"event":"payment.succeeded"}', '{"status":"success"}', 200),
(23, 'INV-20260509-3D5FA8', '/api/checkout', NULL, '{"amount":500000}', '{"status":"success"}', 200);
SELECT setval('payment_logs_id_seq', (SELECT MAX(id) FROM payment_logs));

-- 9. Insert Notification Templates
INSERT INTO notification_templates (id, event_trigger, channel, message_content, is_active) VALUES
(1, 'DONATION_SUCCESS', 'WHATSAPP', 'Terima kasih {nama}, donasi Rp {nominal} via {metode} berhasil kami terima. Semoga membawa keberkahan.', true),
(2, 'INVOICE_PENDING', 'WHATSAPP', 'Halo {nama}, tagihan donasi Rp {nominal} menunggu pembayaran. Silakan transfer ke {metode} berikut: {va_number} sebelum kedaluwarsa.', true);
SELECT setval('notification_templates_id_seq', (SELECT MAX(id) FROM notification_templates));

-- 10. Insert Notification Logs
INSERT INTO notification_logs (id, template_id, invoice_code, recipient, channel, request_payload, response_payload, status) VALUES
(1, 1, 'TRX-9921', '08123456789', 'WHATSAPP', '{"target": "08123456789", "message": "Terima kasih Andi Dermawan..."}', '{"status": true}', 'SUCCESS'),
(2, 2, 'TRX-9922', '08123456789', 'WHATSAPP', '{"target": "08123456789", "message": "Halo Hamba Allah..."}', '{"status": true}', 'SUCCESS'),
(3, 1, 'INV-20260501-F056DE', '089613727205', 'WHATSAPP', '{"target":"089613727205","message":"Terima kasih..."}', '{"status":false}', 'FAILED'),
(4, 1, 'INV-20260501-325C38', '089613727205', 'WHATSAPP', '{"target":"089613727205","message":"Terima kasih..."}', '{"status":false}', 'FAILED'),
(5, 1, 'INV-20260502-D396FD', '6281462206437', 'WHATSAPP', '{"target":"6281462206437","message":"Terima kasih..."}', '{"status":false}', 'FAILED'),
(6, 1, 'INV-20260502-49B97B', '6281462206437', 'WHATSAPP', '{"target":"6281462206437","message":"Terima kasih..."}', '{"status":false}', 'FAILED'),
(7, 1, 'INV-20260503-7127D7', '081462206437', 'WHATSAPP', '{"target":"081462206437","message":"Terima kasih..."}', '{"status":false}', 'FAILED'),
(8, 1, 'INV-20260509-2E9F8C', '081462206437', 'WHATSAPP', '{"target":"081462206437","message":"Terima kasih..."}', '{"status":false}', 'FAILED'),
(9, 1, 'INV-20260509-EE4C25', '081462206437', 'WHATSAPP', '{"target":"081462206437","message":"Terima kasih..."}', '{"status":false}', 'FAILED');
SELECT setval('notification_logs_id_seq', (SELECT MAX(id) FROM notification_logs));

-- 11. Insert Settings (Additional config merging with schema_komunitas)
INSERT INTO settings (config_key, config_value) VALUES 
('app_name', 'Aplikasi Majelis Ilmu'),
('app_theme', 'Cyan-Tosca');