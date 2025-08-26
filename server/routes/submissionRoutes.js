const express = require('express');//load express
const router = express.Router(); //create a new router object  (mini express app -> for handling routes)
const {verifyGithubOwnership,updateSubmission,createSubmission, getAllSubmissions, verifyDocOwnership,getSubmission} = require('../controllers/submissionController'); //call the handleSubmission function from submissionController 


// benefits of adding middleware
// 1. security _ prevents unauthenticated users from submitting assignments
// 2. can access req.user in all your controllers for github verification
// 3. protection 

//wasn't working initially because the frontend wasn't sending session cookies 
const ensureAuthenticated = (req,res,next)=>{
    // console.log( 'AUTH CHECK',{
    //     isAuthenticated: req.isAuthenticated(),
    //     user:req.u
    // });
    // if(req.isAuthenticated()){
    //     return next();
    // }
    // res.status(401).json({error:'Authentication is required'});
}
//router.get('/submissions', ensureAuthenticated, getAllSubmissions); // 

//ROOT / ISS LOCALHOST:5000/API
router.get('/submissions', getAllSubmissions); //this pathway is relative to the base path set in app.js (api/submit)
// router.post('/',createSubmission);
router.get('/submissions/:id',getSubmission);
router.put('/submissions/:id',updateSubmission);


router.post('/submit',createSubmission);
router.post('/verify-doc-ownership',verifyDocOwnership);
router.post('/verify-github-ownership',verifyGithubOwnership);


module.exports = router; //export router object so your main server file can use it