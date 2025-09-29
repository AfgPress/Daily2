'use client';

import React, { useState, useEffect } from 'react';
import { HeroNewsSection } from '@/components/crypto/hero-news-section';
import { QuickStatsSection } from '@/components/home/quick-stats-section';
import { ModernNewsGrid } from '@/components/home/modern-news-grid';
import { MarketInsightsSection } from '@/components/home/market-insights-section';
import { TrendingTopicsSection } from '@/components/home/trending-topics-section';
import { NewsletterCTASection } from '@/components/home/newsletter-cta-section';
import { HeaderWithCardGrid } from '@/components/feature/header-with-card-grid';
import { getNewsPosts } from '@/lib/sanity';
import { latestNewsData } from '@/lib/latest-news-data';
import { featuresNewsData } from '@/lib/features-news-data';

export default function ClientHomePage() {
  const [newsPosts, setNewsPosts] = useState(latestNewsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsPosts = async () => {
      try {
        const posts = await getNewsPosts();
        if (posts && posts.length > 0) {
          setNewsPosts(posts);
        }
      } catch (error) {
        console.error('Error fetching news posts:', error);
        // Keep using mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchNewsPosts();
  }, []);

  // Map news posts for hero section (take first 3)
  const heroNews = newsPosts.slice(0, 3).map(post => ({
    id: post._id || post.id,
    title: post.title,
    excerpt: post.excerpt || post.description,
    image: post.coverImage?.asset?.url || post.image,
    category: post.category?.name || post.category,
    readTime: post.readingTime || post.readTime,
    author: {
      name: post.author?.name || post.author,
      avatar: post.author?.avatar?.asset?.url || '/placeholder-avatar.jpg'
    },
    href: `/news/${post.slug?.current || post.slug}`
  }));

  // Map news posts for modern grid (take next 6)
  const gridNews = newsPosts.slice(3, 9).map(post => ({
    id: post._id || post.id,
    title: post.title,
    excerpt: post.excerpt || post.description,
    image: post.coverImage?.asset?.url || post.image,
    category: post.category?.name || post.category,
    readTime: post.readingTime || post.readTime,
    author: post.author?.name || post.author,
    date: post.datePublished || post.date,
    href: `/news/${post.slug?.current || post.slug}`
  }));

  // Map features data for header with card grid
  const featuresCards = featuresNewsData.slice(0, 6).map(feature => ({
    id: feature.id,
    title: feature.title,
    description: feature.excerpt,
    image: feature.image,
    category: feature.category,
    href: feature.href
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero News Section */}
      <HeroNewsSection articles={heroNews} />
      
      {/* Quick Stats Section */}
      <QuickStatsSection />
      
      {/* Modern News Grid */}
      <ModernNewsGrid articles={gridNews} />
      
      {/* Market Insights Section */}
      <MarketInsightsSection />
      
      {/* Features Section */}
      <HeaderWithCardGrid 
        cards={featuresCards}
        title="Featured Guides & Analysis"
        description="Deep dives into crypto trends, market analysis, and educational content"
      />
      
      {/* Trending Topics Section */}
      <TrendingTopicsSection />
      
      {/* Newsletter CTA Section */}
      <NewsletterCTASection />
    </div>
  );
}