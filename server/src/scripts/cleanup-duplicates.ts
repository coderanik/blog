import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/Blog.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
const connectionString = MONGODB_URI;

async function cleanupDuplicates() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    // Find all blog posts
    const allBlogs = await Blog.find({});
    console.log(`\n📊 Total blogs in database: ${allBlogs.length}`);

    // Group by slug (case-insensitive)
    const slugMap = new Map<string, typeof allBlogs>();
    
    for (const blog of allBlogs) {
      const slugLower = blog.slug.toLowerCase();
      if (!slugMap.has(slugLower)) {
        slugMap.set(slugLower, []);
      }
      slugMap.get(slugLower)!.push(blog);
    }

    // Find duplicates
    const duplicates: Array<{ slug: string; blogs: typeof allBlogs }> = [];
    for (const [slug, blogs] of slugMap.entries()) {
      if (blogs.length > 1) {
        duplicates.push({ slug, blogs });
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicate slugs found!');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${duplicates.length} duplicate slug(s):\n`);

    // Check specifically for "faster" duplicates
    const fasterSlugs = ['faster', 'which-is-faster-include-vs-import'];
    let fasterDuplicates: typeof allBlogs = [];
    
    for (const slug of fasterSlugs) {
      const blogs = await Blog.find({ slug: { $regex: new RegExp(`^${slug}$`, 'i') } });
      if (blogs.length > 0) {
        fasterDuplicates.push(...blogs);
      }
    }

    if (fasterDuplicates.length > 0) {
      console.log('🔍 Found "faster" related posts:');
      fasterDuplicates.forEach((blog, index) => {
        console.log(`   ${index + 1}. ID: ${blog._id}`);
        console.log(`      Slug: "${blog.slug}"`);
        console.log(`      Title: "${blog.title}"`);
        console.log(`      Status: ${blog.status}`);
        console.log(`      Created: ${blog.createdAt}`);
        console.log('');
      });

      // Keep the one with slug "which-is-faster-include-vs-import" or the most recent one
      const keepBlog = fasterDuplicates.find(b => 
        b.slug.toLowerCase() === 'which-is-faster-include-vs-import'
      ) || fasterDuplicates.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const deleteBlogs = fasterDuplicates.filter(b => b._id.toString() !== keepBlog._id.toString());

      if (deleteBlogs.length > 0) {
        console.log(`\n🗑️  Deleting ${deleteBlogs.length} duplicate(s), keeping:`);
        console.log(`   Slug: "${keepBlog.slug}"`);
        console.log(`   Title: "${keepBlog.title}"`);
        console.log('');

        for (const blog of deleteBlogs) {
          await Blog.findByIdAndDelete(blog._id);
          console.log(`   ✅ Deleted: "${blog.slug}" (${blog.title})`);
        }
      } else {
        console.log('✅ No duplicates to delete for "faster" posts');
      }
    }

    // Show all other duplicates
    for (const { slug, blogs } of duplicates) {
      if (!fasterSlugs.includes(slug.toLowerCase())) {
        console.log(`\n⚠️  Duplicate slug: "${slug}" (${blogs.length} entries)`);
        blogs.forEach((blog, index) => {
          console.log(`   ${index + 1}. ID: ${blog._id} - "${blog.title}" (${blog.status})`);
        });
      }
    }

    console.log('\n✅ Cleanup complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupDuplicates();
