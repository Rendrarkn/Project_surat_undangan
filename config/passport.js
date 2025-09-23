const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./db');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            console.log('Username:', username);
            db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
                if (err) throw err;
                console.log('User from DB:', results[0]);
                if (results.length === 0) {
                    return done(null, false, { message: 'That username is not registered' });
                }

                bcrypt.compare(password, results[0].password, (err, isMatch) => {
                    if (err) throw err;
                    console.log('Password match:', isMatch);
                    if (isMatch) {
                        return done(null, results[0]);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            done(err, results[0]);
        });
    });
};