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

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `users` (`username`, `password`, `role`) VALUES ('admin', '$2b$10$E/g.A.1Jg4j.d.y.Z.a.e.O/g.A.1Jg4j.d.y.Z.a.e.O/g.A.1J', 'admin');
