#!/usr/bin/env node
/**
 * Verify deployment has correct post count (no duplicate "faster" posts).
 * Usage: node scripts/verify-deployment.mjs [BASE_URL]
 * Example: node scripts/verify-deployment.mjs https://myblog.anikdas.me
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const endpoint = `${baseUrl.replace(/\/$/, "")}/api/verify-posts`;

async function main() {
  console.log(`Checking: ${endpoint}\n`);

  let res;
  try {
    res = await fetch(endpoint);
  } catch (err) {
    console.error("❌ Failed to fetch:", err.message);
    process.exit(1);
  }

  if (!res.ok) {
    console.error(`❌ HTTP ${res.status}`);
    process.exit(1);
  }

  const data = await res.json();

  if (data.ok) {
    console.log("✅ Verification passed");
    console.log(`   Total posts: ${data.totalPosts}`);
    console.log(`   Faster-related posts: ${data.fasterRelatedCount} (expected 1)`);
    if (data.slugs?.length) {
      console.log("   Slugs:", data.slugs.map((s) => s.slug).join(", "));
    }
    process.exit(0);
  }

  console.log("❌ Verification failed");
  if (data.duplicateSlugs?.length) {
    console.log("   Duplicate slugs:", data.duplicateSlugs.join(", "));
  }
  if (data.fasterRelatedCount > 1) {
    console.log("   Faster-related posts:", data.fasterRelated);
  }
  if (data.error) {
    console.log("   Error:", data.error);
  }
  process.exit(1);
}

main();
