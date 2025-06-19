const express = require('express');//load express
const router = express.Router(); //create a new router object  (mini express app -> for handling routes)
const {createAssignment, getAllAssignments} = require('../controllers/assignmentController');

//root localhost:5000/api/assignments
router.post('/',createAssignment);
router.get('/',getAllAssignments);


module.exports = router;

