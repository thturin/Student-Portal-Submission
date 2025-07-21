const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
    // Create sections first
    const section1 = await prisma.section.upsert({
        where: { sectionId: 'CS101-001' },
        update: {},
        create: {
            name: 'Computer Science 101 - Section 1',
            sectionId: 'CS101-001'
        }
    });

    const section2 = await prisma.section.upsert({
        where: { sectionId: 'CS101-002' },
        update: {},
        create: {
            name: 'Computer Science 101 - Section 2',
            sectionId: 'CS101-002'
        }
    });

    // Create users
    const users = [
        {
            name: 'Alice Adams',
            email: 'alice@student.com',
            role: 'student',
            schoolId: 'STU001',
            sectionId: section1.id
        },
        {
            name: 'Bob Smith',
            email: 'bob@student.com',
            role: 'student',
            schoolId: 'STU002',
            sectionId: section1.id
        },
        {
            name: 'Charlie Doe',
            email: 'charlie@student.com',
            role: 'student',
            schoolId: 'STU003',
            sectionId: section2.id
        },
        {
            name: 'Diana Prince',
            email: 'diana@student.com',
            role: 'student',
            schoolId: 'STU004',
            sectionId: section2.id
        },
        {
            name: 'Tatiana Turin',
            email: 'tatiana.turin@gmail.com',
            role: 'admin',
            schoolId: 'ADM001'
        }
    ];

    for (const userData of users) {
        await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData
        });
    }

    // Create assignments
    const assignment1 = await prisma.assignment.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: 'Hello World Program',
            dueDate: new Date('2025-08-15'),
            type: 'programming'
        }
    });

    const assignment2 = await prisma.assignment.upsert({
        where: { id: 2 },
        update: {},
        create: {
            title: 'Calculator Project',
            dueDate: new Date('2025-08-30'),
            type: 'programming'
        }
    });

    const assignment3 = await prisma.assignment.upsert({
        where: { id: 3 },
        update: {},
        create: {
            title: 'Data Structures Quiz',
            dueDate: new Date('2025-09-10'),
            type: 'quiz'
        }
    });

    // Get users for creating submissions
    const alice = await prisma.user.findUnique({where:{email: 'alice@student.com'}});
    const bob = await prisma.user.findUnique({where:{email: 'bob@student.com'}});
    const charlie = await prisma.user.findUnique({where:{email: 'charlie@student.com'}});
    const diana = await prisma.user.findUnique({where:{email: 'diana@student.com'}});

    // Create some sample submissions
    const submissions = [
        {
            url: 'https://github.com/alice/hello-world.git',
            language: 'javascript',
            score: 95.0,
            feedback: 'Great work! Clean code with good comments.',
            assignmentId: assignment1.id,
            userId: alice?.id
        },
        {
            url: 'https://github.com/bob/hello-world.git',
            language: 'python',
            score: 88.0,
            feedback: 'Good implementation, minor style issues.',
            assignmentId: assignment1.id,
            userId: bob?.id
        },
        {
            url: 'https://github.com/charlie/calculator.git',
            language: 'java',
            score: 92.0,
            feedback: 'Excellent use of OOP principles.',
            assignmentId: assignment2.id,
            userId: charlie?.id
        },
        {
            url: 'https://github.com/diana/calculator.git',
            language: 'python',
            score: 85.0,
            feedback: 'Good logic, could improve error handling.',
            assignmentId: assignment2.id,
            userId: diana?.id
        }
    ];

    for (const submissionData of submissions) {
        if (submissionData.userId) {
            try {
                await prisma.submission.create({
                    data: submissionData
                });
            } catch (error) {
                // If submission already exists, skip it
                if (error.code === 'P2002') {
                    console.log(`Submission already exists for user ${submissionData.userId} and assignment ${submissionData.assignmentId}`);
                } else {
                    throw error;
                }
            }
        }
    }

    console.log('🌱 Database seeded successfully!');
}


//catching error if main() cannot add users to prisma. log the error and disconnect from prisma.
main().catch((e)=>{
    console.error(e);
    process.exit(1);
}).finally(()=> prisma.$disconnect());