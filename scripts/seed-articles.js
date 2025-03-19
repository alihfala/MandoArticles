const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
      },
      {
        id: `list-${titleSlug}`,
        type: "list",
        data: {
          style: "unordered",
          items: [
            "First important point about this topic",
            "Another critical aspect to consider",
            "Final crucial element to remember"
          ]
        }
      },
      {
        id: `paragraph4-${titleSlug}`,
        type: "paragraph",
        data: {
          text: `Sed venenatis urna quis ante eleifend, a cursus sem suscipit. Aliquam erat volutpat. Integer id nibh justo. Cras posuere tortor nec odio consequat, sit amet fermentum odio condimentum.`
        }
      },
      {
        id: `delimiter-${titleSlug}`,
        type: "delimiter",
        data: {}
      },
      {
        id: `paragraph5-${titleSlug}`,
        type: "paragraph",
        data: {
          text: `Conclusion: Aenean blandit diam et magna fermentum efficitur. Maecenas tincidunt orci felis, non accumsan erat finibus nec. Fusce rhoncus ultrices risus, id tempus dui tincidunt id.`
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
  { title: "Optimizing API Performance", category: "Backend" },
  { title: "Testing React Components", category: "Testing" },
  { title: "State Management with Redux", category: "React" },
  { title: "Building a Blog with Next.js", category: "Web Development" },
  { title: "Understanding TypeScript Generics", category: "TypeScript" },
  { title: "SEO Best Practices for Next.js", category: "SEO" },
  { title: "Deploying Next.js Apps to Vercel", category: "DevOps" },
  { title: "Real-time Applications with WebSockets", category: "Web Development" },
  { title: "GraphQL vs REST APIs", category: "API" },
  { title: "Creating Custom React Hooks", category: "React" },
  { title: "Progressive Web Apps (PWAs)", category: "Web Development" },
  { title: "Animations in React with Framer Motion", category: "UI/UX" },
  { title: "Serverless Functions with Next.js", category: "Backend" },
  { title: "Implementing Dark Mode in Your App", category: "UI/UX" },
  { title: "Securing API Routes in Next.js", category: "Security" },
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

async function main() {
  try {
    console.log('Starting to seed articles...');

    // Get all users to associate articles with
    const users = await prisma.user.findMany();
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    console.log(`Found ${users.length} users to associate articles with.`);

    // Create articles
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
      const numberOfLikes = Math.floor(Math.random() * 15);
      const usersToLike = users
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
          if (!error.message.includes('Unique constraint failed')) {
            console.error(`Error adding like from user ${user.id} to article ${article.id}:`, error);
          }
        }
      }
      
      console.log(`Added ${numberOfLikes} likes to article: ${title}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
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