import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'uiu9mgqs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const newsPostQuery = `*[_type == "newsPost"] | order(datePublished desc)[0...10] {
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
}`;

export async function getNewsPosts() {
  try {
    const posts = await client.fetch(newsPostQuery);
    console.log('Fetched posts from Sanity:', posts);
    return posts;
  } catch (error) {
    console.error('Error fetching news posts:', error);
    // Return empty array to prevent crashes
    return [];
  }
}