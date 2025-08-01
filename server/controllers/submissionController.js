// exports.handleSubmission = (req,res) => {
//     res.status(200).json({message:'Submission received successfully'});
// }

const{cloneRepo} = require('../services/gitService');
const{gradeJavaSubmission} = require('../services/gradingService');
const{authenticateGoogle, isUserOwnerOfDoc} = require('../services/googleService');
//const{gradeSubmission} = require('../services/gradingService');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
require('dotenv').config();


const verifyGithubOwnership = async (req, res)=>{
    try{
        const {url} = req.body;
        const githubUsername = req.user?.githubUsername
        
             if(!url){
            return res.status(400).json({
                error: 'GitHub URL is required'
            });
        }

        if(!githubUsername){
            return res.status(400).json({
                success: false,
                output: '❌ No GitHub account linked. Please link your GitHub account first.'
            });
        } // Extract username from GitHub URL
        const githubUrlPattern = /github\.com\/([^\/]+)/;
        const match = url.match(githubUrlPattern);
        
        if(!match){ //could not find a username in the url
            return res.status(400).json({
                success:false,
                output: '❌ Invalid GitHub URL format'
            });
        }
        const urlUsername = match[1];
        const isOwner = githubUsername.toLowerCase() === urlUsername.toLowerCase();
        res.json({
            success:isOwner,
            output: isOwner? `✅ You are the owner of this repository (${urlUsername})` : 
                `❌ Repository belongs to ${urlUsername}, but you are ${githubUsername}`
        });
    }catch(err){
        console.error('Error verifying github username',err);
        res.status(500).json({
            error:'Failed to verify Github ownership'
        });
    }
};

const verifyDocOwnership = async (req,res)=>{
    const {documentId, userEmail} = req.body;
    const auth = await authenticateGoogle(); //should return an authenticasted Oauth2 email user

    try{
        const isOwner = await isUserOwnerOfDoc(documentId,userEmail,auth);
        res.json({
            success: isOwner,
            output: isOwner ? 'You are the owner of this document' : '❌ You are not the owner of this document'
        });    
}catch(err){
        console.error('Error verifying document ownership', err)
    }
};

const scoreSubmission = async (url, path, assignmentTitle, submissionType)=>{ //clone student's repo pasted into submission portal
        //confirm that both the submission type and url verify that it is a googledoc
        console.log('-----Score Submission---------');
        //GOOGLE DOC SUBMISSION
        //confirm the link is a google doc
        if(url.includes('docs.google.com') && submissionType === 'googledoc'){
            const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/); //extract the docId
            if (!docIdMatch) {
                throw new Error('Invalid Google Docs URL format');
            }
            const documentId = docIdMatch[1];
            console.log('Checking Google Doc with ID:', documentId);

            //CALL/POST TO PYTHON FLASK API -> send the documentId
            // const response = await axios.post('http://localhost:5001/check-doc',{
            //     documentId: documentId
            // });
            //CALL PYTHON ROUTE /CHECK-DOC-TITLE 
            const titleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/python/check-doc-title?documentId=${documentId}&assignmentName=${encodeURIComponent(assignmentTitle)}`);
            const {isCorrectDoc, docTitle} = titleResponse.data;
            if(!isCorrectDoc){
                return {
                    score: 0,
                    output: `❌ Document title "${docTitle}" does not match current assignment "${assignmentTitle.substring(0,4)}"`
                }
            }

            //IF CORRECT, CALL PYTHON ROUTES /CHECK-DOC
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/python/check-doc`,{
                documentId:documentId
            });

            //RECEIVE FROM REQUEST PYTHON ROUTE REQUEST
            const{filled, foundPlaceholders} = response.data;
            //const length = foundPlaceholders.length;
            const output = filled ? 'Document completed successfully! ✅':
                                    `Document incomplete.❌`;
            return {
                score: filled ? 100 : 0,
                output: output
            };

        //GITHUB SUBMISSION
        }else if(url.includes('github.com') && submissionType === 'github'){
            console.log('github assignment');
            try{
                await cloneRepo(url,path); //returns a promise since cloneRepo is async function
            }catch(cloneError){
                console.error("Error cloning repo:",cloneError);
                throw cloneError;
            }
            return await gradeJavaSubmission(path);
        }    
};

const handleSubmission = async (req,res)=>{
    try{
        let result = {score:-100, output:''};
       // console.log(`Request from handleSubmission -> ${req.body}`);
        let {url, assignmentId,userId, submissionType} = req.body;
       const path = `./uploads/${Date.now()}`; //where repo will be cloned to locally

        //without await score returrns a promise
        //result will b
        result = await scoreSubmission(url,path,submissionType);
        //result =
        // {
        //     score:85,
        //     output:'...'
        // }

        let language = submissionType === 'github'? 'java' : 'none';

        const newSub = await prisma.submission.create({
            data: {
                url,
                language,
                score: result.score,
                assignmentId,
                userId
            }
        
        });
        //return both the submission data AND output
        res.json({
            ...newSub,
            output:result.output // add output to response
        });
        //this res.json() will return something like this 
        //   assignmentI:8
        //   languageL"java"
        //   score:50,
        //   output:.././

    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to insert submission' });
    }
};

const updateSubmission = async(req,res)=>{
    const {id} = req.params; //ID pulled from the parameters 
    const {url, assignmentId, userId, submissionType, assignmentTitle} = req.body
    //console.log('Look here', id, req.body);
    const path = `./uploads/${Date.now()}`; //where repo will be cloned to locally
    let result = {score:-100, output:''}
    result = await scoreSubmission(url,path,assignmentTitle, submissionType);
    console.log(result);
    try{
        const updated = await prisma.submission.update({
            where: {id:Number(id)},
            data: {url, assignmentId, userId, score: result.score}
        });
        res.json({
            ...updated, //using ... so the object isn't returned but all of the contents within the object is returned 
            output:result.output //add output to response
        });
    }catch(err){
        console.error('PUT /submission werror',err);
        res.status(400).json({error: 'Failed to update submission'});
    }
};


const getSubmission = async(req,res)=>{
    const {id} = req.params;

    try{
        //find the submission by id
        const submission = await prisma.submission.findUnique({
            where:{ id:Number(id)}
        });
        if(!submission){
            return res.status(404)({error:'Submission not found'});
        }
        res.json(submission);
    }catch(err){
        res.status(500).json({error: 'Server error'});
    }
};


const getAllSubmissions = async (req,res)=>{
    try{
        const submissions = await prisma.submission.findMany({
            include: {
                    user: {
                        include: {
                            section: true, //include section
                        },
                        },
                    // ...other includes if needed
                    },
        });
        res.json(submissions);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Failed to fetch'})
    }
};


module.exports = {
    verifyGithubOwnership,
    getAllSubmissions,
    verifyDocOwnership,
    handleSubmission,
    getSubmission,
    updateSubmission
};





// const createSubmission = (req,res)=>{
//     const {name,assignment, score} = req.body;

//     const newSub = {
//         id:submissions.length+1,
//         name,
//         assignment,
//         score
//     };

//     //submissions.push(newSub);
//     res.status(201).json(newSub);
// };