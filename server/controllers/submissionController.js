// exports.handleSubmission = (req,res) => {
//     res.status(200).json({message:'Submission received successfully'});
// }

const{cloneRepo} = require('../services/gitService');
const{gradeJavaSubmission} = require('../services/gradingService');
//const{gradeSubmission} = require('../services/gradingService');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const handleSubmission = async (req,res)=>{
    try{
        //const repoUrl =  `https://github.com/thturin/test_autograder.git`;
        let score = 200;
        console.log(`Request from handleSubmission -> ${req.body}`);
        let {repoUrl, assignmentId,userId} = req.body;
   
        const path = `./uploads/${Date.now()}`; //where repo will be cloned to locally
        try{
            await cloneRepo(repoUrl,path); //returns a promise since cloneRepo is async function
        }catch(cloneError){
            console.error("Error cloning repo:",cloneError);
            return res.status(500).json({ error: 'Failed to clone repo' });
        }

        score = await gradeJavaSubmission(path);
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
}


// async function handleSubmission(req,res){
//     //const{repoUrl} = req.body;

//     //const clonePath = `./uploads/${Date.now()}`;
//     const {repoUrl} = `https://github.com/thturin/test_autograder.git`;

//     try{
//         // await cloneRepo(repoUrl,clonePath);
//         // const lang = detectLang(clonePath);
//         // const score = await gradeSubmission(clonePath,lang);
//         res.json({'language':'java','score':'92'});

//     }catch(err){
//         console.err(err);
//         res.status(500).json({error:'Submission failed'});
//     }

// }


const getAllSubmissions = async (req,res)=>{
    try{
        const submissions = await prisma.submission.findMany(
            {
                include: {user:true}
            }
        );
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
    handleSubmission
};