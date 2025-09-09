
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

// Show add form
router.get('/add', (req, res) => {
    res.render('add');
});

// Add new invitation
router.post('/add', (req, res) => {
    const newInvitation = { 
        nama_undangan: req.body.nama_undangan, 
        tanggal_acara: req.body.tanggal_acara,
        lokasi: req.body.lokasi,
        deskripsi: req.body.deskripsi
    };
    const sql = "INSERT INTO surat_undangan SET ?";
    db.query(sql, newInvitation, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Show edit form
router.get('/edit/:id', (req, res) => {
    const sql = `SELECT * FROM surat_undangan WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('edit', { invitation: result[0] });
    });
});

// Update invitation
router.post('/edit/:id', (req, res) => {
    const updatedInvitation = {
        nama_undangan: req.body.nama_undangan,
        tanggal_acara: req.body.tanggal_acara,
        lokasi: req.body.lokasi,
        deskripsi: req.body.deskripsi
    };
    const sql = `UPDATE surat_undangan SET ? WHERE id = ${req.params.id}`;
    db.query(sql, updatedInvitation, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Delete invitation
router.get('/delete/:id', (req, res) => {
    const sql = `DELETE FROM surat_undangan WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

module.exports = router;
