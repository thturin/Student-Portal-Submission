const express = require('express');
const router = express.Router();


//ROOT LOCALHOST:5000/api

router.get('/admin/exportAssignment',()=>console.log('exporting assignment...'));


module.exports = router;