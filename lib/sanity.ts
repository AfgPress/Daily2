import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Sanity client configuration
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qose90o2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: true, // Enable CDN for faster response times
  apiVersion: '2024-01-01', // Use current date for latest API features
})

// Image URL builder
const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// Types for Sanity data
export interface SanityNewsPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  description: string
  excerpt?: string
  content: any[] // Portable Text blocks
  coverImage: {
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
  author: {
    name: string
    bio: string
    avatar: {
      asset: {
        _ref: string
        _type: 'reference'
      }
    }
    role: string
    socials?: {
      twitter?: string
      linkedin?: string
    }
  }
  category: {
    name: string
    slug: {
      current: string
    }
    color?: string
  }
  tags: string[]
  datePublished: string
  dateModified?: string
  readingTime: number
  featured?: boolean
  premium?: boolean
  exclusive?: boolean
  contentType?: string
  impact?: string
  language: string
}

// GROQ query fragments for reusability
const newsPostFields = `
  _id,
  title,
  slug,
  description,
  excerpt,
  coverImage {
    asset->{
      _id,
      url
    },
    alt
  },
  author->{
    name,
    bio,
    avatar {
      asset->{
        _id,
        url
      }
    },
    role,
    socials
  },
  category->{
    name,
    slug,
    color
  },
  tags,
  datePublished,
  dateModified,
  readingTime,
  featured,
  premium,
  exclusive,
  contentType,
  impact,
  language
`

const newsPostFieldsWithContent = `
  ${newsPostFields},
  content
`

/**
 * Fetch all published news posts
 * @param limit - Number of posts to fetch (default: 50)
 * @param featured - Filter for featured posts only
 * @returns Array of news posts
 */
export async function getNewsPosts(limit: number = 50, featured?: boolean): Promise<SanityNewsPost[]> {
  try {
    const featuredFilter = featured ? ' && featured == true' : ''
    const query = `*[_type == "newsPost"${featuredFilter}] | order(datePublished desc)[0...${limit}] {
      ${newsPostFields}
    }`
    
    const posts = await client.fetch(query)
    return posts || []
  } catch (error) {
    console.warn('Sanity API unavailable, using fallback data:', error)
    return []
  }
}

/**
 * Fetch a single news post by slug
 * @param slug - The post slug
 * @returns Single news post with content
 */
export async function getNewsPostBySlug(slug: string): Promise<SanityNewsPost | null> {
  try {
    const query = `*[_type == "newsPost" && slug.current == $slug][0] {
      ${newsPostFieldsWithContent}
    }`
    
    const post = await client.fetch(query, { slug })
    return post || null
  } catch (error) {
    console.warn('Sanity API unavailable for slug fetch:', error)
    return null
  }
}

/**
 * Fetch news posts by category
 * @param categorySlug - The category slug
 * @param limit - Number of posts to fetch
 * @returns Array of news posts in the category
 */
export async function getNewsPostsByCategory(categorySlug: string, limit: number = 20): Promise<SanityNewsPost[]> {
  try {
    const query = `*[_type == "newsPost" && category->slug.current == $categorySlug] | order(datePublished desc)[0...${limit}] {
      ${newsPostFields}
    }`
    
    const posts = await client.fetch(query, { categorySlug })
    return posts || []
  } catch (error) {
    console.error('Error fetching news posts by category:', error)
    return []
  }
}

/**
 * Fetch news posts by tag
 * @param tag - The tag to filter by
 * @param limit - Number of posts to fetch
 * @returns Array of news posts with the tag
 */
export async function getNewsPostsByTag(tag: string, limit: number = 20): Promise<SanityNewsPost[]> {
  try {
    const query = `*[_type == "newsPost" && $tag in tags] | order(datePublished desc)[0...${limit}] {
      ${newsPostFields}
    }`
    
    const posts = await client.fetch(query, { tag })
    return posts || []
  } catch (error) {
    console.error('Error fetching news posts by tag:', error)
    return []
  }
}

/**
 * Fetch related news posts (same category, excluding current post)
 * @param currentPostId - ID of the current post to exclude
 * @param categorySlug - Category slug for related posts
 * @param limit - Number of related posts to fetch
 * @returns Array of related news posts
 */
export async function getRelatedNewsPosts(
  currentPostId: string, 
  categorySlug: string, 
  limit: number = 3
): Promise<SanityNewsPost[]> {
  try {
    const query = `*[_type == "newsPost" && _id != $currentPostId && category->slug.current == $categorySlug] | order(datePublished desc)[0...${limit}] {
      ${newsPostFields}
    }`
    
    const posts = await client.fetch(query, { currentPostId, categorySlug })
    return posts || []
  } catch (error) {
    console.error('Error fetching related news posts:', error)
    return []
  }
}

/**
 * Search news posts by title, description, or tags
 * @param searchTerm - The search term
 * @param limit - Number of results to return
 * @returns Array of matching news posts
 */
export async function searchNewsPosts(searchTerm: string, limit: number = 20): Promise<SanityNewsPost[]> {
  try {
    const query = `*[_type == "newsPost" && (
      title match $searchTerm + "*" ||
      description match $searchTerm + "*" ||
      $searchTerm in tags
    )] | order(datePublished desc)[0...${limit}] {
      ${newsPostFields}
    }`
    
    const posts = await client.fetch(query, { searchTerm })
    return posts || []
  } catch (error) {
    console.error('Error searching news posts:', error)
    return []
  }
}

/**
 * Fetch all categories
 * @returns Array of categories
 */
export async function getCategories() {
  try {
    const query = `*[_type == "category"] | order(name asc) {
      _id,
      name,
      slug,
      description,
      color
    }`
    
    const categories = await client.fetch(query)
    return categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Fetch all authors
 * @returns Array of authors
 */
export async function getAuthors() {
  try {
    const query = `*[_type == "author"] | order(name asc) {
      _id,
      name,
      slug,
      bio,
      avatar {
        asset->{
          _id,
          url
        }
      },
      role,
      socials
    }`
    
    const authors = await client.fetch(query)
    return authors || []
  } catch (error) {
    console.error('Error fetching authors:', error)
    return []
  }
}

/**
 * Helper function to get optimized image URL
 * @param image - Sanity image object
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized image URL
 */
export function getImageUrl(
  image: SanityImageSource, 
  width?: number, 
  height?: number
): string {
  let imageBuilder = urlFor(image).auto('format').quality(90)
  
  if (width) {
    imageBuilder = imageBuilder.width(width)
  }
  
  if (height) {
    imageBuilder = imageBuilder.height(height)
  }
  
  return imageBuilder.url()
}

/**
 * Helper function to get responsive image URLs
 * @param image - Sanity image object
 * @returns Object with different sized image URLs
 */
export function getResponsiveImageUrls(image: SanityImageSource) {
  return {
    thumbnail: getImageUrl(image, 400, 300),
    medium: getImageUrl(image, 800, 600),
    large: getImageUrl(image, 1200, 900),
    hero: getImageUrl(image, 1600, 900),
    original: urlFor(image).url()
  }
}