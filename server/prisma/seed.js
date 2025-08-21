const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Cleaning database...');
  
  // Delete all existing data in order (to handle foreign key constraints)
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.section.deleteMany({});
  
  console.log('✅ Database cleaned');
  
  console.log('🌱 Creating minimal seed data...');
  
  // Create 2 sections
  const section1 = await prisma.section.create({
    data: {
      name: 'AP Comp A 81',
      sectionId: '81'
    }
  });
  
  const section2 = await prisma.section.create({
    data: {
      name: 'AP Comp A 83', 
      sectionId: '83'
    }
  });

  const section3 = await prisma.section.create({
    data: {
      name: 'DE 63', 
      sectionId: '63'
    }
  });
  
  console.log('✅ Sections created');
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      schoolId: null,
      email: 'tatiana.turin@gmail.com',
      name: 'Admin TTEST',
      role: 'admin',
      githubUsername: null,
      githubId: null,
      sectionId: null, // Admin doesn't belong to a section
      password: '123'
    }
  });
  
  // Create student user
  const studentUser = await prisma.user.create({
    data: {
      schoolId: '87654321',
      email: 'tturin@schools.nyc.gov', 
      name: 'Student TEST',
      role: 'student',
      githubUsername: null,
      githubId: null,
      sectionId: section1.id, // Assign to Period 1
      password: '123'
    }
  });
  
  console.log('✅ Users created');

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });