const express = require('express');
const router = express.Router();
const passport = require('passport');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


//http://localhost:5000/api/auth/

//start login http://localhost:5000/api/auth/github

// 1. Server starts → require('./auth/github') → Strategy registered
// 2. User clicks "Login with GitHub" → GET /api/auth/github
// 3. Passport redirects to GitHub → User authorizes
// 4. GitHub redirects back → GET /api/auth/github/callback  
// 5. Your strategy function runs → Database lookup/update
// 6. User is logged in → req.user available in controllers

router.get('/github', (req, res, next)=>{ //AUTHENTICATION STEP 1
    //forward the state parameter if present
    const authenticator = passport.authenticate('github',{
        score:['user:email'],
        state: req.query.state /// ensure the state param is being passed to the passport strategy
    });
    authenticator(req,res,next);
})
//handle github callback
router.get('/github/callback', //AUTHENTICATION ST EP 2
    (req,res,next) =>{
        //save state to session
        console.log('login user information /callback req.query',req.query);
        //SAVE THE EMAIL STATE PARAM AS THE SESSION EMAIL
        if(req.query.state){
            //we are passing the session not the state
            req.session.oauthEmail = req.query.state;
        };
        next();
    },
    //if authenticationg fails, you will be redirected below
    passport.authenticate('github',{failureRedirect:'http://localhost:3000/login?error=oauth'}),
    (req,res)=>{ //if authentication successful...REDIRECT TO HOMEPAGE
        console.log('Github /callback hit, user: ', req.user);
        res.redirect('http://localhost:3000/'); //where the front end lands
    }
);

//get logged-in user
router.get('/me', 
     async (req,res) =>{
         console.log('Auth check - /me route:', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        sessionID: req.sessionID
    });
        if(!req.user) return res.status(401).json({error: '/me Not authenticated'});
        //  By default, req.user is set by Passport and typically contains only 
        //  the user fields fetched during authentication (often just from your 
        //     database's user table)
        //if you want all user information to be sent to the main page in frontend,
        //you must send the data here 
         try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                schoolId: true,
                name: true,
                email: true,
                role: true,
                githubUsername: true,
                githubId: true,
                section: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if(!user) return res.status(404).json({error: 'User not found'});
        res.json(user);
     }catch(err){
        console.error('Error fetching user with section: ', err);
        res.status(500).json({error: 'Internal Service ERror'} );
     }
});

//logout
router.post('/logout', async (req,res) =>{
    if(req.user){
        try{
            await prisma.user.update({
                where:{ id: req.user.id},
                //setting id and username to null after session, 
                //secure and clean approach
                data: {
                    githubId:null,
                    githubUsername:null
                }
            });

            console.log('✅ Cleared GitHub data from database');
        }catch(err){
            console.error('Error on /logout ',err);
        }
    }


    req.logout(()=>{ //passports logout method
        req.session.destroy(()=>{
            res.clearCookie('studentPortalSession');
            res.sendStatus(200); //responds with not content
        })
    });
});


//unlink github before logging in with another account 
//for example, logging in with thturin and logging out. Then logging back in with tturin1017 causes 
//an error because the profile is still linked to thturin. It must be unlinked first 
//ie. changing githubId and username to NULL
// router.post('/unlink-github', async (req, res)=>{
//     const {email} = req.body;
//     if(!email) return res.status(400).json({error: 'Email is required'});
//     try{
//         const user = await prisma.user.findUnique({where: {email}});
//         await prisma.user.update({
//             where: {email},
//             data: {githubId: null, githubUsername: null}
//         });
//         res.json({message: 'Github account unlinked successfully'});

//     }catch(err){
//         console.error('unlink github error: ',err);
//         res.status(500).json({error: 'Internal server error'});
//     }
// });



module.exports = router;


/*
HOW GITHUB AUTHENTICATION WORKS ON LOGIN 
1. user initializes github by logging in on submission portal with their email (FRONTEND)
    User clicks login with github button and front end redirects to 
    http://localhost:5000/api/auth/github?state=the@email.com
    this url includes the email address
2. Oauth Flow (BACKEND) 
    /api/auth/github route received the request
    calls passport.authenticate which contains the state (email param)
    passport forwards the state param to github 
3. GITHUB HANDLES AUTHENTICATION
    the user logs in on github (they click authorize)
    github redirects the user back to my callback url    
    http://localhost:5000/api/auth/github/callback?code=...&state=the@email.com
    github adds the state parameters to the end of the url but it is still redirected to /github/callback route
4. USER LOOK UP AND UPDATE GITHUB ID AND USERNAME
    the strategy looks up the user in the database, if there exists the same email, 
    it will add the github username and github ID to database.
5. FINAL REDIRECT TO HOMEPAGE
    user should be updated on the parent component (NOT DONE)

    Summary Table
Step	                        Where?	                            How Email is Passed/Used
User login	                    Frontend	                        Appends ?state=email to GitHub URL
Start OAuth	                    /auth/github route	                Forwards state to GitHub
GitHub callback	                /auth/github/callback	        Reads state from req.query, saves to session
Passport strategy	            Strategy callback	                Uses profile.emails[0] or req.session.oauthEmail




*/