const express = require('express');
const router = express.Router();
const exportAssignmentsCsv = require('../controllers/adminController');

//ROOT LOCALHOST:5000/api/admin

router.get('/exportAssignment',exportAssignmentsCsv);


module.exports = router;