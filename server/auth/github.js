
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config(); //load environment variables from .env

// githubId -> "4356745" (a unique id that is sent via Oauth when user logins)

// SERIALIZATION
// / 1. User logs in via GitHub OAuth
//  2. Strategy returns user object:
// const user = {
//     id: 123,
//     email: "student@school.edu", 
//     name: "John Doe",
//     githubUsername: "john_doe"
// };

// 3. serializeUser called:
// passport.serializeUser((user, done) => {
//     done(null, user.id); // Only store ID (123) in session
// });

//  4. Session cookie contains: { passport: { user: 123 } }

// DESERIALIZATION
//  1. User makes request to /api/submissions
//  2. Browser sends session cookie: { passport: { user: 123 } }
//  3. deserializeUser called:
//      passport.deserializeUser(async (id, done) => {
//     const user = await prisma.user.findUnique({ where: { id: 123 } });
//     done(null, user); // Full user object restored
// });

//  4. req.user now contains full user object in your route handlers



//save user's ID into the session
//passport calls serializeUser which takes full user object as input
//stores only the user id in session cookies (to save space)
//Session cookie contains: { passport: { user: 123 } }
passport.serializeUser(
    (user,done)=>{
            //console.log('Serializing user', user.id, typeof user.id);
            done(null, user.id); //store user ID in session cookie
    }
);

//retrieve user details from the session ID
//
passport.deserializeUser( 
    async (id,done) =>{
        try{
            //console.log('🔍 Deserializing user ID:', id, 'Type:', typeof id);
            const user = await prisma.user.findUnique(
                {where:{id}}
            );
            //console.log('FOUND USER  /deserializeUser', user ? user: 'null');
            done(null,user); //make user object available as req.user
        }catch(err){
            console.log('Deserialization error',err);
            done(err,null)
        }
    }   
);

//ADDED FOR PRODUCTION
//add this check before strategy to confirm railway is using environment variable for client id and secret
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.error('Missing GitHub OAuth credentials!');
    console.error('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Missing');
    console.error('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Missing');
    throw new Error('GitHub OAuth credentials not configured');
}


//configure the github strategy
passport.use(new GitHubStrategy({
                            clientID: process.env.GITHUB_CLIENT_ID,
                            clientSecret: process.env.GITHUB_CLIENT_SECRET,
                            callbackURL:`${process.env.SERVER_URL}/auth/github/callback`,
                            //UPDATED FOR PRODUCTION
                            // callbackURL:process.env.NODE_ENV === 'production' 
                            //                 ? `${process.env.RAILWAY_STATIC_URL}/api/auth/github/callback`
                            //                 :`${process.env.SERVER_URL}/auth/github/callback`,
                            passReqToCallback:true //allows you to access the original request(state parameter) inside strategy callback
                            },
                            async(req,accessToken, refreshToken, profile, done) =>{
                                //github send you user info in `profile`   
                                //you find or update user in DB
                                try{
                                    //check if user already exists in DB
                                    const githubUsername = profile.username; //THE PROFILE OBJECT DOESN'T UPDATE FROM PREVIOUS USER
                    
                                    const githubId = profile.id;
                                    //try to get github email
                                    //console.log('GitHub profile:', profile);
                                    let githubEmail = profile.emails?.[0]?.value?.toLowerCase(); 
                                   
                                    if(!githubEmail && req.session.oauthEmail){
                                        //make the session email the githubEmail
                                        githubEmail = req.session.oauthEmail.toLowerCase();
                                    };
                                    
                                    console.log('-------------------------');
                                    console.log(`github username:${githubUsername}\ngithubId:${githubId}\ngithubEmail:${githubEmail}`);
                                    console.log('-------------------------');
                                    if(!githubEmail) return done(null, false, {message: 'No github email provided'});
                                    
                                    //searches for email in database
                                    const approvedUser = await prisma.user.findUnique({
                                        where:{email:githubEmail}
                                    });

                                    if(approvedUser){
                                        //for the session, add the github username and id to the database 
                                        try{
                                            //EVEN THOUGHT WE ARE DESTORYING THE SESSION ON /LOGOUT, SOMETIMES PREVIOUS USER'S GITHUB 
                                            //INFO GETS ADDED TO NEW USER LOGGING IN 
                                            //DELET THIS GITHUB INFORMATION FROM THE WRONG USER
                                            await prisma.user.updateMany({
                                                where: {
                                                    githubUsername: githubUsername,
                                                    id: { not: approvedUser.id } // Don't clear from current user
                                                },
                                                data: {
                                                    githubUsername: null,
                                                    githubId: null
                                                }
                                            });

                                            const updatedUser = await prisma.user.update({
                                                where: {email:githubEmail},
                                                data:{
                                                    githubUsername: githubUsername,
                                                    githubId:githubId
                                                }
                                            });

                                            console.log(
                                                `User updated: ${updatedUser.githubUsername} and ${updatedUser.githubId}`
                                            );
                                            return done(null, updatedUser);

                                        }catch(err){
                                            console.error('Error github.js updating approved user',err);
                                        }
                                    
                                       
                                     }
                                        
                                   
                                    return done(null,false, {message: 'User not on pre-approved list by admin'});

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