const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();



const getAllUsers = async(req,res) =>{
    try{
        const users = await prisma.user.findMany({
            //only id, name, and email will be included
            select:{
                id:true,
                name:true,
                email: true,
                role: true,
                githubUsername: true,
                githubId: true
            },
        });
        res.json(users);//sends users array as json response to whoever made http request
    }catch(err){
        console.error('Error fetching users',err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const loginUser = async (req, res)=>{
    const {email} = req.body;
    const user = await prisma.user.findUnique({where: {email}});
    if(user){
        res.json({user}); //send the user back to api 
    }else{
        res.status(404).json({error: 'User not found'});
    }
};

module.exports = {getAllUsers,loginUser};