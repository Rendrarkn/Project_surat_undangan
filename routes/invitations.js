
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Home page - Display all invitations
router.get('/', (req, res) => {
    const sql = "SELECT * FROM surat_undangan";
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('index', { invitations: result });
    });
});


const ExcelJS = require('exceljs');

// Export to Excel
router.get('/export', (req, res) => {
    const sql = "SELECT * FROM surat_undangan";
    db.query(sql, (err, results) => {
        if (err) throw err;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Undangan');

        worksheet.columns = [
            { header: 'Nama Undangan', key: 'nama_undangan', width: 30 },
            { header: 'Tanggal Acara', key: 'tanggal_acara', width: 20 },
            { header: 'Lokasi', key: 'lokasi', width: 30 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 }
        ];

        results.forEach(invitation => {
            worksheet.addRow(invitation);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="undangan.xlsx"');

        workbook.xlsx.write(res).then(() => {
            res.end();
        });
    });
});

module.exports = router;
