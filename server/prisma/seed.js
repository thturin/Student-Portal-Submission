const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


async function main(){
    await prisma.user.createMany({
        data: [
            {
                name: 'Alice Adams',
                email: 'alice@school.com',
                role: 'student'
            },
            {
                name: 'Bob Smith',
                email: 'bob@student.com',
                role: 'student'
            },
            {
                name: 'Charlie Doe',
                email: 'charlie@student.com',
                role: 'student'
            },
            {
                name: 'Tatiana Turin',
                email: 'tatiana.turin@gmail.com',
                role: 'admin'
            }
        ],
        skipDuplicates:true 
    });

    //create a submission for each student 
    const alice = await prisma.user.findUnique({where:{email: 'alice@school.com'}});
    const charlie = await prisma.user.findUnique({where:{email: 'charlie@student.com'}});
    //const bob = await prisma.user.findUnique({where:{email: 'bob@student.com'}});


    await prisma.submission.create({
        data:{
            repoUrl: 'https://github.com/thturin/test_autograder_WRONG.git',
            language: 'javascript',
            score: 100,
            assignmentId: 1, // make sure this assignment exists
            userId: alice.id
        }
    });

    await prisma.submission.create({
        data:{
            repoUrl: 'https://github.com/thturin/test_autograder.git',
            language: 'javascript',
            score: 50,
            assignmentId: 2, // make sure this assignment exists
            userId: charlie.id
        }
    });


    console.log('DATA SEEDED');
}


//catching error if main() cannot add users to prisma. log the error and disconnect from prisma.
main().catch((e)=>{
    console.error(e);
    process.exit(1);
}).finally(()=> prisma.$disconnect());