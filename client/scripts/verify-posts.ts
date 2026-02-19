/**
 * Script to verify which posts are being generated from MDX files
 * Run with: npx tsx scripts/verify-posts.ts
 */

import { getAllPostsMeta } from "../lib/content/posts"

async function verifyPosts() {
  try {
    const posts = await getAllPostsMeta()
    
    console.log(`\n📊 Total posts found: ${posts.length}\n`)
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Date: ${post.date}`)
      console.log(`   Featured: ${post.featuredPost ? 'Yes' : 'No'}`)
      console.log('')
    })

    // Check for duplicates
    const slugs = posts.map(p => p.slug.toLowerCase())
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index)
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found duplicate slugs: ${[...new Set(duplicates)].join(', ')}\n`)
    } else {
      console.log('✅ No duplicate slugs found!\n')
    }

    // Check specifically for "faster" posts
    const fasterPosts = posts.filter(p => 
      p.slug.toLowerCase().includes('faster') || 
      p.title.toLowerCase().includes('faster')
    )
    
    if (fasterPosts.length > 1) {
      console.log(`⚠️  Found ${fasterPosts.length} "faster" related posts:`)
      fasterPosts.forEach(post => {
        console.log(`   - "${post.title}" (slug: ${post.slug})`)
      })
      console.log('')
    } else if (fasterPosts.length === 1) {
      console.log(`✅ Found 1 "faster" post: "${fasterPosts[0].title}" (slug: ${fasterPosts[0].slug})\n`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

verifyPosts()
