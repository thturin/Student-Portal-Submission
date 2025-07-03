
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
                            callbackURL:'http://localhost:5000/api/auth/github/callback',
                            passReqToCallback:true //allows you to access the original request(state parameter) inside strategy callback
                            //callbackURL:`${process.env.REACT_APP_API_URL}/auth/github/callback`
                            },
                            async(req,accessToken, refreshToken, profile, done) =>{
                                //github send you user info in `profile`   
                                //you find or update user in DB
                                try{
                                    //check if user already exists in DB
                                    const githubUsername = profile.username;
                                    const githubId = profile.id;
                                    //try to get github email
                      
                                    let githubEmail = profile.emails?.[0]?.value?.toLowerCase(); 
                                    console.log(`github username:${githubUsername}\ngithubId:${githubId}\ngithubEmail:${githubEmail}`);
                                    if(!githubEmail && req.session.oauthEmail){
                                        githubEmail = req.session.oauthEmail.toLowerCase();
                                    };

                                    //console.log(`github username:${githubUsername}\ngithubId:${githubId}\ngithubEmail:${githubEmail}`);

                                    if(!githubEmail) return done(null, false, {message: 'No github email provided'});
                                    
                                    const approvedUser = await prisma.user.findUnique({
                                        where:{email:githubEmail}
                                    });

                                    console.log({approvedUser});
     
                                    //only update if githubid has changed
                                    if(approvedUser){
                                       //check if another user already has the github id
                                       const userWithGithubId = await prisma.user.findUnique({
                                        where: {githubId}
                                       });

                                       console.log(userWithGithubId);
                                       //if userWithGithubId exists and there are two users with the same githubId but different id's 
                                       if(userWithGithubId && userWithGithubId.id!==approvedUser.id){ //CHECKING FOR GITHUB ID DUPES
                                        console.log('hii');
                                        return done(null,false,{message: 'Github account already linked to another user'});
                                       }

                                       ///prepare to update the data  
                                       const updateData = {};
                                       //if the approved user's githubId does not exist or needs to be updated
                                       if(approvedUser.githubId === null || approvedUser.githubId!==githubId){
                                        updateData.githubId=githubId;
                                       }

                                       if(approvedUser.githubUsername === null || approvedUser.githubUsername!==githubUsername){
                                        updateData.githubUsername=githubUsername;
                                       }

                                       let updatedUser = approvedUser; //set to approved user if nothing is changed, original will get returned
                                       if(Object.keys(updateData).length > 0){
                                        updatedUser = await prisma.user.update({
                                            where: {id: approvedUser.id},
                                            data:updateData
                                        });
                                       }

                                       return done(null,updatedUser);
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