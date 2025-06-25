const express = require('express');
const router = express.Router();
const passport = require('passport');

//http://localhost:5000/api/auth/[]

//start login 
router.get('/github', passport.authenticate('github', {scope:['user:email']}));


//handle github callback
router.get('/github/callback',
    passport.authenticate('github',{failureRedirect:'/'}),
    (req,res)=>{
        res.redirect('/'); //where the front end lands
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
    req.logout(err=>{
        if(err) return res.status(500).json({error:'Logout failed'});
        res.sendStatus(204);
    });
});

module.exports = router;