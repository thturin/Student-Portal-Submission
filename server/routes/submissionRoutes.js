const express = require('express');//load express
const router = express.Router(); //create a new router object  (mini express app -> for handling routes)
const {updateSubmission,handleSubmission, getAllSubmissions, createSubmission, getSubmission} = require('../controllers/submissionController'); //call the handleSubmission function from submissionController 

//router.post('/', handleSubmission); //when a post request is made to this router, run handleSubmission

//ROOT / ISS LOCALHOST:5000/API/SUBMIT

router.get('/submissions',getAllSubmissions); //this pathway is relative to the base path set in app.js (api/submit)
// router.post('/',createSubmission);
router.get('/submissions/:id',getSubmission);
router.put('/submissions/:id',updateSubmission);

router.post('/submit',handleSubmission);


module.exports = router; //export router object so your main server file can use it