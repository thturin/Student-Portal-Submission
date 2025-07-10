const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const folderPath = path.join(__dirname,'../templates');

const exportAssignmentsCsv  = async(req,res) =>{
    try{
        const {assignmentId, sectionId} = req.query; //the query params from front end url 
        
        //find submissions with the same assignmentId
        let searchCriteria = {
            assignmentId:Number(assignmentId),
            user:{ sectionId : Number(sectionId)}
        };

        const submissions = await prisma.submission.findMany({
            where: searchCriteria,
            include: {user:true}
        });


        //map the school id to score
        const scoreMap = {};
        submissions.forEach(sub=>{
            //if there exists a user and schoolId for that user 
            if(sub.user && sub.user.schoolId){
                scoreMap[sub.user.schoolId]=sub.score;
            }else{
                console.log('either no user or schoolId was found');
            }
        });

        //console.log(`look here ->>>> ${ JSON.stringify(scoreMap, null, 2)}`);

        //read template csv by file name title 
        const files = fs.readdirSync(folderPath);
        const sectionName = await prisma.section.findUnique({
            where:{
                id:Number(sectionId)
            }
        });
        let fullpath = '';
        files.forEach( file=>{
            const fileName = path.basename(file);
            console.log(`LOOK HERE --> ${fileName} -  ${JSON.stringify(sectionName,null,2)}`);
            
            
            if (fileName === sectionName.name) console.log('match');
        });

        res.status(200).send(submissions);//send response 
    }catch(err){
        console.error('Error exporting assignment', err);
    }
}

module.exports = exportAssignmentsCsv;