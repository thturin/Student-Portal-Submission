// exports.handleSubmission = (req,res) => {
//     res.status(200).json({message:'Submission received successfully'});
// }

const{cloneRepo} = require('../services/gitService');
const{gradeJavaSubmission} = require('../services/gradingService');
//const{gradeSubmission} = require('../services/gradingService');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


const cloneAndScore = async (repoUrl, path)=>{ //clone student's repo pasted into submission portal
        try{
        
            await cloneRepo(repoUrl,path); //returns a promise since cloneRepo is async function
        }catch(cloneError){
            console.error("Error cloning repo:",cloneError);
            throw cloneError;
        }

        return await gradeJavaSubmission(path);
};

const handleSubmission = async (req,res)=>{
    try{
        let score = 200;
       // console.log(`Request from handleSubmission -> ${req.body}`);
        let {repoUrl, assignmentId,userId} = req.body;
       const path = `./uploads/${Date.now()}`; //where repo will be cloned to locally


        //without await score returrns a promise
        score = await cloneAndScore(repoUrl,path);
        console.log(score);

        const newSub = await prisma.submission.create({
            data: {
                repoUrl,
                language: 'java',
                score,
                assignmentId,
                userId
            }
        
        });
        //res.status(201).json(newSub);
        res.json(newSub);//follows REST protocol

    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to insert submission' });
    }
};

const updateSubmission = async(req,res)=>{
    const {id} = req.params; //ID pulled from the parameters 
    const {repoUrl, assignmentId, userId} = req.body
    console.log('Look here', id, req.body);
    const path = `./uploads/${Date.now()}`; //where repo will be cloned to locally
    
    const score = await cloneAndScore(repoUrl,path);
    console.log(score);

    try{
        const updated = await prisma.submission.update({
            where: {id:Number(id)},
            data: {repoUrl, assignmentId, userId, score}
        });
        res.json(updated);
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

const createSubmission = (req,res)=>{
    const {name,assignment, score} = req.body;

    const newSub = {
        id:submissions.length+1,
        name,
        assignment,
        score
    };

    //submissions.push(newSub);
    res.status(201).json(newSub);
};

module.exports = {
    getAllSubmissions,
    createSubmission,
    handleSubmission,
    getSubmission,
    updateSubmission
};