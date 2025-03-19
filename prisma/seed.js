// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Sample users data
const users = [
  {
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Full-stack developer passionate about React and Node.js. I love building web applications and sharing knowledge with the community."
  },
  {
    fullName: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    bio: "UI/UX designer and front-end developer. I specialize in creating beautiful and functional user interfaces using modern web technologies."
  },
  {
    fullName: "Bob Johnson",
    username: "bobjohnson",
    email: "bob@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    bio: "Backend engineer with expertise in database optimization and API design. I enjoy solving complex problems and mentoring junior developers."
  },
  {
    fullName: "Alice Williams",
    username: "alicewilliams",
    email: "alice@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    bio: "DevOps specialist focused on CI/CD pipelines and cloud infrastructure. I help teams deliver software faster and more reliably."
  }
];

// Sample article content in EditorJS format
const createArticleContent = (titleSlug, index) => {
  return {
    time: new Date().getTime(),
    blocks: [
      {
        id: `heading-${titleSlug}`,
        type: "header",
        data: {
          text: `This is a heading for ${titleSlug}`,
          level: 2
        }
      },
      {
        id: `paragraph1-${titleSlug}`,
        type: "paragraph",
        data: {
          text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maecenas vestibulum fringilla dui nec tincidunt. Cras volutpat, risus vitae tincidunt varius, nisi erat ultricies magna, in laoreet libero lacus vitae ante.`
        }
      },
      {
        id: `image-${titleSlug}`,
        type: "image",
        data: {
          url: `https://picsum.photos/800/400?random=${index}`,
          caption: "Random image from Lorem Picsum",
          withBorder: false,
          withBackground: false,
          stretched: true
        }
      },
      {
        id: `paragraph2-${titleSlug}`,
        type: "paragraph",
        data: {
          text: `Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec at ipsum vel lorem varius ultrices. Sed eget ex risus. Fusce luctus rhoncus lectus, non dictum massa aliquam quis.`
        }
      },
      {
        id: `quote-${titleSlug}`,
        type: "quote",
        data: {
          text: "The best way to predict the future is to create it.",
          caption: "Abraham Lincoln",
          alignment: "left"
        }
      },
      {
        id: `paragraph3-${titleSlug}`,
        type: "paragraph",
        data: {
          text: `Mauris vitae augue et magna lacinia tempor. In hac habitasse platea dictumst. Phasellus eget odio eget risus accumsan semper. Ut id magna nunc. Nullam vulputate lorem vel felis faucibus, vitae feugiat massa malesuada.`
        }
      }
    ],
    version: "2.26.5"
  };
};

const articleTopics = [
  { title: "Getting Started with Next.js", category: "Web Development" },
  { title: "Understanding React Hooks", category: "React" },
  { title: "Building Responsive UIs with Tailwind CSS", category: "CSS" },
  { title: "Database Management with Prisma", category: "Database" },
  { title: "Authentication Strategies for Modern Apps", category: "Security" },
  { title: "Optimizing API Performance", category: "Backend" }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function seedUsers() {
  console.log('Seeding users...');
  
  const createdUsers = [];
  
  for (const userData of users) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email
      }
    });

    if (existingUser) {
      console.log(`User with email ${userData.email} already exists, skipping...`);
      createdUsers.push(existingUser);
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
        avatar: userData.avatar || "",
        bio: userData.bio || ""
      }
    });
    
    createdUsers.push(user);
    console.log(`Created user: ${user.fullName} with ID: ${user.id}`);
  }
  
  return createdUsers;
}

async function seedArticles(users) {
  console.log('Seeding articles...');
  
  for (let i = 0; i < articleTopics.length; i++) {
    const topic = articleTopics[i];
    const title = topic.title;
    const slug = slugify(title);
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const authorId = users[randomUserIndex].id;
    const content = createArticleContent(slug, i);
    
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: `A comprehensive guide about ${topic.category.toLowerCase()} focusing on ${title.toLowerCase()}.`,
        content,
        featuredImage: `https://picsum.photos/1200/630?random=${i}`,
        published: true,
        authorId,
        blocks: {
          create: content.blocks.map((block, index) => ({
            type: block.type,
            content: block.data,
            order: index
          }))
        }
      },
    });
    
    console.log(`Created article: ${title} with ID: ${article.id}`);
    
    // Add random number of likes to the article
    const numberOfLikes = Math.floor(Math.random() * users.length);
    const usersToLike = [...users]
      .sort(() => 0.5 - Math.random())
      .slice(0, numberOfLikes);
    
    for (const user of usersToLike) {
      try {
        await prisma.like.create({
          data: {
            userId: user.id,
            articleId: article.id
          }
        });
      } catch (error) {
        // Skip if the user already liked this article
        if (!error.message?.includes('Unique constraint failed')) {
          console.error(`Error adding like from user ${user.id} to article ${article.id}:`, error);
        }
      }
    }
    
    console.log(`Added ${numberOfLikes} likes to article: ${title}`);
  }
}

async function main() {
  try {
    console.log('Starting database seed...');
    
    // Step 1: Seed users
    const seededUsers = await seedUsers();
    
    // Step 2: Seed articles (if users exist)
    if (seededUsers.length > 0) {
      await seedArticles(seededUsers);
    } else {
      console.log('No users were seeded, skipping article seeding');
    }
    
    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the main function
main(); 