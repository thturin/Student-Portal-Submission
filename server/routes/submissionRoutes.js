const express = require('express');//load express
const router = express.Router(); //create a new router object  (mini express app -> for handling routes)
const {verifyGithubOwnership,updateSubmission,handleSubmission, getAllSubmissions, verifyDocOwnership,getSubmission} = require('../controllers/submissionController'); //call the handleSubmission function from submissionController 


// benefits of adding middleware
// 1. security _ prevents unauthenticated users from submitting assignments
// 2. can access req.user in all your controllers 
// 3. protection 

//wasn't working initially because the frontend wasn't sending session cookies 
const ensureAuthenticated = (req,res,next)=>{
    console.log( 'AUTH CHECK',{
        isAuthenticated: req.isAuthenticated(),
        user:req.user,
        session: req.session
    });
    if(req.isAuthenticated()){
        return next();
    }
    res.status(401).json({error:'Authentication is required'});
}


//ROOT / ISS LOCALHOST:5000/API
router.get('/submissions',ensureAuthenticated, getAllSubmissions); //this pathway is relative to the base path set in app.js (api/submit)
// router.post('/',createSubmission);
router.get('/submissions/:id',ensureAuthenticated,getSubmission);
router.put('/submissions/:id',ensureAuthenticated,updateSubmission);


router.post('/submit',ensureAuthenticated,handleSubmission);
router.post('/verify-doc-ownership',ensureAuthenticated,verifyDocOwnership);
router.post('/verify-github-ownership', ensureAuthenticated,verifyGithubOwnership);


module.exports = router; //export router object so your main server file can use it