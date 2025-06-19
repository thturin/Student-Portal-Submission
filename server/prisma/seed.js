const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


async function main(){
    await prisma.user.createMany({
        data: [
            {
                name: 'Alice Admin',
                email: 'alice@school.com'
            },
            {
                name: 'Bob Student',
                email: 'bob@student.com'
            },
            {
                name: 'Charlie Student',
                email: 'charlie@student.com'
            }
        ],
        skipDuplicates:true 
    });

    console.log('USERS SEEDED');
}


//catching error if main() cannot add users to prisma. log the error and disconnect from prisma.
main().catch((e)=>{
    console.error(e);
    process.exit(1);
}).finally(()=> prisma.$disconnect());