const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../config/db');

router.get('/login', (req, res) => {
    res.render('login', { messages: req.flash() });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

router.get('/register', (req, res) => {
    res.render('register', { messages: req.flash() });
});

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            username: req.body.username,
            password: hashedPassword
        };
        db.query('INSERT INTO users SET ?', newUser, (err, results) => {
            if (err) {
                req.flash('error', 'Username already exists.');
                return res.redirect('/auth/register');
            }
            res.redirect('/auth/login');
        });
    } catch {
        res.redirect('/auth/register');
    }
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
