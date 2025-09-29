@@ .. @@
    console.error('Error fetching news posts:', error);
    // Return empty array to prevent crashes
    return [];
 export const client = createClient({
 }
    const posts = await client.fetch(newsPostQuery);
    console.log('Fetched posts from Sanity:', posts);
    return posts;
  projectId: 'uiu9mgqs',
+  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'uiu9mgqs',
   dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
   apiVersion: '2024-01-01',
   useCdn: false,