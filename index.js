// index.js

/*  EXPRESS */

const express = require('express');
const app = express();
const session = require('express-session');

app.set('view engine', 'ejs');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.get('/', function (req, res) {
    res.render('pages/auth');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));


/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/pages/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


/*  Google AUTH  */

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = 'our-google-client-id';
const GOOGLE_CLIENT_SECRET = 'our-google-client-secret';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    function (req, res) {
        // Successful authentication, redirect success.
        res.redirect('/pages/success');
    });


/*  Facebook AUTH  */
const FacebookStrategy = require('passport-facebook').Strategy;
const FACEBOOK_CLIENT_ID = 'our-facebook-client-id';
const FACEBOOK_CLIENT_SECRET = 'our-facebook-client-secret';

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));

app.get('/', function (req, res) {
    res.render('pages/index.ejs'); // load the index.ejs file
});

app.get('/profile', isLoggedIn, function (req, res) {
    res.render('pages/profile.ejs', {
        user: req.user // get the user out of session and pass to template
    });
});

app.get('/error', isLoggedIn, function (req, res) {
    res.render('pages/error.ejs');
});

app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/error'
    }));

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}