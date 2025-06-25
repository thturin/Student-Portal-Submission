
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


// githubId -> "4356745" (a unique id that is sent via Oauth when user logins)



//save user's ID into the session
passport.serializeUser(
    (user,done)=>{
            done(null, user.id); //store user ID in session cookie
    }
);

//retrieve user details from the session ID
passport.deserializeUser( 
    async (id,done) =>{
        const user = await prisma.user.findUnique(
            {
                where:{id}
            }
        );
        done(null,user); //make user object available as req.user
    }   
);

//configure the github strategy
passport.use(new GitHubStrategy({
                            clientID: process.env.GITHUB_CLIENT_ID,
                            clientSecret: process.env.GITHUB_CLIENT_SECRET,
                            callbackURL:'/auth/github/callback'
                            },
                            async(accessToken, refreshToken, profile, done) =>{
                                try{
                                    //check if user already exists in DB
                                    const githubUsername = profile.username;
                                    const githubId = profile.id;
                                    const githubEmail = profile.emails?.[0]?.value?.toLowerCase(); ///github email
                                    const approvedUser = await prisma.user.findUnique({
                                        where:{githubUsername},
                                    });

                                    if(!githubEmail) return done(null, false, {message: 'No github email provided'});

                                    const existingUser = await prisma.user.findUnique({
                                        where: {email:githubEmail}
                                    });

                                    if(existingUser){
                                        const updatedUser = await prisma.user.update({
                                            where : {id: existingUser.id},
                                            data: {
                                                githubId,
                                                githubUsername
                                            }
                                        });
                                        return done(null,updatedUser);
                                    }
                                    //no match ?? block login (or create pending user)
                                     return done(null,false, {message: 'User not pre-approved by instructor'});

                                }catch(err){
                                    console.error('Github login error: ',err);
                                    return done(err);
                                }
                            }
));






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