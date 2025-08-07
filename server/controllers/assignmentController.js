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
        const assignments = await prisma.assignment.findMany({
            select: {
                id: true,
                title: true,
                dueDate: true,
                type: true, // Include type in response
                // Add submissions if you need them:
                // submissions: true
            }
        });
        res.json(assignments);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Failed to fetch'});
    }
};

const getAssignment = async(req,res)=>{
    const {id} = req.params;
    try{
        const assignment = await prisma.assignment.findUnique({
            where:{id:Number(id)}
        });
        res.json(assignment);

    }catch(err){
        console.log('Cannot /get assignment ',err);
    }
}

const updateAssignment = async(req,res)=>{
    const {id} = req.params;
    const {title, dueDate, type} = req.body;
    try{
        const updatedAssignment = await prisma.assignment.update({
            where:{id:Number(id)},
            data:{
                title,
                dueDate: new Date(dueDate),
                type
            }
        });
        
        res.json(updatedAssignment);
    }catch(err){
        console.error('Update Assignment Error',err);
        res.status(400).json({ error: 'Failed to update assignment' });
    }
};


module.exports = {createAssignment, getAllAssignments, updateAssignment, getAssignment};