const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


const exportAssignmentsCsv  = async(req,res) =>{
    try{
        const {filteredSubs} = req.body;
    }catch(err){
        console.error('Error exporting assignment', err);
    }
}