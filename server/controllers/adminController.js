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
            include: {
                        user:true,
                        assignment:true
                    }
        });


        //map the student's school id to score
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

        //find the section Id from querty params
        const files = fs.readdirSync(folderPath);
        const section = await prisma.section.findUnique({
            where:{
                id:Number(sectionId)
            }
        });
        let templateFile = '';
        files.forEach( file=>{
            const fileName = path.basename(file);
            //console.log(`LOOK HERE --> ${fileName} -  ${JSON.stringify(section,null,2)}`);
            if(fileName.includes(section.sectionId)){
                console.log('File found');
                templateFile = path.join(folderPath,file);
            };
        });
        if(!templateFile) return res.status(404).send('Template File Not found');


        //READ AND PROCESS CSV -------------------------------------------------

        const csvLines = fs.readFileSync(templateFile, 'utf8').split('\n');

        //update the assignment name
        const assignmentLineIndex = csvLines.findIndex(line=> line.trim().startsWith('Assignment:'));
        if(assignmentLineIndex!== -1){
            const parts = csvLines[assignmentLineIndex].split(',');
            parts[1] = submissions[0].assignment.title;
            csvLines[assignmentLineIndex]=parts.join(',');
            
        }

        //update the date
        const dateLineIndex = csvLines.findIndex(line=>line.trim().startsWith('Date:'));
        if(dateLineIndex!== -1){
            const parts = csvLines[dateLineIndex].split(',');
            parts[1] = formatDateMMDDYYYY(submissions[0].assignment.dueDate);
            csvLines[dateLineIndex]=parts.join(',');
        }

        //update the scores
        const updatedLines = csvLines.map(line=>{
            // \( -> find a (
            // \) -> find a )
            // (\d+) -> capturing a group of 1 or more numbers
            const match = line.match(/\((\d+)\)/);
            if(match){
                const schoolId = match[1];
                const parts = line.split(',');
                if(scoreMap[schoolId]===undefined){ //add a 0 and comment missing 
                    //insert score 
                    parts[2]=0; //AUTOMATIC 0%
                    //insert comment
                    parts[3]='no submission\r'; //assume the user did not submit anything
                }else{
                    parts[2]=scoreMap[schoolId];
                }
                
                return parts.join(',');
            }else{
                return line;
            }
        });


        //write the updated CSV to a new file 
        const exportFileName = `Jupiter_Assignment_${section.name}_export.csv`;
        const exportFilePath = path.join(folderPath,exportFileName);
        fs.writeFileSync(exportFilePath,updatedLines.join('\n'),'utf8');

        res.download(exportFilePath);
    
        //res.status(200).send(submissions);//send response 
    }catch(err){
        console.error('Error exporting assignment', err);
    }
}

function formatDateMMDDYYYY(date) { //copied and pasted
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
}

const addSampleData = async (req, res) => {
    try {
        console.log('🌱 Adding sample data...');

        // Create sections first
        const section1 = await prisma.section.upsert({
            where: { sectionId: 'AP Comp 81' },
            update: {},
            create: {
                name: 'AP Computer Science A',
                sectionId: '81',
            },
        });

        const section2 = await prisma.section.upsert({
            where: { sectionId: 'AP Comp 83' },
            update: {},
            create: {
                name: 'AP Computer Science A',
                sectionId: '83',
            },
        });

        // Create users

        const user1 = await prisma.user.upsert({
            where: { email: 'tturin@schools.nyc.gov' },
            update: {},
            create: {
                schoolId: '18457689',
                email: 'tturin@schools.nyc.gov',
                name: 'Student TEST',
                role: 'STUDENT',
                sectionId: section2.id,
                password: '123'
            },
        });

        const admin = await prisma.user.upsert({
            where: { email: 'tatiana.turin@gmail.com' },
            update: {},
            create: {
                email: 'tatiana.turin@gmail.com',
                name: 'Admin TEST',
                role: 'ADMIN',
                password:'123'
            },
        });

        // Create assignments
        const assignment1 = await prisma.assignment.create({
            data: {
                title: 'U1T1-println vs print',
                dueDate: new Date('2025-08-03'),
                type: 'googledoc',
            },
        });

        const assignment2 = await prisma.assignment.create({
            data: {
                title: 'U1T3-Mathematical Operators',
                dueDate: new Date('2025-09-30'),
                type: 'googledoc',
            },
        });

        const assignment3 = await prisma.assignment.create({
            data: {
                title: 'U1P1-Calculator',
                dueDate: new Date('2025-09-01'),
                type: 'github',
            },
        });

      

        // Get final counts
        const stats = {
            users: await prisma.user.count(),
            sections: await prisma.section.count(),
            assignments: await prisma.assignment.count(),
            submissions: await prisma.submission.count(),
        };

        res.json({
            success: true,
            message: 'Sample data added successfully!',
            stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error adding sample data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};




module.exports = {exportAssignmentsCsv,
                    addSampleData};