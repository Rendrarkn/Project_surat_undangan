
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const PDFDocument = require('pdfkit');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'You are not authorized to view this page');
    res.redirect('/');
};

// Home page - Display all invitations
router.get('/', (req, res) => {
    const sql = "SELECT * FROM surat_undangan";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Failed to load invitations.');
            return res.redirect('/');
        }
        res.render('index', { invitations: result, user: req.user });
    });
});

// Add route - GET
router.get('/add', isAdmin, (req, res) => {
    res.render('add', { user: req.user });
});

// Add route - POST
router.post('/add', isAdmin, (req, res) => {
    const { nama_undangan, tanggal_acara, lokasi, deskripsi, kategori } = req.body;
    if (!nama_undangan || !tanggal_acara || !lokasi || !deskripsi || !kategori) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/add');
    }
    const sql = "INSERT INTO surat_undangan (nama_undangan, tanggal_acara, lokasi, deskripsi, kategori) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nama_undangan, tanggal_acara, lokasi, deskripsi, kategori], (err, result) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Failed to add invitation.');
            return res.redirect('/add');
        }
        req.flash('success_msg', 'Invitation added successfully');
        res.redirect('/');
    });
});

// Edit route - GET
router.get('/edit/:id', isAdmin, (req, res) => {
    const sql = "SELECT * FROM surat_undangan WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Failed to load invitation for editing.');
            return res.redirect('/');
        }
        if (result.length === 0) {
            req.flash('error_msg', 'Invitation not found.');
            return res.redirect('/');
        }
        res.render('edit', { invitation: result[0], user: req.user });
    });
});

// Edit route - POST
router.post('/edit/:id', isAdmin, (req, res) => {
    const { nama_undangan, tanggal_acara, lokasi, deskripsi, kategori } = req.body;
    if (!nama_undangan || !tanggal_acara || !lokasi || !deskripsi || !kategori) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect(`/edit/${req.params.id}`);
    }
    const sql = "UPDATE surat_undangan SET nama_undangan = ?, tanggal_acara = ?, lokasi = ?, deskripsi = ?, kategori = ? WHERE id = ?";
    db.query(sql, [nama_undangan, tanggal_acara, lokasi, deskripsi, kategori, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Failed to update invitation.');
            return res.redirect(`/edit/${req.params.id}`);
        }
        req.flash('success_msg', 'Invitation updated successfully');
        res.redirect('/');
    });
});

// Delete route
router.get('/delete/:id', isAdmin, (req, res) => {
    const sql = "DELETE FROM surat_undangan WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Failed to delete invitation.');
            return res.redirect('/');
        }
        req.flash('success_msg', 'Invitation deleted successfully');
        res.redirect('/');
    });
});

// Export to PDF by ID
router.get('/export-pdf/:id', (req, res) => {
    if (!req.user) {
        return res.status(401).send('Anda harus login untuk melakukan aksi ini.');
    }

    const { id } = req.params;
    const sql = "SELECT nama_undangan as nama_acara, tanggal_acara, lokasi, deskripsi, kategori FROM surat_undangan WHERE id = ?";
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send('Undangan tidak ditemukan.');
        }

        const invitation = results[0];
        
        const doc = new PDFDocument({ margin: 50 });
        const filename = `undangan_${invitation.kategori.replace(/\s/g, '_')}_${id}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // --- Desain Dinamis Berdasarkan Kategori ---
        let textColor = '#333333'; // Warna teks default

        switch (invitation.kategori) {
            case 'Undangan Pernikahan':
                doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#FFF5E1').fill(); // Latar belakang krem
                textColor = '#5D4037'; // Coklat tua
                // Anda bisa menambahkan gambar bunga di sini: doc.image('path/to/bunga.png', ...)
                break;
            case 'Undangan Ulang Tahun':
                doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#E3F2FD').fill(); // Latar belakang biru muda
                textColor = '#1E88E5'; // Biru cerah
                // Anda bisa menambahkan gambar balon di sini: doc.image('path/to/balon.png', ...)
                break;
            case 'Undangan Rapat':
            case 'Undangan Seminar / Workshop':
                // Latar belakang putih (default), border formal
                const pageMargin = 40;
                doc.rect(pageMargin, pageMargin, doc.page.width - pageMargin * 2, doc.page.height - pageMargin * 2).stroke('#444444');
                break;
            case 'Undangan Tahlilan / Kenduri':
                doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#F5F5F5').fill(); // Latar belakang abu-abu sangat muda
                textColor = '#2E7D32'; // Hijau tua
                break;
            // Tambahkan case lain sesuai kebutuhan
            default:
                // Desain default jika kategori tidak cocok
                doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#FFFFFF').fill();
                break;
        }

        doc.moveDown(2);

        // --- Konten Undangan ---
        doc.fillColor(textColor).font('Helvetica-Bold').fontSize(24).text(invitation.nama_acara.toUpperCase(), {
            align: 'center'
        });
        doc.moveDown(0.5);

        const lineWidth = 200;
        const startX = (doc.page.width - lineWidth) / 2;
        doc.strokeColor(textColor).moveTo(startX, doc.y).lineTo(startX + lineWidth, doc.y).stroke();
        doc.moveDown(3);

        doc.fillColor(textColor).font('Helvetica').fontSize(14).text(`Kpd Yth. ${req.user.username}`, {
            align: 'center',
            lineGap: 8
        });
        doc.moveDown(2);

        doc.font('Helvetica-Bold').fontSize(12).text(`Tanggal: ${new Date(invitation.tanggal_acara).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, {
            align: 'center'
        });
        doc.moveDown(0.5);
        doc.text(`Lokasi: ${invitation.lokasi}`, {
            align: 'center'
        });
        doc.moveDown(1.5);

        doc.font('Helvetica-Oblique').fontSize(12).text(invitation.deskripsi, {
            align: 'center'
        });

        doc.end();
    });
});

module.exports = router;
