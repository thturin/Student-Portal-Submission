








// const passport = require('passport');
// const GitHubStrategy = require('passport-github2').Strategy;
// const session = require('express-session');

// app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: "http://localhost:5000/auth/github/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     // Save or find user in your DB here
//     // profile.username is the GitHub username
//     return done(null, profile);
//   }
// ));

// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((obj, done) => done(null, obj));

// // Auth routes
// app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));
// app.get('/auth/github/callback', 
//   passport.authenticate('github', { failureRedirect: '/' }),
//   function(req, res) {
//     // Successful authentication, redirect or respond as needed.
//     res.redirect('/');
//   });