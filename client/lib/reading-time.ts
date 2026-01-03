/**
 * Calculate reading time from HTML content
 * Works in both server and client environments
 * @param content - HTML content string
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(content: string): string {
  if (!content) return '1 min read';

  // Strip HTML tags using regex (works in both server and client)
  const text = content
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&[a-z]+;/gi, ' ') // Replace other HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Count words (split by whitespace and filter empty strings)
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  // Minimum 1 minute
  const readingTime = Math.max(1, minutes);

  return `${readingTime} min read`;
}

