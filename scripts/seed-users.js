// scripts/seed-users.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const users = [
  {
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Full-stack developer passionate about React and Node.js. I love building web applications and sharing knowledge with the community."
  },
  {
    fullName: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    bio: "UI/UX designer and front-end developer. I specialize in creating beautiful and functional user interfaces using modern web technologies."
  },
  {
    fullName: "Bob Johnson",
    username: "bobjohnson",
    email: "bob@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    bio: "Backend engineer with expertise in database optimization and API design. I enjoy solving complex problems and mentoring junior developers."
  },
  {
    fullName: "Alice Williams",
    username: "alicewilliams",
    email: "alice@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    bio: "DevOps specialist focused on CI/CD pipelines and cloud infrastructure. I help teams deliver software faster and more reliably."
  },
  {
    fullName: "Charlie Brown",
    username: "charliebrown",
    email: "charlie@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    bio: "Mobile app developer with experience in React Native and Flutter. I build cross-platform applications that feel native on every device."
  },
  {
    fullName: "Diana Miller",
    username: "dianamiller",
    email: "diana@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    bio: "Data scientist specializing in machine learning and AI. I transform data into insights and build predictive models for business applications."
  },
  {
    fullName: "Ethan Davis",
    username: "ethandavis",
    email: "ethan@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    bio: "Security engineer focused on web application security. I identify vulnerabilities and implement safeguards to protect user data."
  },
  {
    fullName: "Fiona Wilson",
    username: "fionawilson",
    email: "fiona@example.com",
    password: "password123",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    bio: "Technical writer and developer advocate. I create documentation, tutorials, and educational content for developers of all skill levels."
  }
];

async function main() {
  try {
    console.log('Starting to seed users...');
    
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          email: userData.email
        }
      });

      if (existingUser) {
        console.log(`User with email ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          fullName: userData.fullName,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          image: userData.image || "",
          bio: userData.bio || ""
        }
      });
      
      console.log(`Created user: ${user.fullName} with ID: ${user.id}`);
    }

    console.log('User seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
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