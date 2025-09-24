
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/');
};

// Home page - Display all invitations
router.get('/', (req, res) => {
    const sql = "SELECT * FROM surat_undangan";
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('index', { invitations: result, user: req.user });
    });
});

// Edit route - GET
router.get('/edit/:id', isAdmin, (req, res) => {
    const sql = "SELECT * FROM surat_undangan WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.render('edit', { invitation: result[0] });
    });
});

// Edit route - POST
router.post('/edit/:id', isAdmin, (req, res) => {
    const { nama_undangan, tanggal_acara, lokasi, deskripsi } = req.body;
    const sql = "UPDATE surat_undangan SET nama_undangan = ?, tanggal_acara = ?, lokasi = ?, deskripsi = ? WHERE id = ?";
    db.query(sql, [nama_undangan, tanggal_acara, lokasi, deskripsi, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Add route - GET (form)
router.get('/add', isAdmin, (req, res) => {
    res.render('add');
});

// Add route - POST (create new invitation)
router.post('/add', isAdmin, (req, res) => {
    const { nama_undangan, tanggal_acara, lokasi, deskripsi } = req.body;
    const sql = "INSERT INTO surat_undangan (nama_undangan, tanggal_acara, lokasi, deskripsi) VALUES (?, ?, ?, ?)";
    db.query(sql, [nama_undangan, tanggal_acara, lokasi, deskripsi], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Delete route
router.get('/delete/:id', isAdmin, (req, res) => {
    const sql = "DELETE FROM surat_undangan WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});


const PDFDocument = require('pdfkit');

// Export to PDF by ID
router.get('/export-pdf/:id', (req, res) => {
    // Pastikan user sudah login
    if (!req.user) {
        return res.status(401).send('Anda harus login untuk melakukan aksi ini.');
    }

    const { id } = req.params;
    const sql = "SELECT nama_undangan as nama_acara, tanggal_acara, lokasi, deskripsi FROM surat_undangan WHERE id = ?";
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send('Undangan tidak ditemukan.');
        }

        const invitation = results[0];
        
        // 1. Inisialisasi PDF dengan margin
        const doc = new PDFDocument({ margin: 50 });
        const filename = `undangan_${id}.pdf`;

        // Set response headers untuk auto-download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe PDF ke response
        doc.pipe(res);

        // --- Mulai Desain Undangan ---

        // 5. Border halaman
        const pageMargin = 50;
        doc.rect(pageMargin, pageMargin, doc.page.width - pageMargin * 2, doc.page.height - pageMargin * 2).stroke();
        doc.moveDown(2);

        // 1. Judul Acara
        doc.font('Helvetica-Bold').fontSize(24).text(invitation.nama_acara.toUpperCase(), {
            align: 'center'
        });
        doc.moveDown(0.5);

        // Garis dekorasi di bawah judul
        const lineWidth = 200;
        const startX = (doc.page.width - lineWidth) / 2;
        doc.moveTo(startX, doc.y).lineTo(startX + lineWidth, doc.y).stroke();
        doc.moveDown(3);

        // 2. Isi Undangan (Penerima)
        doc.font('Helvetica').fontSize(14).text(`Kpd Yth. ${req.user.username}`, {
            align: 'center',
            lineGap: 8
        });
        doc.moveDown(2);

        // 3. Tanggal dan Lokasi Acara
        doc.font('Helvetica-Bold').fontSize(12).text(`Tanggal: ${new Date(invitation.tanggal_acara).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, {
            align: 'center'
        });
        doc.moveDown(0.5);
        doc.text(`Lokasi: ${invitation.lokasi}`, {
            align: 'center'
        });
        doc.moveDown(1.5);

        // 4. Deskripsi Acara
        doc.font('Helvetica-Oblique').fontSize(12).text(invitation.deskripsi, {
            align: 'center'
        });

        // --- Akhir Desain Undangan ---

        // Finalisasi PDF
        doc.end();
    });
});

module.exports = router;
