const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();



const createAssignment = async(req, res) =>{
    try{

        const {title, dueDate, submissions} = req.body;
        console.log(req.body);
        if(!title  || !dueDate ) return res.status(400).json({error: 'Missing required field'});

        const data = {
            title,
            dueDate: new Date(dueDate)
        };
        if(submissions){
            data.submissions=submissions
        }

        const assignment = await prisma.assignment.create({data});

        res.status(201).json(assignment);
        //res.json(assignment);
    }catch(err){
        console.error('Error creating assignment: ',err);
        res.status(500).json({ error: 'Failed to create assignment.' });

    }
};

const getAllAssignments = async(req,res)=>{
    try{
        const assignments = await prisma.assignment.findMany();
        console.log(assignments);
        res.json(assignments);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Failed to fetch'});
    }
};


module.exports = {createAssignment, getAllAssignments};