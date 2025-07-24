// exports.handleSubmission = (req,res) => {
//     res.status(200).json({message:'Submission received successfully'});
// }

const{cloneRepo} = require('../services/gitService');
const{gradeJavaSubmission} = require('../services/gradingService');
//const{gradeSubmission} = require('../services/gradingService');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');


const scoreSubmission = async (url, path, submissionType)=>{ //clone student's repo pasted into submission portal
        //confirm that both the submission type and url verify that it is a googledoc
        console.log('-----Score Submission---------');
        if(url.includes('docs.google.com') && submissionType === 'googledoc'){
            const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
            if (!docIdMatch) {
                throw new Error('Invalid Google Docs URL format');
            }
            const documentId = docIdMatch[1];
            console.log('Checking Google Doc with ID:', documentId);
            //CALL/POST TO PYTHON FLASK API -> send the documentId
            const response = await axios.post('http://localhost:5001/check-doc',{
                documentId: documentId
            });
            console.log(response.data);

            //RECEIVE FROM REQUEST 
            const{filled, foundPlaceholders} = response.data;
            //const length = foundPlaceholders.length;
            const output = filled ? 'Document completed successfully! ✅':
                                    `Document incomplete.❌`;
            return {
                score: filled ? 100 : 0,
                output: output
            };
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
        //res.status(201).json(newSub);
        //return both the submission data AND output
        res.json({
            ...newSub,
            output:result.output // add output to response
        });//follows REST protocol
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
    const {url, assignmentId, userId, submissionType} = req.body
    //console.log('Look here', id, req.body);
    const path = `./uploads/${Date.now()}`; //where repo will be cloned to locally
    let result = {score:-100, output:''}
    result = await scoreSubmission(url,path,submissionType);
    //console.log(result);
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

module.exports = {
    getAllSubmissions,

    handleSubmission,
    getSubmission,
    updateSubmission
};