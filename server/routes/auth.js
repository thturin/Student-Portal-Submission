const express = require('express');
const router = express.Router();
const passport = require('passport');

//http://localhost:5000/api/auth[]

//start login http://localhost:5000/api/auth/github

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
        console.log('login user information',req.query);
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
        console.log('Github callback hit, user: ', req.user);
        res.redirect('http://localhost:3000/'); //where the front end lands
    }
);

//get logged-in user
router.get('/me', 
    (req,res) =>{
        if(req.user) return res.json(req.user);
        res.status(401).json({error:'Not authenticated'});
    }
);

//logout
router.post('/logout', (req,res) =>{
    req.logout(()=>{ //passports logout method
        req.session.destroy(()=>{
            res.clearCookie('connect.sid');
            res.sendStatus(204); //responds with not content
        })
    });
});



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