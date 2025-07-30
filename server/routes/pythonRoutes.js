const express = require('express');
const router = express.Router();
const axios = require('axios');



//ROOT LOCALHOST:5000/api/python
router.get('/check-doc-title', async(req,res)=>{
    
    try{
        const {documentId, assignmentName} = req.query;
        if(!documentId){
                return res.status(400).json({error: 'Document ID is required'});
            }
        
            //call python flask API
            const response = await fetch (`http://localhost:5001/check-doc-title?documentId=${documentId}&assignmentName=${assignmentName}`,{
                method:'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            res.json(data); //respond with data 
    }catch(err){
            console.error('Error calling python docs title API', err.message);
            res.status(500).json({
                error: 'Failed to check document title'
            })
    }
    

})


router.post('/check-doc', async(req,res)=>{

    try{
        const {documentId} = req.body;

        if(!documentId){
            return res.status(400).json({error: 'Document ID is required'});
        }

        //call python flask API
        //request a response from python flask api, you are sending the api the documentID
        const response = await fetch('http://localhost:5001/check-doc',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                documentId: documentId //send this documentID to flask API
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // retrieve the data from API which will be 
            //     {
            // "filled": false,
            // "status": "Not Filled",
            // "foundPlaceholders": ["[Your Answer Here]"],
            // "documentId": "1VN3_lex9-c6_x99QvaeeUVs_Rfh4hDNTeQpjL7EcQlI"
        res.json(data);
    }catch(err){
        console.error('Error calling python docs API: ', err.message);
        res.status(500).json({ 
            error: 'Failed to check document',
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;