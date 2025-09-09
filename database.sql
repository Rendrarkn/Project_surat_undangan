
CREATE DATABASE surat_undangan_db;

USE surat_undangan_db;

CREATE TABLE surat_undangan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_undangan VARCHAR(255) NOT NULL,
    tanggal_acara DATE NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
