const express = require('express');
const router = express.Router();
const axios = require('axios');

//ROOT LOCALHOST:5000/api/python

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
        console.log(data);
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